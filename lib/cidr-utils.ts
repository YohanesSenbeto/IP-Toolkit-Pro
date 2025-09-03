/**
 * CIDR Calculation Utilities for WAN IP Management
 * Provides functions to calculate CIDR notation and subnet information
 * without requiring users to have CIDR knowledge
 */

export interface IpInfo {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  region?: string;
  interfaceName?: string;
  recommendedRouter?: string;
}

export interface RegionData {
  name: string;
  code: string;
  interfaces: InterfaceData[];
}

export interface InterfaceData {
  name: string;
  ipPoolStart: string;
  ipPoolEnd: string;
  subnetMask: string;
  defaultGateway: string;
  cidr?: number;
}

/**
 * Convert subnet mask to CIDR notation
 * @param subnetMask - Subnet mask (e.g., "255.255.255.0")
 * @returns CIDR notation (e.g., 24)
 */
export function subnetMaskToCidr(subnetMask: string): number {
  const octets = subnetMask.split('.').map(Number);
  if (octets.length !== 4) throw new Error('Invalid subnet mask format');
  
  let cidr = 0;
  for (const octet of octets) {
    if (octet === 255) {
      cidr += 8;
    } else if (octet === 254) {
      cidr += 7;
      break;
    } else if (octet === 252) {
      cidr += 6;
      break;
    } else if (octet === 248) {
      cidr += 5;
      break;
    } else if (octet === 240) {
      cidr += 4;
      break;
    } else if (octet === 224) {
      cidr += 3;
      break;
    } else if (octet === 192) {
      cidr += 2;
      break;
    } else if (octet === 128) {
      cidr += 1;
      break;
    } else if (octet === 0) {
      break;
    } else {
      throw new Error('Invalid subnet mask');
    }
  }
  return cidr;
}

/**
 * Convert CIDR notation to subnet mask
 * @param cidr - CIDR notation (e.g., 24)
 * @returns Subnet mask (e.g., "255.255.255.0")
 */
export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) throw new Error('CIDR must be between 0 and 32');
  
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(cidr, 8);
    mask.push(256 - Math.pow(2, 8 - bits));
    cidr -= bits;
  }
  return mask.join('.');
}

/**
 * Calculate network information from IP and CIDR
 * @param ipAddress - IP address (e.g., "192.168.1.1")
 * @param cidr - CIDR notation (e.g., 24)
 * @returns Complete IP information
 */
export function calculateIpInfo(ipAddress: string, cidr: number): IpInfo {
  if (!isValidIp(ipAddress)) {
    throw new Error('Invalid IP address format');
  }
  
  if (cidr < 0 || cidr > 32) {
    throw new Error('CIDR must be between 0 and 32');
  }

  const subnetMask = cidrToSubnetMask(cidr);
  const ipInt = ipToInt(ipAddress);
  const maskInt = cidrToMaskInt(cidr);
  
  const networkInt = ipInt & maskInt;
  const broadcastInt = networkInt | ~maskInt >>> 0;
  
  const networkAddress = intToIp(networkInt);
  const broadcastAddress = intToIp(broadcastInt);
  
  const firstUsableIp = cidr >= 31 ? networkAddress : intToIp(networkInt + 1);
  const lastUsableIp = cidr >= 31 ? broadcastAddress : intToIp(broadcastInt - 1);
  
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

  return {
    ipAddress,
    cidr,
    subnetMask,
    networkAddress,
    broadcastAddress,
    firstUsableIp,
    lastUsableIp,
    totalHosts,
    usableHosts,
  };
}

/**
 * Find the appropriate region and interface for a given WAN IP
 * @param ipAddress - WAN IP address to check
 * @param regions - Array of region data
 * @returns Interface and region information
 */
export function findRegionForIp(ipAddress: string, regions: RegionData[]): {
  region: string;
  interfaceName: string;
  subnetMask: string;
  defaultGateway: string;
  cidr: number;
} | null {
  const ipInt = ipToInt(ipAddress);
  
  for (const region of regions) {
    for (const interfaceData of region.interfaces) {
      const startInt = ipToInt(interfaceData.ipPoolStart);
      const endInt = ipToInt(interfaceData.ipPoolEnd);
      
      if (ipInt >= startInt && ipInt <= endInt) {
        const cidr = subnetMaskToCidr(interfaceData.subnetMask);
        return {
          region: region.name,
          interfaceName: interfaceData.name,
          subnetMask: interfaceData.subnetMask,
          defaultGateway: interfaceData.defaultGateway,
          cidr,
        };
      }
    }
  }
  
  return null;
}

/**
 * Validate IP address format
 * @param ip - IP address to validate
 * @returns true if valid IP address
 */
export function isValidIp(ip: string): boolean {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  
  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255 && octet === num.toString();
  });
}

/**
 * Convert IP address to integer
 * @param ip - IP address
 * @returns Integer representation
 */
function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Convert integer to IP address
 * @param int - Integer representation
 * @returns IP address
 */
function intToIp(int: number): string {
  return [(int >>> 24) & 0xFF, (int >>> 16) & 0xFF, (int >>> 8) & 0xFF, int & 0xFF].join('.');
}

/**
 * Convert CIDR to integer mask
 * @param cidr - CIDR notation
 * @returns Integer mask
 */
function cidrToMaskInt(cidr: number): number {
  return cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
}

/**
 * Get recommended router model based on region and interface
 * @param region - Region name
 * @param interfaceName - Interface name
 * @returns Router model recommendation
 */
export function getRouterRecommendation(region: string, interfaceName: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    'SWAAZ/SARBET': {
      'VBUI100': 'Huawei NE40E-X8A',
      'VBUI101': 'Cisco ASR 9000',
      'VBUI300': 'Huawei NE40E-X8',
      'VBUI1700': 'Juniper MX204'
    },
    'EAAZ/BOLE': {
      'VBUI100': 'Cisco ASR 9000',
      'VBUI101': 'Huawei NE40E-X8A'
    },
    'NAAZ': {
      'VBUI100': 'Huawei NE40E-X8',
      'VBUI200': 'Cisco ASR 9000',
      'VBUI1700': 'Juniper MX204'
    },
    'WAAZ': {
      'VBUI100': 'Huawei NE40E-X8A',
      'VBUI200': 'Cisco ASR 9000',
      'VBUI101': 'Juniper MX204',
      'VBUI1700': 'Huawei NE40E-X8'
    }
  };

  return recommendations[region]?.[interfaceName] || 'Standard Enterprise Router';
}

/**
 * Generate tutorial URLs for WAN IP configuration
 * @param region - Region name
 * @param interfaceName - Interface name
 * @returns Array of tutorial video URLs
 */
export function getTutorialUrls(region: string, interfaceName: string): string[] {
  const tutorials: Record<string, string[]> = {
    'SWAAZ/SARBET': [
      'https://www.youtube.com/watch?v=Huawei-SWAAZ-Config',
      'https://www.youtube.com/watch?v=WAN-IP-Setup-Tutorial'
    ],
    'EAAZ/BOLE': [
      'https://www.youtube.com/watch?v=Cisco-EAAZ-Setup',
      'https://www.youtube.com/watch?v=Enterprise-WAN-Guide'
    ],
    'NAAZ': [
      'https://www.youtube.com/watch?v=NAAZ-Network-Config',
      'https://www.youtube.com/watch?v=IP-Subnet-Basics'
    ],
    'WAAZ': [
      'https://www.youtube.com/watch?v=WAAZ-WAN-Setup',
      'https://www.youtube.com/watch?v=Router-Configuration-Guide'
    ]
  };

  return tutorials[region] || [
    'https://www.youtube.com/watch?v=WAN-IP-Basics',
    'https://www.youtube.com/watch?v=Subnet-Mask-Tutorial'
  ];
}