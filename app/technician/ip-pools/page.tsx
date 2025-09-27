"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Network,
  Users,
  Settings,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { toast } from "sonner";

interface IPPool {
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

interface IPPoolStats {
  totalPools: number;
  totalIPs: number;
  usedIPs: number;
  availableIPs: number;
  poolsByRegion: Record<string, number>;
}

export default function IPPoolsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pools, setPools] = useState<IPPool[]>([]);
  const [stats, setStats] = useState<IPPoolStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCustomerType, setSelectedCustomerType] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    regionId: '',
    customerType: 'RESIDENTIAL' as 'RESIDENTIAL' | 'ENTERPRISE',
    startIp: '',
    endIp: '',
    cidr: 24,
    description: ''
  });

  // Check if user is a technician
  useEffect(() => {
    if (session && session.user.role !== 'ETHIO_TELECOM_TECHNICIAN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch IP pools
  useEffect(() => {
    fetchIPPools();
    fetchStats();
  }, []);

  const fetchIPPools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/technician/pools');
      const data = await response.json();
      
      if (data.success) {
        setPools(data.pools);
      } else {
        toast.error('Failed to fetch IP pools');
      }
    } catch (error) {
      console.error('Error fetching IP pools:', error);
      toast.error('Error fetching IP pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/technician/pools/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreatePool = async () => {
    if (!createForm.regionId || !createForm.startIp || !createForm.endIp) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/technician/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('IP pool created successfully');
        setShowCreateForm(false);
        setCreateForm({
          regionId: '',
          customerType: 'RESIDENTIAL',
          startIp: '',
          endIp: '',
          cidr: 24,
          description: ''
        });
        fetchIPPools();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to create IP pool');
      }
    } catch (error) {
      console.error('Error creating IP pool:', error);
      toast.error('Error creating IP pool');
    }
  };

  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pool.startIp.includes(searchQuery) ||
                         pool.endIp.includes(searchQuery);
    const matchesRegion = selectedRegion === 'All' || pool.regionName === selectedRegion;
    const matchesCustomerType = selectedCustomerType === 'All' || pool.customerType === selectedCustomerType;
    
    return matchesSearch && matchesRegion && matchesCustomerType;
  });

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!session || session.user.role !== 'ETHIO_TELECOM_TECHNICIAN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need technician privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IP Pool Management</h1>
        <p className="text-muted-foreground">
          Manage IP pool ranges for different regions and customer types
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pools</p>
                  <p className="text-2xl font-bold">{stats.totalPools}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total IPs</p>
                  <p className="text-2xl font-bold">{stats.totalIPs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Used IPs</p>
                  <p className="text-2xl font-bold">{stats.usedIPs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Available IPs</p>
                  <p className="text-2xl font-bold">{stats.availableIPs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>IP Pools</span>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Pool
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Regions</SelectItem>
                <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                <SelectItem value="Bahir Dar">Bahir Dar</SelectItem>
                <SelectItem value="Hawassa">Hawassa</SelectItem>
                <SelectItem value="Mekelle">Mekelle</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IP Pools Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading IP pools...</p>
            </div>
          ) : filteredPools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No IP pools found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPools.map((pool) => {
                const usagePercentage = getUsagePercentage(pool.usedIps, pool.totalIps);
                return (
                  <Card key={pool.id}>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-6 gap-4 items-center">
                        <div>
                          <p className="font-semibold">{pool.regionName}</p>
                          <p className="text-sm text-muted-foreground">{pool.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customer Type</p>
                          <Badge variant={pool.customerType === 'ENTERPRISE' ? 'default' : 'secondary'}>
                            {pool.customerType}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">IP Range</p>
                          <p className="font-mono text-sm">{pool.startIp} - {pool.endIp}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Subnet</p>
                          <p className="font-mono text-sm">{pool.subnetMask}/{pool.cidr}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Usage</p>
                          <p className={`font-semibold ${getUsageColor(usagePercentage)}`}>
                            {pool.usedIps}/{pool.totalIps} ({usagePercentage}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gateway</p>
                          <p className="font-mono text-sm">{pool.defaultGateway}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Pool Form */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Create New IP Pool</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regionId">Region *</Label>
                  <Select value={createForm.regionId} onValueChange={(value) => setCreateForm({...createForm, regionId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="addis-ababa">Addis Ababa</SelectItem>
                      <SelectItem value="dire-dawa">Dire Dawa</SelectItem>
                      <SelectItem value="bahir-dar">Bahir Dar</SelectItem>
                      <SelectItem value="hawassa">Hawassa</SelectItem>
                      <SelectItem value="mekelle">Mekelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerType">Customer Type *</Label>
                  <Select value={createForm.customerType} onValueChange={(value: 'RESIDENTIAL' | 'ENTERPRISE') => setCreateForm({...createForm, customerType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startIp">Start IP *</Label>
                  <Input
                    id="startIp"
                    value={createForm.startIp}
                    onChange={(e) => setCreateForm({...createForm, startIp: e.target.value})}
                    placeholder="e.g., 10.239.160.1"
                  />
                </div>
                <div>
                  <Label htmlFor="endIp">End IP *</Label>
                  <Input
                    id="endIp"
                    value={createForm.endIp}
                    onChange={(e) => setCreateForm({...createForm, endIp: e.target.value})}
                    placeholder="e.g., 10.239.160.254"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidr">CIDR *</Label>
                  <Input
                    id="cidr"
                    type="number"
                    min="8"
                    max="30"
                    value={createForm.cidr}
                    onChange={(e) => setCreateForm({...createForm, cidr: parseInt(e.target.value)})}
                    placeholder="24"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="Pool description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePool}>
                  Create Pool
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

