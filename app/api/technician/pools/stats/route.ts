import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ipPoolManager } from '@/lib/ip-pool-manager';

/**
 * IP Pool Statistics API
 * 
 * This endpoint provides statistics about IP pools for technicians.
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ETHIO_TELECOM_TECHNICIAN') {
      return NextResponse.json(
        { error: 'Unauthorized - Technician access required' },
        { status: 401 }
      );
    }

    // Get IP pool statistics
    const stats = await ipPoolManager.getIPPoolStatistics();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('IP pool statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

