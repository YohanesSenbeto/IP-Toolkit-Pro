/**
 * IP Pool Manager
 * 
 * This module manages IP pool ranges for different regions and customer types.
 * It handles the logic for assigning WAN IPs based on customer type and region.
 */

export interface IPPoolRange {
  id: string;
  regionId: string;
  regionName: string;
  customerType: 'RESIDENTIAL' | 'ENTERPRISE';
  startIp: string;
  endIp: string;
  subnetMask: string;
  defaultGateway: string;
  cidr: number;
  totalIps: number;
  usedIps: number;
  availableIps: number;
  description?: string;
}

export interface WANIPAssignment {
  wanIp: string;
  subnetMask: string;
  defaultGateway: string;
  cidr: number;
  customerType: 'RESIDENTIAL' | 'ENTERPRISE';
  region: string;
}

export interface IPPoolSearchResult {
  found: boolean;
  assignment?: WANIPAssignment;
  availablePools?: IPPoolRange[];
  error?: string;
}

class IPPoolManager {
  /**
   * Calculate subnet mask from CIDR
   */
  private cidrToSubnetMask(cidr: number): string {
    const mask = (0xffffffff << (32 - cidr)) >>> 0;
    return [
      (mask >>> 24) & 0xff,
      (mask >>> 16) & 0xff,
      (mask >>> 8) & 0xff,
      mask & 0xff
    ].join('.');
  }

  /**
   * Calculate default gateway based on IP and customer type
   * For enterprise: IP - 3 or IP - 2
   * For residential: IP - 1
   */
  private calculateDefaultGateway(ip: string, customerType: 'RESIDENTIAL' | 'ENTERPRISE'): string {
    const ipParts = ip.split('.').map(Number);
    const lastOctet = ipParts[3];
    
    let gatewayLastOctet: number;
    
    if (customerType === 'ENTERPRISE') {
      // Enterprise logic: -3 or -2 from last octet
      gatewayLastOctet = lastOctet >= 3 ? lastOctet - 3 : lastOctet - 2;
    } else {
      // Residential logic: -1 from last octet
      gatewayLastOctet = lastOctet - 1;
    }
    
    // Ensure gateway is not negative
    if (gatewayLastOctet < 0) {
      gatewayLastOctet = 1; // Default to .1
    }
    
    return `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${gatewayLastOctet}`;
  }

  /**
   * Calculate CIDR from subnet mask
   */
  private subnetMaskToCidr(subnetMask: string): number {
    const mask = subnetMask.split('.').map(Number);
    let cidr = 0;
    
    for (let i = 0; i < 4; i++) {
      const octet = mask[i];
      cidr += octet.toString(2).split('1').length - 1;
    }
    
    return cidr;
  }

  /**
   * Check if IP is in range
   */
  private isIpInRange(ip: string, startIp: string, endIp: string): boolean {
    const ipNum = this.ipToNumber(ip);
    const startNum = this.ipToNumber(startIp);
    const endNum = this.ipToNumber(endIp);
    
    return ipNum >= startNum && ipNum <= endNum;
  }

  /**
   * Convert IP to number for comparison
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }

  /**
   * Find IP pool range for a given IP
   */
  async findIPPoolForIP(ip: string, customerType: 'RESIDENTIAL' | 'ENTERPRISE'): Promise<IPPoolSearchResult> {
    try {
      // Import prisma dynamically to avoid circular imports
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Get all IP pools for the customer type
      const pools = await prisma.wanIpPool.findMany({
        where: {
          // Add customer type filter when available in schema
        },
        include: {
          region: true,
          interface: true
        }
      });

      // Find matching pool
      for (const pool of pools) {
        if (this.isIpInRange(ip, pool.startIp, pool.endIp)) {
          const subnetMask = this.cidrToSubnetMask(pool.cidr);
          const defaultGateway = this.calculateDefaultGateway(ip, customerType);
          
          return {
            found: true,
            assignment: {
              wanIp: ip,
              subnetMask,
              defaultGateway,
              cidr: pool.cidr,
              customerType,
              region: pool.region.name
            }
          };
        }
      }

      // If not found, return available pools
      return {
        found: false,
  availablePools: pools.map((pool: any) => ({
          id: pool.id,
          regionId: pool.regionId,
          regionName: pool.region.name,
          customerType: customerType,
          startIp: pool.startIp,
          endIp: pool.endIp,
          subnetMask: this.cidrToSubnetMask(pool.cidr),
          defaultGateway: this.calculateDefaultGateway(pool.startIp, customerType),
          cidr: pool.cidr,
          totalIps: pool.totalIps,
          usedIps: pool.usedIps,
          availableIps: pool.availableIps,
          description: pool.description || undefined
        }))
      };

    } catch (error) {
      return {
        found: false,
        error: `Failed to find IP pool: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get available IPs in a pool
   */
  async getAvailableIPsInPool(poolId: string): Promise<string[]> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const pool = await prisma.wanIpPool.findUnique({
        where: { id: poolId },
        include: {
          region: true
        }
      });

      if (!pool) {
        throw new Error('Pool not found');
      }

      // Get assigned IPs in this pool
      const assignedIPs = await prisma.customerWanIp.findMany({
        where: {
          wanIp: {
            gte: pool.startIp,
            lte: pool.endIp
          },
          isActive: true
        },
        select: {
          wanIp: true
        }
      });

  const assignedIPSet = new Set(assignedIPs.map((ip: any) => ip.wanIp));
      const availableIPs: string[] = [];

      // Generate available IPs
      const startNum = this.ipToNumber(pool.startIp);
      const endNum = this.ipToNumber(pool.endIp);

      for (let i = startNum; i <= endNum; i++) {
        const ip = this.numberToIP(i);
        if (!assignedIPSet.has(ip)) {
          availableIPs.push(ip);
        }
      }

      return availableIPs;

    } catch (error) {
      throw new Error(`Failed to get available IPs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert number to IP
   */
  private numberToIP(num: number): string {
    return [
      (num >>> 24) & 0xff,
      (num >>> 16) & 0xff,
      (num >>> 8) & 0xff,
      num & 0xff
    ].join('.');
  }

  /**
   * Assign IP to customer
   */
  async assignIPToCustomer(
    accountNumber: string,
    customerType: 'RESIDENTIAL' | 'ENTERPRISE',
    regionId: string,
    technicianId: string
  ): Promise<WANIPAssignment> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Find available pool for the region and customer type
      const pool = await prisma.wanIpPool.findFirst({
        where: {
          regionId,
          // Add customer type filter when available
        },
        include: {
          region: true
        }
      });

      if (!pool) {
        throw new Error('No available pool found for this region and customer type');
      }

      // Get available IPs
      const availableIPs = await this.getAvailableIPsInPool(pool.id);
      
      if (availableIPs.length === 0) {
        throw new Error('No available IPs in the pool');
      }

      // Assign the first available IP
      const assignedIP = availableIPs[0];
      const subnetMask = this.cidrToSubnetMask(pool.cidr);
      const defaultGateway = this.calculateDefaultGateway(assignedIP, customerType);

      // Create customer WAN IP assignment
      await prisma.customerWanIp.create({
        data: {
          accountNumber,
          wanIp: assignedIP,
          interfaceId: pool.interfaceId,
          technicianId,
          customerType,
          serviceType: 'WAN_IP',
          isActive: true,
          assignedAt: new Date()
        }
      });

      // Update pool usage
      await prisma.wanIpPool.update({
        where: { id: pool.id },
        data: {
          usedIps: pool.usedIps + 1,
          availableIps: pool.availableIps - 1
        }
      });

      return {
        wanIp: assignedIP,
        subnetMask,
        defaultGateway,
        cidr: pool.cidr,
        customerType,
        region: pool.region.name
      };

    } catch (error) {
      throw new Error(`Failed to assign IP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get IP pool statistics
   */
  async getIPPoolStatistics(): Promise<{
    totalPools: number;
    totalIPs: number;
    usedIPs: number;
    availableIPs: number;
    poolsByRegion: Record<string, number>;
  }> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const pools = await prisma.wanIpPool.findMany({
        include: {
          region: true
        }
      });

      const stats = {
        totalPools: pools.length,
  totalIPs: pools.reduce((sum: number, pool: any) => sum + pool.totalIps, 0),
  usedIPs: pools.reduce((sum: number, pool: any) => sum + pool.usedIps, 0),
  availableIPs: pools.reduce((sum: number, pool: any) => sum + pool.availableIps, 0),
        poolsByRegion: {} as Record<string, number>
      };

      // Count pools by region
  pools.forEach((pool: any) => {
        const regionName = pool.region.name;
        stats.poolsByRegion[regionName] = (stats.poolsByRegion[regionName] || 0) + 1;
      });

      return stats;

    } catch (error) {
      throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const ipPoolManager = new IPPoolManager();

// Export class for custom instances
export { IPPoolManager };

