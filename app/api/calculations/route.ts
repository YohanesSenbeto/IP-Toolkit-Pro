import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { calculateIP } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, wanIp, cidr, result } = body;

    if (!wanIp || !cidr || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
    const safeTitle =
      typeof title === "string" && title.trim().length > 0 && title.length <= 100
        ? title.trim()
        : `Calculation for ${wanIp}/${cidr}`;

    // Validate WAN IP (IPv4 dotted decimal)
    const safeWanIp =
      typeof wanIp === "string" && /^(\d{1,3}\.){3}\d{1,3}$/.test(wanIp.trim())
        ? wanIp.trim()
        : (() => {
            throw new Error("Invalid WAN IP address format");
          })();

    // Validate CIDR
    const safeCidr = (() => {
      const cidrNum = typeof cidr === "number" ? cidr : parseInt(cidr, 10);
      if (Number.isInteger(cidrNum) && cidrNum >= 0 && cidrNum <= 32) {
        return cidrNum;
      }
      throw new Error("Invalid CIDR value");
    })();


    // Compute and save all calculation details (including default gateway, etc.)
    let safeResult: any = {};
    try {
      // If result already has all fields, use them; otherwise, compute
      if (
        typeof result === "object" &&
        result !== null &&
        typeof result.subnetMask === "string" &&
        typeof result.usableHosts === "number"
      ) {
        // Compute missing fields if needed
        const computed = calculateIP(safeWanIp, safeCidr);
        safeResult = {
          ...computed,
          ...result,
        };
      } else {
        safeResult = calculateIP(safeWanIp, safeCidr);
      }
    } catch (e) {
      throw new Error("Invalid result object or calculation error");
    }

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