import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DefaultSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { calculateIpInfo, getRouterRecommendation, getTutorialUrls, isValidIp, findRegionForIp } from '@/lib/cidr-utils';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { getPrivilegedEmails, isPrivileged as isPrivilegedEmail } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Zod schemas
const querySchema = z.object({
  ip: z.string().ip({ message: 'Invalid IP address format' }).optional(),
  unmetered: z.enum(['0','1']).optional()
});

const postSchema = z.object({
  accountNumber: z.string().regex(/^\d{9}$/,'Account number must be exactly 9 digits'),
  accessNumber: z.string().regex(/^\d{11}$/,'Access number must be exactly 11 digits').optional().or(z.literal('').optional()),
  wanIp: z.string().refine(v => isValidIp(v), 'Invalid IP address format'),
  customerName: z.string().min(1).optional(),
  location: z.string().min(1).optional()
});

// Helper function to check if an IP is within a range
function isIpInRange(ip: string, startIp: string, endIp: string): boolean {
  const ipToNumber = (ip: string) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  };
  
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(startIp);
  const endNum = ipToNumber(endIp);
  
  return ipNum >= startNum && ipNum <= endNum;
}

// Helper function to convert subnet mask to CIDR
function getCidrFromSubnetMask(subnetMask: string): number {
  const maskToCidr: { [key: string]: number } = {
    '255.255.255.252': 30,
    '255.255.255.248': 29,
    '255.255.255.240': 28,
    '255.255.255.224': 27,
    '255.255.255.192': 26,
    '255.255.255.128': 25,
    '255.255.255.0': 24,
    '255.255.254.0': 23,
    '255.255.252.0': 22,
    '255.255.248.0': 21,
    '255.255.240.0': 20,
    '255.255.224.0': 19,
    '255.255.192.0': 18,
    '255.255.128.0': 17,
    '255.255.0.0': 16,
    '255.254.0.0': 15,
    '255.252.0.0': 14,
    '255.248.0.0': 13,
    '255.240.0.0': 12,
    '255.224.0.0': 11,
    '255.192.0.0': 10,
    '255.128.0.0': 9,
    '255.0.0.0': 8
  };
  
  return maskToCidr[subnetMask] || 24; // Default to /24 if not found
}

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request.headers);
  const log = logger.child(`wan-ip-analyze:${requestId}`);
  try {
    // Server-side gating: guests 1 try; logged-in 2 tries unless social verified
    const session: DefaultSession | null = await getServerSession(authOptions);
    const userKey = (session?.user?.email || session?.user?.name || 'user').toLowerCase();
    const cookies = request.headers.get('cookie') || '';
    const readCookie = (name: string) => {
      const m = cookies.match(new RegExp(`${name}=([^;]+)`));
      return m ? decodeURIComponent(m[1]) : '';
    };
    const verified = readCookie(`social_verified_${userKey}`) === '1';
    const privilegedEmails = getPrivilegedEmails();
    const isPrivileged = isPrivilegedEmail(session?.user?.email || undefined);
    const usesKey = session ? `uses_analyzer_${userKey}` : 'trial_used';
    const usedVal = readCookie(usesKey);
    const used = parseInt(usedVal || '0', 10) || (usedVal === '1' ? 1 : 0);
    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const parsedQuery = querySchema.safeParse(rawQuery);
    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsedQuery.error.flatten() }, { status: 400 });
    }
    const unmetered = parsedQuery.data.unmetered === '1';

    // Rate limiting (server-side) independent of cookie gating; privileged users bypass.
    if (!isPrivileged) {
      const identifier = session?.user?.email ? `auth:${session.user.email}` : `ip:${request.headers.get('x-forwarded-for') || 'guest'}`;
      const rl = checkRateLimit(identifier, !!session);
      if (rl.limited) {
        return NextResponse.json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before retrying.',
          retryAfterMs: rl.resetAt - Date.now()
        }, {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rl.limit.toString(),
            'X-RateLimit-Remaining': rl.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(rl.resetAt / 1000).toString()
          }
        });
      }
    }
    if (!unmetered && !session && used >= 1) {
      return NextResponse.json({
        error: 'Trial limit reached',
        message: 'To unlock unlimited usage, please verify your account by subscribing to our YouTube channel.',
        youtube: 'https://www.youtube.com/@Yoh-Tech-Solutions'
      }, { status: 429 });
    }
    if (!unmetered && session && !verified && !isPrivileged) {
      if (used >= 2) {
        return NextResponse.json({
          error: 'Usage limit reached, verification required',
          message: 'To unlock unlimited usage, please verify your account by subscribing to our YouTube channel.',
          youtube: 'https://www.youtube.com/@Yoh-Tech-Solutions'
        }, { status: 429 });
      }
    }
    const wanIp = searchParams.get('ip');
    
    if (!wanIp) {
      return NextResponse.json(
        { error: 'IP address parameter is required' },
        { status: 400 }
      );
    }

    // Validate IP address format
    if (!isValidIp(wanIp)) {
      return NextResponse.json(
        { error: 'Invalid IP address format' },
        { status: 400 }
      );
    }

    // Get all regions and interfaces from database
    const regions = await prisma.ethioTelecomRegion.findMany({
      include: {
        interfaces: {
          where: { isActive: true },
          select: {
            name: true,
            ipPoolStart: true,
            ipPoolEnd: true,
            subnetMask: true,
            defaultGateway: true,
          }
        }
      }
    });

  if (!Array.isArray(regions)) {
    log.warn('Regions query returned non-array');
    return NextResponse.json({ error: 'Region data unavailable' }, { status: 503 });
  }
  log.debug('Regions fetched', { count: regions.length });
  if (Array.isArray(regions) && regions.length > 0) {
    const first = regions[0];
    log.trace('First region sample', { region: first?.name, interfaces: Array.isArray(first?.interfaces) ? first.interfaces.length : 0 });
  }

    // Format regions data for CIDR utils
    const regionData = regions.map(region => ({
      name: region.name,
      code: region.code ?? '',
      interfaces: region.interfaces.map(iface => ({
        name: iface.name,
        ipPoolStart: iface.ipPoolStart,
        ipPoolEnd: iface.ipPoolEnd,
        subnetMask: iface.subnetMask,
        defaultGateway: iface.defaultGateway,
      }))
    }));

    // Check if IP is in any Broadband Internet IP pool range
    let matchedInterface = null;
    let matchedRegion = null;
    
    for (const region of regions) {
      for (const iface of region.interfaces) {
        // Check if IP is within the interface's IP pool range
        if (isIpInRange(wanIp, iface.ipPoolStart, iface.ipPoolEnd)) {
          matchedInterface = iface;
          matchedRegion = region;
          break;
        }
      }
      if (matchedInterface) break;
    }

    if (!matchedInterface || !matchedRegion) {
      return NextResponse.json({
        ipAddress: wanIp,
        error: 'IP address not found in any Broadband Internet IP pool range',
        availableRegions: regions.map(r => ({
          name: r.name,
          code: r.code ?? '',
          interfaces: r.interfaces.map(i => ({
            name: i.name,
            ipPoolStart: i.ipPoolStart,
            ipPoolEnd: i.ipPoolEnd
          }))
        }))
      });
    }


    // Calculate IP information using the matched interface's subnet mask
    const cidr = getCidrFromSubnetMask(matchedInterface.subnetMask);
    const ipInfo = calculateIpInfo(wanIp, cidr);

    // Get router recommendation
    const recommendedRouter = getRouterRecommendation(matchedRegion.name, matchedInterface.name);

    // Get tutorial URLs
    const tutorialUrls = getTutorialUrls(matchedRegion.name, matchedInterface.name);

    // Check if this IP is already assigned to a customer
    const existingCustomer = await prisma.customerWanIp.findFirst({
      where: { 
        wanIp: wanIp,
        isActive: true 
      },
      include: {
        interface: {
          include: {
            region: true
          }
        }
      }
    });

    // Get related tutorial videos for this region
    let tutorialVideos: any[] = [];
    try {
      tutorialVideos = await prisma.tutorialVideos.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: matchedRegion.name, mode: 'insensitive' } },
            { content: { contains: matchedInterface.name, mode: 'insensitive' } },
            { category: { contains: 'WAN', mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          videoUrl: true
        },
        take: 5
      });
    } catch (tvErr) {
      log.warn('Tutorial video query failed', { error: (tvErr as any)?.message });
    }

    const response = {
      ipAddress: ipInfo.ipAddress,
      networkInfo: {
        cidr: ipInfo.cidr,
        subnetMask: ipInfo.subnetMask,
        networkAddress: ipInfo.networkAddress,
        broadcastAddress: ipInfo.broadcastAddress,
        firstUsableIp: ipInfo.firstUsableIp,
        lastUsableIp: ipInfo.lastUsableIp,
        totalHosts: ipInfo.totalHosts,
        usableHosts: ipInfo.usableHosts
      },
      region: {
        name: matchedRegion.name,
        code: matchedRegion.code || null
      },
      interface: {
        name: matchedInterface.name,
        ipPoolStart: matchedInterface.ipPoolStart,
        ipPoolEnd: matchedInterface.ipPoolEnd,
        subnetMask: matchedInterface.subnetMask,
        defaultGateway: matchedInterface.defaultGateway
      },
      recommendations: {
        routerModel: recommendedRouter,
        tutorials: tutorialUrls,
        tutorialVideos: tutorialVideos
      },
      status: existingCustomer ? {
        assigned: true,
        accountNumber: existingCustomer.accountNumber,
        accessNumber: existingCustomer.accessNumber,
        customerName: existingCustomer.customerName,
        location: existingCustomer.location
      } : {
        assigned: false,
        available: true
      }
    };


    // Log WAN IP analysis to history (if not error and not unmetered)
    let latestHistoryId: string | null = null;
    try {
      let userId: string | null = null;
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        userId = user?.id || null;
      }
      if (userId) {
        const lastEntry = await prisma.wanIpAnalyzerHistory.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (!lastEntry || lastEntry.wanIp !== wanIp || lastEntry.cidr !== cidr) {
          await prisma.wanIpAnalyzerHistory.create({
            data: {
              userId,
              wanIp,
              subnetMask: ipInfo.subnetMask,
              defaultGateway: matchedInterface.defaultGateway,
              cidr,
              usableHosts: ipInfo.usableHosts,
              networkAddress: ipInfo.networkAddress,
              broadcastAddress: ipInfo.broadcastAddress,
              totalHosts: ipInfo.totalHosts,
            },
          });
        }
        // Always fetch the latest entry after possible create
        const latestEntry = await prisma.wanIpAnalyzerHistory.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        latestHistoryId = latestEntry?.id || null;
      } else {
        // For guests, always save (or you can skip if you want)
        await prisma.wanIpAnalyzerHistory.create({
          data: {
            userId: null,
            wanIp,
            subnetMask: ipInfo.subnetMask,
            defaultGateway: matchedInterface.defaultGateway,
            cidr,
            usableHosts: ipInfo.usableHosts,
            networkAddress: ipInfo.networkAddress,
            broadcastAddress: ipInfo.broadcastAddress,
            totalHosts: ipInfo.totalHosts,
          },
        });
        // Always fetch the latest guest entry
        const latestEntry = await prisma.wanIpAnalyzerHistory.findFirst({
          where: { userId: null },
          orderBy: { createdAt: 'desc' },
        });
        latestHistoryId = latestEntry?.id || null;
      }
    } catch (historyError) {
  logger.error('History logging failed', { error: (historyError as any)?.message });
    }

    const res = NextResponse.json({ ...response, historyId: latestHistoryId });
    // Increment counters
    if (!unmetered && !session) {
      res.headers.append('Set-Cookie', `trial_used=1; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`);
    } else if (!unmetered && !verified && !isPrivileged) {
      const next = String(used + 1);
      res.headers.append('Set-Cookie', `uses_analyzer_${userKey}=${next}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`);
    }
    return res;

  } catch (error) {
  log.error('WAN IP analysis error', { error: (error as any)?.message, stack: (error as any)?.stack });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to register a new WAN IP assignment
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request.headers);
  const log = logger.child(`wan-ip-assign:${requestId}`);
  try {
    const rawBody = await request.json();
    const parsedBody = postSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid body', details: parsedBody.error.flatten() }, { status: 400 });
    }
    const { accountNumber, accessNumber, wanIp, customerName, location } = parsedBody.data;

    // Check if IP is already assigned
    const existingAssignment = await prisma.customerWanIp.findFirst({
      where: { 
        wanIp: wanIp,
        isActive: true 
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { 
          error: 'IP address is already assigned',
          assignedTo: {
            accountNumber: existingAssignment.accountNumber,
            customerName: existingAssignment.customerName
          }
        },
        { status: 409 }
      );
    }

    // Find the appropriate interface for this IP
    const regions = await prisma.ethioTelecomRegion.findMany({
      include: {
        interfaces: {
          where: { isActive: true }
        }
      }
    });

    const regionData = regions.map(region => ({
      name: region.name,
      code: region.code ?? '',
      interfaces: region.interfaces.map(iface => ({
        name: iface.name,
        ipPoolStart: iface.ipPoolStart,
        ipPoolEnd: iface.ipPoolEnd,
        subnetMask: iface.subnetMask,
        defaultGateway: iface.defaultGateway,
      }))
    }));

    const regionInfo = findRegionForIp(wanIp, regionData);
    
    if (!regionInfo) {
      return NextResponse.json(
        { error: 'IP address not found in any configured region' },
        { status: 404 }
      );
    }

    // Find the specific interface record
    const interfaceRecord = await prisma.ethioTelecomInterface.findFirst({
      where: {
        name: regionInfo.interfaceName,
        region: {
          name: regionInfo.region
        }
      }
    });

    if (!interfaceRecord) {
      return NextResponse.json(
        { error: 'Interface configuration not found' },
        { status: 404 }
      );
    }

    // Create new WAN IP assignment
    const newAssignment = await prisma.customerWanIp.create({
      data: {
        accountNumber,
        accessNumber,
        wanIp,
        interfaceId: interfaceRecord.id,
        customerName,
        location,
        isActive: true
      },
      include: {
        interface: {
          include: {
            region: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: newAssignment.id,
        accountNumber: newAssignment.accountNumber,
        accessNumber: newAssignment.accessNumber,
        wanIp: newAssignment.wanIp,
        customerName: newAssignment.customerName,
        location: newAssignment.location,
        region: newAssignment.interface?.region?.name || 'Unknown',
        interface: newAssignment.interface?.name || 'Unknown'
      }
    });

  } catch (error) {
    log.error('WAN IP assignment error', { error: (error as any)?.message, stack: (error as any)?.stack });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}