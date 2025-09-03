import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// IP Calculator Utility Functions
export interface IPCalculationResult {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  defaultGateway: string;
  usableHostRange: string;
  totalHosts: number;
  usableHosts: number;
  cidrNotation: string;
}

export function isValidIPAddress(ip: string): boolean {
  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipRegex.test(ip)) return false;
  
  const parts = ip.split('.').map(part => parseInt(part, 10));
  return parts.every(part => part >= 0 && part <= 255);
}

export function isValidCIDR(cidr: number): boolean {
  return cidr >= 0 && cidr <= 32;
}

export function calculateSubnetMask(cidr: number): string {
  const mask = Array(32).fill(0);
  for (let i = 0; i < cidr; i++) {
    mask[i] = 1;
  }
  
  const octets = [];
  for (let i = 0; i < 4; i++) {
    const octet = mask.slice(i * 8, (i + 1) * 8).join('');
    octets.push(parseInt(octet, 2));
  }
  
  return octets.join('.');
}

export function calculateWildcardMask(subnetMask: string): string {
  const parts = subnetMask.split('.').map(part => parseInt(part, 10));
  const wildcard = parts.map(part => 255 - part);
  return wildcard.join('.');
}

export function ipToBinary(ip: string): string {
  return ip.split('.').map(part => {
    const binary = parseInt(part, 10).toString(2);
    return binary.padStart(8, '0');
  }).join('.');
}

export function binaryToIp(binary: string): string {
  return binary.split('.').map(part => {
    return parseInt(part, 2).toString();
  }).join('.');
}

export function calculateNetworkAddress(ip: string, cidr: number): string {
  const ipParts = ip.split('.').map(part => parseInt(part, 10));
  const mask = calculateSubnetMask(cidr).split('.').map(part => parseInt(part, 10));
  
  const networkParts = ipParts.map((part, index) => part & mask[index]);
  return networkParts.join('.');
}

export function calculateBroadcastAddress(networkAddress: string, cidr: number): string {
  const networkParts = networkAddress.split('.').map(part => parseInt(part, 10));
  const wildcard = calculateWildcardMask(calculateSubnetMask(cidr)).split('.').map(part => parseInt(part, 10));
  
  const broadcastParts = networkParts.map((part, index) => part | wildcard[index]);
  return broadcastParts.join('.');
}

export function calculateDefaultGateway(networkAddress: string): string {
  const parts = networkAddress.split('.').map(part => parseInt(part, 10));
  parts[3] += 1; // First usable IP is typically the default gateway
  return parts.join('.');
}

export function calculateUsableHostRange(networkAddress: string, broadcastAddress: string): string {
  const networkParts = networkAddress.split('.').map(part => parseInt(part, 10));
  const broadcastParts = broadcastAddress.split('.').map(part => parseInt(part, 10));
  
  // First usable host is network address + 1
  const firstUsable = [...networkParts];
  firstUsable[3] += 1;
  
  // Last usable host is broadcast address - 1
  const lastUsable = [...broadcastParts];
  lastUsable[3] -= 1;
  
  return `${firstUsable.join('.')} - ${lastUsable.join('.')}`;
}

export function calculateTotalHosts(cidr: number): number {
  return Math.pow(2, 32 - cidr);
}

export function calculateUsableHosts(cidr: number): number {
  const total = calculateTotalHosts(cidr);
  return total > 2 ? total - 2 : total; // Subtract network and broadcast addresses
}

export function calculateIP(wanIp: string, cidr: number): IPCalculationResult {
  if (!isValidIPAddress(wanIp)) {
    throw new Error('Invalid IP address');
  }
  
  if (!isValidCIDR(cidr)) {
    throw new Error('Invalid CIDR notation');
  }
  
  const subnetMask = calculateSubnetMask(cidr);
  const wildcardMask = calculateWildcardMask(subnetMask);
  const networkAddress = calculateNetworkAddress(wanIp, cidr);
  const broadcastAddress = calculateBroadcastAddress(networkAddress, cidr);
  const defaultGateway = calculateDefaultGateway(networkAddress);
  const usableHostRange = calculateUsableHostRange(networkAddress, broadcastAddress);
  const totalHosts = calculateTotalHosts(cidr);
  const usableHosts = calculateUsableHosts(cidr);
  
  return {
    networkAddress,
    broadcastAddress,
    subnetMask,
    wildcardMask,
    defaultGateway,
    usableHostRange,
    totalHosts,
    usableHosts,
    cidrNotation: `${wanIp}/${cidr}`
  };
}
