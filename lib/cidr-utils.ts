/**
 * Facade & region utilities. Use ./ip-calculations for pure math.
 */
import { subnetMaskToCidr, isValidIp, type IpInfo, calculateIpInfo } from './ip-calculations';
export { subnetMaskToCidr, isValidIp, calculateIpInfo };
export type { IpInfo };

export interface RegionData { name: string; code: string; interfaces: InterfaceData[]; }
export interface InterfaceData { name: string; ipPoolStart: string; ipPoolEnd: string; subnetMask: string; defaultGateway: string; cidr?: number; }

export function findRegionForIp(ipAddress: string, regions: RegionData[]): { region: string; interfaceName: string; subnetMask: string; defaultGateway: string; cidr: number; } | null {
  const ipToInt = (ip: string) => ip.split('.').reduce((acc, o) => (acc << 8) + parseInt(o,10), 0) >>> 0;
  const ipInt = ipToInt(ipAddress);
  for (const region of regions) {
    for (const iface of region.interfaces) {
      const startInt = ipToInt(iface.ipPoolStart);
      const endInt = ipToInt(iface.ipPoolEnd);
      if (ipInt >= startInt && ipInt <= endInt) {
        return {
          region: region.name,
          interfaceName: iface.name,
          subnetMask: iface.subnetMask,
          defaultGateway: iface.defaultGateway,
          cidr: subnetMaskToCidr(iface.subnetMask)
        };
      }
    }
  }
  return null;
}

export function getRouterRecommendation(region: string, interfaceName: string): string {
  const map: Record<string, Record<string, string>> = {
    'SWAAZ/SARBET': { 'VBUI100': 'Huawei NE40E-X8A', 'VBUI101': 'Cisco ASR 9000', 'VBUI300': 'Huawei NE40E-X8', 'VBUI1700': 'Juniper MX204' },
    'EAAZ/BOLE': { 'VBUI100': 'Cisco ASR 9000', 'VBUI101': 'Huawei NE40E-X8A' },
    'NAAZ': { 'VBUI100': 'Huawei NE40E-X8', 'VBUI200': 'Cisco ASR 9000', 'VBUI1700': 'Juniper MX204' },
    'WAAZ': { 'VBUI100': 'Huawei NE40E-X8A', 'VBUI200': 'Cisco ASR 9000', 'VBUI101': 'Juniper MX204', 'VBUI1700': 'Huawei NE40E-X8' }
  };
  return map[region]?.[interfaceName] || 'Standard Enterprise Router';
}

export function getTutorialUrls(region: string, interfaceName: string): string[] {
  const tutorials: Record<string, string[]> = {
    'SWAAZ/SARBET': [ 'https://www.youtube.com/watch?v=Huawei-SWAAZ-Config', 'https://www.youtube.com/watch?v=WAN-IP-Setup-Tutorial' ],
    'EAAZ/BOLE': [ 'https://www.youtube.com/watch?v=Cisco-EAAZ-Setup', 'https://www.youtube.com/watch?v=Enterprise-WAN-Guide' ],
    'NAAZ': [ 'https://www.youtube.com/watch?v=NAAZ-Network-Config', 'https://www.youtube.com/watch?v=IP-Subnet-Basics' ],
    'WAAZ': [ 'https://www.youtube.com/watch?v=WAAZ-WAN-Setup', 'https://www.youtube.com/watch?v=Router-Configuration-Guide' ]
  };
  return tutorials[region] || [ 'https://www.youtube.com/watch?v=WAN-IP-Basics', 'https://www.youtube.com/watch?v=Subnet-Mask-Tutorial' ];
}