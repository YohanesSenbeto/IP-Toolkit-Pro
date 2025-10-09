
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidIp } from "@/lib/cidr-utils";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip");
  if (!ip || !isValidIp(ip)) {
    return NextResponse.json({ error: "Invalid or missing IP address" }, { status: 400 });
  }

  // Helper to convert IP to integer
  function ipToInt(ip: string): number {
    return ip.split('.').reduce((acc: number, octet: string) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }
  const ipInt = ipToInt(ip);

  // Find the matching interface for the IP (case-insensitive for name)
  const allInterfaces = await prisma.ethioTelecomInterface.findMany({
    include: { region: true }
  });
  let foundInterface = null;
  for (const iface of allInterfaces) {
    const startInt = ipToInt(iface.ipPoolStart);
    const endInt = ipToInt(iface.ipPoolEnd);
    if (ipInt >= startInt && ipInt <= endInt) {
      foundInterface = iface;
      break;
    }
  }

  // Also find the pool if needed (unchanged logic)
  const pools = await prisma.wanIpPool.findMany();
  let foundPool = null;
  for (const pool of pools) {
    const startInt = ipToInt(pool.startIp);
    const endInt = ipToInt(pool.endIp);
    if (ipInt >= startInt && ipInt <= endInt) {
      foundPool = pool;
      break;
    }
  }

  if (!foundInterface && !foundPool) {
    return NextResponse.json({ error: "No matching pool or interface found for this IP" }, { status: 404 });
  }

  return NextResponse.json({
    interface: foundInterface
      ? {
          name: foundInterface.name,
          ipPoolStart: foundInterface.ipPoolStart,
          ipPoolEnd: foundInterface.ipPoolEnd,
          subnetMask: foundInterface.subnetMask,
          defaultGateway: foundInterface.defaultGateway,
          regionName: foundInterface.region?.name || null,
          regionCode: foundInterface.region?.code || null,
        }
      : null,
    pool: foundPool
      ? {
          poolName: foundPool.poolName,
          startIp: foundPool.startIp,
          endIp: foundPool.endIp,
          cidr: foundPool.cidr,
          description: foundPool.description,
        }
      : null,
  });
}
