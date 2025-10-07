import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const started = Date.now();
  try {
    // minimal db ping
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - started;
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latencyMs,
      time: new Date().toISOString(),
      version: process.env.APP_VERSION || 'dev'
    });
  } catch (e: any) {
    return NextResponse.json({
      status: 'degraded',
      db: 'error',
      error: e?.message || 'unknown',
      time: new Date().toISOString()
    }, { status: 500 });
  }
}
