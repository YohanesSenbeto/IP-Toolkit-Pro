import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ethioTelecomCRM, validateAccountNumber, validateAccessNumber } from '@/lib/crm-integration';
import { z } from 'zod';
import { sanitizePlain } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';
import { ipPoolManager } from '@/lib/ip-pool-manager';
import prisma from '@/lib/prisma';

/**
 * CRM Customer Lookup API
 * 
 * This endpoint integrates with Ethio Telecom's CRM system to fetch
 * customer information based on account number or access number.
 * 
 * Features:
 * - Account number lookup (9 digits)
 * - Access number lookup (11 digits)
 * - Service type detection (PPPOE vs WAN IP)
 * - Network configuration retrieval
 * - Router recommendations
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
    if (accountNumber && !validateAccountNumber(accountNumber)) {
      return NextResponse.json(
        { error: 'Account number must be exactly 9 digits' },
        { status: 400 }
      );
    }

    if (accessNumber && !validateAccessNumber(accessNumber)) {
      return NextResponse.json(
        { error: 'Access number must be exactly 11 digits' },
        { status: 400 }
      );
    }

    let crmResponse;

    // Try CRM lookup first
    if (accountNumber) {
      crmResponse = await ethioTelecomCRM.lookupByAccountNumber(accountNumber);
    } else if (accessNumber) {
      crmResponse = await ethioTelecomCRM.lookupByAccessNumber(accessNumber);
    }

        // If CRM lookup fails, fall back to local database
        if (!crmResponse?.success || !crmResponse.customer) {
          console.log('CRM lookup failed, falling back to local database');

          // First try VPN/Data Only customers
          const vpnCustomer = await prisma.customerWanIp.findFirst({
            where: {
              ...(accountNumber && { accountNumber }),
              ...(accessNumber && { accessNumber }),
              isActive: true,
              serviceType: 'VPN_DATA_ONLY' as const,
            },
            include: {
              technician: true,
              interface: true
            }
          });

          if (vpnCustomer) {
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
                dnsServers: ['8.8.8.8', '8.8.4.4']
              },
              technician: vpnCustomer.technician ? {
                name: vpnCustomer.technician.name,
                employeeId: vpnCustomer.technician.employeeId,
                contact: vpnCustomer.technician.email || ''
              } : null,
              assignedAt: vpnCustomer.createdAt
            });
          }

          // Search broadband customers
          const localCustomer = await prisma.customerWanIp.findFirst({
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
          },
          technician: true
        }
      });

      if (!localCustomer) {
        return NextResponse.json({
          found: false,
          message: 'Customer not found in CRM or local database',
          serviceType: 'PPPOE', // Default assumption
          customerType: 'RESIDENTIAL', // Default assumption
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

      // Transform local data to match CRM format
      const customer = {
        accountNumber: localCustomer.accountNumber,
        accessNumber: localCustomer.accessNumber,
        customerName: localCustomer.customerName,
        location: localCustomer.location,
        serviceType: localCustomer.serviceType,
        customerType: localCustomer.customerType,
        serviceStatus: 'ACTIVE'
      };

      // If customer has WAN IP, get network configuration from IP pool
      let networkConfig = null;
      if (localCustomer.serviceType === 'WAN_IP' && localCustomer.wanIp) {
        try {
          const ipPoolResult = await ipPoolManager.findIPPoolForIP(
            localCustomer.wanIp, 
            localCustomer.customerType
          );
          
          if (ipPoolResult.found && ipPoolResult.assignment) {
            networkConfig = {
              wanIp: ipPoolResult.assignment.wanIp,
              subnetMask: ipPoolResult.assignment.subnetMask,
              defaultGateway: ipPoolResult.assignment.defaultGateway,
              cidr: ipPoolResult.assignment.cidr,
              dnsServers: ['8.8.8.8', '8.8.4.4'] // Default DNS
            };
          }
        } catch (error) {
          console.error('Failed to get network config from IP pool:', error);
        }
      }

      return NextResponse.json({
        found: true,
        source: 'local_database',
        customer,
        networkConfig,
        interface: localCustomer.interface ? {
          name: localCustomer.interface.name,
          region: localCustomer.interface.region.name,
          defaultGateway: localCustomer.interface.defaultGateway,
          subnetMask: localCustomer.interface.subnetMask
        } : null,
        technician: localCustomer.technician ? {
          name: localCustomer.technician.name,
          employeeId: localCustomer.technician.employeeId,
          contact: localCustomer.technician.email || ''
        } : null,
        assignedAt: localCustomer.createdAt
      });
    }

        // CRM lookup successful
        const customer = crmResponse.customer!;

        // Handle different service types
        let networkConfig = null;
        let pppoeConfig = null;

        if (customer.serviceType === 'PPPOE') {
          // For PPPOE customers, provide credentials
          pppoeConfig = {
            username: customer.pppoeUsername || `${customer.accountNumber}@ethiotelecom.et`,
            password: customer.pppoePassword || 'default_password',
            serviceName: 'ethiotelecom',
            dnsServers: ['8.8.8.8', '8.8.4.4']
          };
        } else if (customer.serviceType === 'BROADBAND_INTERNET' || customer.serviceType === 'VPN_DATA_ONLY') {
          // For WAN IP customers, indicate they need IP assignment
          networkConfig = {
            needsAssignment: true,
            message: 'Customer requires WAN IP assignment from available pools'
          };
        }

        // Get router recommendations
        const recommendations = await ethioTelecomCRM.getRouterRecommendations(
          customer.serviceType as 'PPPOE' | 'WAN_IP',
          customer.location
        );

        return NextResponse.json({
          found: true,
          source: 'crm',
          customer,
          networkConfig,
          pppoeConfig,
          recommendations: {
            routerModel: recommendations.models[0] || 'TP-Link Archer C6',
            tutorials: recommendations.tutorials.map(url => ({
              title: 'Router Configuration Tutorial',
              description: 'Step-by-step router configuration guide',
              url
            }))
          }
        });

  } catch (error) {
    console.error('CRM customer lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update customer network configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ETHIO_TELECOM_TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized - Technician access required' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rl = checkRateLimit(`crm:network-config:${ip}`, true);
    if (rl.limited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const schema = z.object({
      accountNumber: z.string().regex(/^\d{9}$/),
      networkConfig: z.object({
        wanIp: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/).optional(),
        defaultGateway: z.string().optional(),
        subnetMask: z.string().optional(),
        notes: z.string().max(500).optional()
      })
    });

    let parsed: z.infer<typeof schema>;
    try {
      parsed = schema.parse(await request.json());
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid payload', details: e.errors?.slice(0,3) }, { status: 400 });
    }

    const networkConfig = { ...parsed.networkConfig };
    if (networkConfig.notes) networkConfig.notes = sanitizePlain(networkConfig.notes, { maxLength: 500 });

    const crmResponse = await ethioTelecomCRM.updateNetworkConfiguration(parsed.accountNumber, networkConfig);
    if (!crmResponse.success) {
      return NextResponse.json({ error: crmResponse.error || 'Failed to update CRM' }, { status: 500 });
    }

    if (networkConfig.wanIp) {
      try {
        await prisma.customerWanIp.upsert({
          where: { accountNumber: parsed.accountNumber },
          update: {
            wanIp: networkConfig.wanIp,
            customerName: crmResponse.customer?.customerName,
            location: crmResponse.customer?.location,
            updatedAt: new Date()
          },
          create: {
            accountNumber: parsed.accountNumber,
            wanIp: networkConfig.wanIp,
            customerName: crmResponse.customer?.customerName || '',
            location: crmResponse.customer?.location || '',
            isActive: true
          }
        });
      } catch (dbError) {
        console.error('Failed to update local database:', dbError);
      }
    }

    return NextResponse.json({ success: true, message: 'Network configuration updated successfully', customer: crmResponse.customer });
  } catch (error) {
    console.error('CRM network config update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
