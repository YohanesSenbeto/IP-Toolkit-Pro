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
      return NextResponse.json({ history: [] }, { status: 200 });
    }
    const history = await prisma.wanIpAnalyzerHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch WAN IP analyzer history' }, { status: 500 });
  }
}
