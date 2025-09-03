import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('accountNumber');
    const accessNumber = searchParams.get('accessNumber');

    if (!accountNumber && !accessNumber) {
      return NextResponse.json(
        { error: 'Either account number or access number is required' },
        { status: 400 }
      );
    }

    // Validate account number format (9 digits)
    if (accountNumber && !/^\d{9}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: 'Account number must be exactly 9 digits' },
        { status: 400 }
      );
    }

    // Validate access number format (11 digits)
    if (accessNumber && !/^\d{11}$/.test(accessNumber)) {
      return NextResponse.json(
        { error: 'Access number must be exactly 11 digits' },
        { status: 400 }
      );
    }

    // Search for customer WAN IP assignment
    const customerAssignment = await prisma.customerWanIp.findFirst({
      where: {
        ...(accountNumber && { accountNumber }),
        ...(accessNumber && { accessNumber }),
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

    if (!customerAssignment) {
      return NextResponse.json({
        found: false,
        message: 'No WAN IP assignment found for this customer',
        serviceType: 'PPPOE', // Default to PPPOE if no WAN IP found
        recommendations: {
          routerModel: 'TP-Link Archer C6',
          tutorials: [
            {
              title: 'PPPOE Configuration Guide',
              description: 'Step-by-step PPPOE setup for residential customers',
              url: 'https://youtube.com/pppoe-setup'
            }
          ]
        }
      });
    }

    // Determine service type based on interface
    const serviceType = customerAssignment.interface ? 'WAN IP' : 'PPPOE';

    return NextResponse.json({
      found: true,
      serviceType,
      accountNumber: customerAssignment.accountNumber,
      accessNumber: customerAssignment.accessNumber,
      customerName: customerAssignment.customerName,
      location: customerAssignment.location,
      wanIp: customerAssignment.wanIp,
      interface: customerAssignment.interface ? {
        name: customerAssignment.interface.name,
        region: customerAssignment.interface.region.name,
        defaultGateway: customerAssignment.interface.defaultGateway
      } : null,
      assignedAt: customerAssignment.createdAt
    });

  } catch (error) {
    console.error('Customer lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}