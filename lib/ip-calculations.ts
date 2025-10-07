/**
 * IP Calculation Core Module
 * Pure, stateless IPv4 network math utilities separated from higher-level
 * region/interface enrichment logic. This allows focused unit testing and
 * reuse across API routes, background jobs, and CLI tools.
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
}

/** Validate IPv4 dotted-quad string */
export function isValidIp(ip: string): boolean {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  return octets.every(o => {
    if (!/^\d+$/.test(o)) return false;
    const n = Number(o);
    return n >= 0 && n <= 255 && String(n) === o; // prevent leading zeros like '01'
  });
}

/** Convert CIDR (0-32) to subnet mask */
export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) throw new Error('CIDR must be between 0 and 32');
  const mask: number[] = [];
  let remaining = cidr;
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(remaining, 8);
    mask.push(256 - Math.pow(2, 8 - bits));
    remaining -= bits;
  }
  return mask.join('.');
}

/** Convert subnet mask string to CIDR */
export function subnetMaskToCidr(subnetMask: string): number {
  const octets = subnetMask.split('.').map(Number);
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
    throw new Error('Invalid subnet mask format');
  }
  let cidr = 0;
  for (const octet of octets) {
    if (octet === 255) {
      cidr += 8;
    } else {
      // count leading 1 bits
      let bits = 0;
      for (let b = 7; b >= 0; b--) {
        if (octet & (1 << b)) bits++; else break;
      }
      cidr += bits;
      break; // stop at first non-255
    }
  }
  return cidr;
}

/** Internal: ip string to unsigned int */
function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/** Internal: unsigned int to ip string */
function intToIp(int: number): string {
  return [
    (int >>> 24) & 0xFF,
    (int >>> 16) & 0xFF,
    (int >>> 8) & 0xFF,
    int & 0xFF
  ].join('.');
}

/** Internal: produce mask integer */
function cidrToMaskInt(cidr: number): number {
  return cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
}

/** Compute full network info for an IP + CIDR */
export function calculateIpInfo(ipAddress: string, cidr: number): IpInfo {
  if (!isValidIp(ipAddress)) throw new Error('Invalid IP address format');
  if (cidr < 0 || cidr > 32) throw new Error('CIDR must be between 0 and 32');

  const subnetMask = cidrToSubnetMask(cidr);
  const ipInt = ipToInt(ipAddress);
  const maskInt = cidrToMaskInt(cidr);

  const networkInt = ipInt & maskInt;
  const broadcastInt = networkInt | (~maskInt >>> 0);

  const networkAddress = intToIp(networkInt);
  const broadcastAddress = intToIp(broadcastInt);

  const firstUsableIp = cidr >= 31 ? networkAddress : intToIp(networkInt + 1);
  const lastUsableIp = cidr >= 31 ? broadcastAddress : intToIp(broadcastInt - 1);

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : Math.max(totalHosts - 2, 0);

  return {
    ipAddress,
    cidr,
    subnetMask,
    networkAddress,
    broadcastAddress,
    firstUsableIp,
    lastUsableIp,
    totalHosts,
    usableHosts
  };
}

/** Utility to check if an IP is inside an inclusive start-end range */
export function isIpInRange(ip: string, startIp: string, endIp: string): boolean {
  if (!isValidIp(ip) || !isValidIp(startIp) || !isValidIp(endIp)) return false;
  const n = ipToInt(ip);
  const s = ipToInt(startIp);
  const e = ipToInt(endIp);
  return n >= s && n <= e;
}

/** Given IP and subnet mask string, derive CIDR and detailed info */
export function deriveFromSubnet(ipAddress: string, subnetMask: string): IpInfo {
  const cidr = subnetMaskToCidr(subnetMask);
  return calculateIpInfo(ipAddress, cidr);
}

export const __internal = { ipToInt, intToIp, cidrToMaskInt };
