import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sanitizePlain } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * VPN/Data Only Customer Lookup API
 * 
 * This endpoint handles lookups for VPN/Data Only customers
 * who don't have traditional WAN IP assignments.
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('accountNumber');
    const accessNumber = searchParams.get('accessNumber');

    if (!accountNumber && !accessNumber) {
      return NextResponse.json(
        { error: 'Either account number or access number is required' },
        { status: 400 }
      );
    }

    // Validate input formats
    if (accountNumber && !/^\d{9}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: 'Account number must be exactly 9 digits' },
        { status: 400 }
      );
    }

    if (accessNumber && !/^\d{11}$/.test(accessNumber)) {
      return NextResponse.json(
        { error: 'Access number must be exactly 11 digits' },
        { status: 400 }
      );
    }

    // Search for VPN/Data Only customer
    const vpnCustomer = await prisma.customerWanIp.findFirst({
      where: {
        ...(accountNumber && { accountNumber }),
        ...(accessNumber && { accessNumber }),
        isActive: true,
        serviceType: 'VPN_DATA_ONLY'
      },
      include: {
        technician: true,
        interface: true
      }
    });

    if (!vpnCustomer) {
      return NextResponse.json({
        found: false,
        message: 'VPN/Data Only customer not found',
        serviceType: 'VPN_DATA_ONLY' as const,
        customerType: 'RESIDENTIAL', // Default assumption
        recommendations: {
          routerModel: 'Cisco ISR 4000 Series',
          tutorials: [
            {
              title: 'VPN Configuration Guide',
              description: 'Step-by-step VPN setup for enterprise customers',
              url: 'https://youtube.com/vpn-setup'
            }
          ]
        }
      });
    }

    return NextResponse.json({
      found: true,
      source: 'vpn_data_database',
      customer: {
        accountNumber: vpnCustomer.accountNumber,
        accessNumber: vpnCustomer.accessNumber,
        customerName: vpnCustomer.customerName,
        location: vpnCustomer.location,
        serviceType: vpnCustomer.serviceType,
        customerType: vpnCustomer.customerType,
        serviceStatus: 'ACTIVE'
      },
      networkConfig: {
        wanIp: vpnCustomer.wanIp,
        subnetMask: vpnCustomer.interface?.subnetMask || '255.255.255.0',
        defaultGateway: vpnCustomer.interface?.defaultGateway || '',
        dnsServers: ['8.8.8.8', '8.8.4.4'] // Default DNS
      },
      technician: vpnCustomer.technician ? {
        name: vpnCustomer.technician.name,
        employeeId: vpnCustomer.technician.employeeId,
        contact: vpnCustomer.technician.email || ''
      } : null,
      assignedAt: vpnCustomer.createdAt
    });

  } catch (error) {
    console.error('VPN/Data customer lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create or update VPN/Data Only customer
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ETHIO_TELECOM_TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized - Technician access required' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rl = checkRateLimit(`vpn-data-customers:create:${ip}`, true);
    if (rl.limited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const schema = z.object({
      accountNumber: z.string().regex(/^\d{9}$/),
      accessNumber: z.string().regex(/^\d{11}$/).optional().nullable(),
      customerName: z.string().min(2).max(80).optional(),
      location: z.string().min(2).max(120).optional(),
      customerType: z.enum(['RESIDENTIAL','BUSINESS']).optional(),
      wanIp: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/).optional(),
      // Additional network details optional
      subnetMask: z.string().optional(),
      defaultGateway: z.string().optional(),
      vlanId: z.string().optional(),
      networkElement: z.string().optional()
    });

    let parsed;
    try {
      parsed = schema.parse(await request.json());
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid payload', details: e.errors?.slice(0,3) }, { status: 400 });
    }

    const customerName = parsed.customerName ? sanitizePlain(parsed.customerName, { maxLength: 80 }) : 'Unknown Customer';
    const location = parsed.location ? sanitizePlain(parsed.location, { maxLength: 120 }) : 'Unknown Location';
    // Cast customerType to Prisma enum
    const customerType = (parsed.customerType || 'RESIDENTIAL') as import('@prisma/client').CustomerType;
    // Ensure wanIp is always a string
    const wanIp = parsed.wanIp ?? '';

    const vpnCustomer = await prisma.customerWanIp.upsert({
      where: { accountNumber: parsed.accountNumber },
      update: {
        accessNumber: parsed.accessNumber || undefined,
        customerName,
        location,
        customerType,
        wanIp,
        serviceType: 'VPN_DATA_ONLY' as const,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        accountNumber: parsed.accountNumber,
        accessNumber: parsed.accessNumber || undefined,
        customerName,
        location,
        customerType,
        serviceType: 'VPN_DATA_ONLY' as const,
        wanIp,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: vpnCustomer.id,
        accountNumber: vpnCustomer.accountNumber,
        accessNumber: vpnCustomer.accessNumber,
        customerName: vpnCustomer.customerName,
        location: vpnCustomer.location,
        customerType: vpnCustomer.customerType,
        serviceType: vpnCustomer.serviceType,
        wanIp: vpnCustomer.wanIp
      }
    }, { status: 201 });
  } catch (error) {
    console.error('VPN/Data customer creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
