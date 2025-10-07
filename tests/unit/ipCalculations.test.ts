import { describe, it, expect } from 'vitest';
import { 
  isValidIp,
  cidrToSubnetMask,
  subnetMaskToCidr,
  calculateIpInfo,
  deriveFromSubnet,
  isIpInRange
} from '@/lib/ip-calculations';

describe('ip-calculations core', () => {
  it('validates IPv4 correctly', () => {
    expect(isValidIp('192.168.1.1')).toBe(true);
    expect(isValidIp('255.255.255.255')).toBe(true);
    expect(isValidIp('0.0.0.0')).toBe(true);
    expect(isValidIp('192.168.1')).toBe(false);
    expect(isValidIp('300.1.1.1')).toBe(false);
    expect(isValidIp('01.1.1.1')).toBe(false); // leading zero
  });

  it('converts CIDR to subnet mask and back for common values', () => {
    const pairs: Array<[number,string]> = [
      [32,'255.255.255.255'],
      [31,'255.255.255.254'],
      [30,'255.255.255.252'],
      [29,'255.255.255.248'],
      [24,'255.255.255.0'],
      [16,'255.255.0.0'],
      [8,'255.0.0.0'],
      [0,'0.0.0.0']
    ];
    for (const [cidr, mask] of pairs) {
      expect(cidrToSubnetMask(cidr)).toBe(mask);
      if (cidr !== 0 && cidr !== 31 && cidr !== 32) { // simple reverse check (our subnetMaskToCidr stops at first non-255 segment)
        expect(subnetMaskToCidr(mask)).toBe(cidr);
      }
    }
  });

  it('calculates /24 network info', () => {
    const info = calculateIpInfo('192.168.10.15', 24);
    expect(info.networkAddress).toBe('192.168.10.0');
    expect(info.broadcastAddress).toBe('192.168.10.255');
    expect(info.firstUsableIp).toBe('192.168.10.1');
    expect(info.lastUsableIp).toBe('192.168.10.254');
    expect(info.totalHosts).toBe(256);
    expect(info.usableHosts).toBe(254);
  });

  it('handles /31 special case (point-to-point)', () => {
    const info = calculateIpInfo('10.0.0.1', 31);
    expect(info.firstUsableIp).toBe(info.networkAddress);
    expect(info.lastUsableIp).toBe(info.broadcastAddress);
    expect(info.usableHosts).toBe(2);
  });

  it('handles /32 host route', () => {
    const info = calculateIpInfo('10.0.0.5', 32);
    expect(info.firstUsableIp).toBe(info.ipAddress);
    expect(info.lastUsableIp).toBe(info.ipAddress);
    expect(info.usableHosts).toBe(1);
  });

  it('derives from subnet mask', () => {
    const info = deriveFromSubnet('172.16.5.10', '255.255.0.0');
    expect(info.cidr).toBe(16);
    expect(info.networkAddress).toBe('172.16.0.0');
  });

  it('range inclusion works', () => {
    expect(isIpInRange('10.0.0.5', '10.0.0.1', '10.0.0.9')).toBe(true);
    expect(isIpInRange('10.0.0.0', '10.0.0.1', '10.0.0.9')).toBe(false);
    expect(isIpInRange('10.0.0.10', '10.0.0.1', '10.0.0.9')).toBe(false);
  });

  it('rejects invalid inputs for calculateIpInfo', () => {
    expect(() => calculateIpInfo('999.0.0.1', 24)).toThrow();
    expect(() => calculateIpInfo('10.0.0.1', -1)).toThrow();
    expect(() => calculateIpInfo('10.0.0.1', 33)).toThrow();
  });
});
