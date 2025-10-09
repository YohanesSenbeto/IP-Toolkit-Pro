import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id || null;
    }
    if (!userId) {
      return NextResponse.json({ detail: null }, { status: 200 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const wanIp = searchParams.get('wanIp');
    let detail = null;
    if (wanIp) {
      detail = await prisma.wanIpAnalyzerHistory.findFirst({
        where: { wanIp, userId },
        select: {
          id: true,
          wanIp: true,
          subnetMask: true,
          defaultGateway: true,
          cidr: true,
          usableHosts: true,
          networkAddress: true,
          broadcastAddress: true,
          totalHosts: true,
          createdAt: true,
        },
      });
    } else if (id) {
      detail = await prisma.wanIpAnalyzerHistory.findFirst({
        where: { id, userId },
        select: {
          id: true,
          wanIp: true,
          subnetMask: true,
          defaultGateway: true,
          cidr: true,
          usableHosts: true,
          networkAddress: true,
          broadcastAddress: true,
          totalHosts: true,
          createdAt: true,
        },
      });
    } else {
      return NextResponse.json({ error: 'Missing id or wanIp parameter' }, { status: 400 });
    }
    if (!detail) {
      return NextResponse.json({ error: 'Detail not found' }, { status: 404 });
    }
    return NextResponse.json({ entry: detail });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch WAN IP analyzer history detail' }, { status: 500 });
  }
}
