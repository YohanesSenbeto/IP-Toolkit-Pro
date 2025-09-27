"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Router, Wifi, Settings } from "lucide-react";
import { toast } from "sonner";

interface RouterConfig {
  wanIp: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServers: string[];
  routerModel: string;
  configuration: {
    type: 'static' | 'pppoe';
    username?: string;
    password?: string;
  };
}

interface RouterConfigGeneratorProps {
  wanIp?: string;
  subnetMask?: string;
  defaultGateway?: string;
  dnsServers?: string[];
  onConfigGenerated?: (config: RouterConfig) => void;
}

const routerModels = [
  { value: 'tp-link-archer-c6', label: 'TP-Link Archer C6', brand: 'TP-Link' },
  { value: 'huawei-hg8245h', label: 'Huawei HG8245H', brand: 'Huawei' },
  { value: 'd-link-dir-825', label: 'D-Link DIR-825', brand: 'D-Link' },
  { value: 'netgear-nighthawk', label: 'Netgear Nighthawk', brand: 'Netgear' },
  { value: 'asus-rt-ac68u', label: 'ASUS RT-AC68U', brand: 'ASUS' },
  { value: 'generic', label: 'Generic Router', brand: 'Generic' }
];

const dnsOptions = [
  { value: 'google', label: 'Google DNS', servers: ['8.8.8.8', '8.8.4.4'] },
  { value: 'cloudflare', label: 'Cloudflare DNS', servers: ['1.1.1.1', '1.0.0.1'] },
  { value: 'ethio-telecom', label: 'Ethio Telecom DNS', servers: ['10.140.0.1', '10.140.0.2'] },
  { value: 'custom', label: 'Custom DNS', servers: [] }
];

export default function RouterConfigGenerator({
  wanIp = '',
  subnetMask = '',
  defaultGateway = '',
  dnsServers = ['8.8.8.8', '8.8.4.4'],
  onConfigGenerated
}: RouterConfigGeneratorProps) {
  const [config, setConfig] = useState<RouterConfig>({
    wanIp,
    subnetMask,
    defaultGateway,
    dnsServers,
    routerModel: 'tp-link-archer-c6',
    configuration: {
      type: 'static'
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDns, setCustomDns] = useState('');

  const handleInputChange = (field: keyof RouterConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDnsChange = (dnsType: string) => {
    if (dnsType === 'custom') {
      setConfig(prev => ({
        ...prev,
        dnsServers: []
      }));
    } else {
      const selectedDns = dnsOptions.find(opt => opt.value === dnsType);
      if (selectedDns) {
        setConfig(prev => ({
          ...prev,
          dnsServers: selectedDns.servers
        }));
      }
    }
  };

  const addCustomDns = () => {
    if (customDns && !config.dnsServers.includes(customDns)) {
      setConfig(prev => ({
        ...prev,
        dnsServers: [...prev.dnsServers, customDns]
      }));
      setCustomDns('');
    }
  };

  const removeDnsServer = (server: string) => {
    setConfig(prev => ({
      ...prev,
      dnsServers: prev.dnsServers.filter(s => s !== server)
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const generateConfigScript = () => {
    const selectedRouter = routerModels.find(r => r.value === config.routerModel);
    
    let script = `# Router Configuration Script
# Generated for ${selectedRouter?.label || 'Router'}
# WAN IP: ${config.wanIp}
# Subnet Mask: ${config.subnetMask}
# Default Gateway: ${config.defaultGateway}

# Network Configuration
WAN_IP="${config.wanIp}"
SUBNET_MASK="${config.subnetMask}"
DEFAULT_GATEWAY="${config.defaultGateway}"
DNS_SERVERS="${config.dnsServers.join(' ')}"

# Router-specific configuration
ROUTER_MODEL="${config.routerModel}"
CONFIG_TYPE="${config.configuration.type}"

echo "Configuring router with the following settings:"
echo "WAN IP: $WAN_IP"
echo "Subnet Mask: $SUBNET_MASK"
echo "Default Gateway: $DEFAULT_GATEWAY"
echo "DNS Servers: $DNS_SERVERS"
echo "Configuration Type: $CONFIG_TYPE"

# Add router-specific commands here
# This script should be customized based on the router model
`;

    return script;
  };

  const downloadConfig = () => {
    const script = generateConfigScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `router-config-${config.routerModel}-${Date.now()}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration script downloaded');
  };

  const handleGenerate = () => {
    if (!config.wanIp || !config.subnetMask || !config.defaultGateway) {
      toast.error('Please fill in all required network configuration fields');
      return;
    }

    if (config.dnsServers.length === 0) {
      toast.error('Please add at least one DNS server');
      return;
    }

    onConfigGenerated?.(config);
    toast.success('Router configuration generated successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Router Configuration Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Configuration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wanIp">WAN IP Address *</Label>
              <Input
                id="wanIp"
                value={config.wanIp}
                onChange={(e) => handleInputChange('wanIp', e.target.value)}
                placeholder="e.g., 197.156.64.1"
              />
            </div>
            <div>
              <Label htmlFor="subnetMask">Subnet Mask *</Label>
              <Input
                id="subnetMask"
                value={config.subnetMask}
                onChange={(e) => handleInputChange('subnetMask', e.target.value)}
                placeholder="e.g., 255.255.255.0"
              />
            </div>
            <div>
              <Label htmlFor="defaultGateway">Default Gateway *</Label>
              <Input
                id="defaultGateway"
                value={config.defaultGateway}
                onChange={(e) => handleInputChange('defaultGateway', e.target.value)}
                placeholder="e.g., 197.156.64.1"
              />
            </div>
            <div>
              <Label htmlFor="routerModel">Router Model</Label>
              <Select value={config.routerModel} onValueChange={(value) => handleInputChange('routerModel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select router model" />
                </SelectTrigger>
                <SelectContent>
                  {routerModels.map((router) => (
                    <SelectItem key={router.value} value={router.value}>
                      {router.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DNS Configuration */}
          <div>
            <Label>DNS Servers</Label>
            <div className="space-y-2">
              <Select onValueChange={handleDnsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select DNS provider" />
                </SelectTrigger>
                <SelectContent>
                  {dnsOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Input
                  value={customDns}
                  onChange={(e) => setCustomDns(e.target.value)}
                  placeholder="Custom DNS server (e.g., 8.8.8.8)"
                />
                <Button onClick={addCustomDns} variant="outline" size="sm">
                  Add
                </Button>
              </div>

              {config.dnsServers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.dnsServers.map((server, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {server}
                      <button
                        onClick={() => removeDnsServer(server)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Configuration Type */}
          <div>
            <Label>Configuration Type</Label>
            <Select 
              value={config.configuration.type} 
              onValueChange={(value: 'static' | 'pppoe') => 
                handleInputChange('configuration', { ...config.configuration, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static IP Configuration</SelectItem>
                <SelectItem value="pppoe">PPPOE Configuration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PPPOE Credentials (if selected) */}
          {config.configuration.type === 'pppoe' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pppoeUsername">PPPOE Username</Label>
                <Input
                  id="pppoeUsername"
                  value={config.configuration.username || ''}
                  onChange={(e) => handleInputChange('configuration', { 
                    ...config.configuration, 
                    username: e.target.value 
                  })}
                  placeholder="PPPOE username"
                />
              </div>
              <div>
                <Label htmlFor="pppoePassword">PPPOE Password</Label>
                <Input
                  id="pppoePassword"
                  type="password"
                  value={config.configuration.password || ''}
                  onChange={(e) => handleInputChange('configuration', { 
                    ...config.configuration, 
                    password: e.target.value 
                  })}
                  placeholder="PPPOE password"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Generate Configuration
            </Button>
            <Button onClick={downloadConfig} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Script
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {config.wanIp && config.subnetMask && config.defaultGateway && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>WAN IP:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded">{config.wanIp}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(config.wanIp)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Subnet Mask:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded">{config.subnetMask}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(config.subnetMask)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Default Gateway:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded">{config.defaultGateway}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(config.defaultGateway)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span>DNS Servers:</span>
                  <div className="mt-1 space-y-1">
                    {config.dnsServers.map((server, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{server}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(server)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Router Model:</span>
                  <Badge variant="outline">
                    {routerModels.find(r => r.value === config.routerModel)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Config Type:</span>
                  <Badge variant={config.configuration.type === 'static' ? 'default' : 'secondary'}>
                    {config.configuration.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

