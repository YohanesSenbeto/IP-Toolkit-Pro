import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { calculateIP } from '@/lib/utils';
import { z } from 'zod';
import { sanitizePlain, pickAllowed } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schema = z.object({
      title: z.string().min(1).max(100).optional(),
      wanIp: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/),
      cidr: z.union([z.number().int().min(0).max(32), z.string().regex(/^([0-9]|[12][0-9]|3[0-2])$/)]),
      result: z.object({
        subnetMask: z.string().optional(),
        usableHosts: z.number().optional(),
        networkAddress: z.string().optional(),
        broadcastAddress: z.string().optional(),
        firstUsableIp: z.string().optional(),
        lastUsableIp: z.string().optional()
      }).partial().optional()
    });

    let parsed: z.infer<typeof schema>;
    try {
      const raw = await request.json();
      parsed = schema.parse(pickAllowed(raw, ['title','wanIp','cidr','result'] as const));
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid payload', details: e.errors?.slice(0,3) }, { status: 400 });
    }
    const { title, wanIp, cidr, result } = parsed;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save calculation to database, matching schema and addressing all weaknesses
    // 1. Input validation and sanitization
    // 2. Only allow/sanitize expected result keys
    // 3. Use user connect for relation
    // 4. Throw on invalid input
    // 5. No sensitive data exposure

    // Validate and sanitize title
    const safeTitle = title ? sanitizePlain(title, { maxLength: 100 }) : `Calculation for ${wanIp}/${cidr}`;

    // Validate WAN IP (IPv4 dotted decimal)
    const safeWanIp = wanIp.trim();

    // Validate CIDR
    const safeCidr = typeof cidr === 'number' ? cidr : parseInt(cidr, 10);


    // Compute and save all calculation details (including default gateway, etc.)
    // Always recompute server-side to avoid trusting client result values
    const computed = calculateIP(safeWanIp, safeCidr);
    // If client sent partial overrides (allowed keys only), merge strictly
    const allowedResultKeys = ['subnetMask','usableHosts','networkAddress','broadcastAddress','firstUsableIp','lastUsableIp'] as const;
    const overrides: Record<string, any> = {};
    if (result && typeof result === 'object') {
      for (const k of allowedResultKeys) {
        if (Object.prototype.hasOwnProperty.call(result, k)) {
          overrides[k] = (result as any)[k];
        }
      }
    }
    const safeResult = { ...computed, ...overrides };

    const calculation = await prisma.calculation.create({
      data: {
        title: safeTitle,
        wanIp: safeWanIp,
        cidr: safeCidr,
        result: safeResult,
        user: {
          connect: { id: user.id }
        }
      },
    });

    return NextResponse.json({ 
      message: 'Calculation saved successfully', 
      calculation 
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving calculation:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for id param
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      // Fetch single calculation by id (must belong to user)
      const calculation = await prisma.calculation.findFirst({
        where: { id, userId: user.id },
      });
      if (!calculation) {
        return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
      }
      return NextResponse.json({ calculation });
    }

    // Get calculations for user
    const calculations = await prisma.calculation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 calculations
    });
    return NextResponse.json({ calculations });
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}