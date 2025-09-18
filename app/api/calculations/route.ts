import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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

    // Validate and sanitize result object
    const safeResult = (() => {
      if (
        typeof result === "object" &&
        result !== null &&
        typeof result.subnetMask === "string" &&
        typeof result.usableHosts === "number"
      ) {
        // Only allow expected keys (subnetMask, usableHosts, and optionally others)
        // Remove any keys that are not allowed by the schema
        const allowedKeys = ["subnetMask", "usableHosts"];
        const sanitized: any = {};
        for (const key of allowedKeys) {
          sanitized[key] = result[key];
        }
        // Optionally, allow extra keys if schema allows (add here)
        // e.g. if (typeof result.networkAddress === "string") sanitized.networkAddress = result.networkAddress;
        return sanitized;
      }
      throw new Error("Invalid result object");
    })();

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