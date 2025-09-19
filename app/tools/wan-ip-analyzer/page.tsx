"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Router, BookOpen, CheckCircle, AlertCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WanIpAnalysis {
  ip: string;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  region: {
    name: string;
    code: string;
    description: string;
  };
  interface: {
    name: string;
    type: string;
    defaultGateway: string;
  };
  routerRecommendations: Array<{
    model: string;
    description: string;
    price: string;
  }>;
  tutorials: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  knowledgeBase: Array<{
    title: string;
    slug: string;
    description: string;
  }>;
  isAssigned: boolean;
  assignedCustomer?: {
    customerName: string;
    accountNumber: string;
    location: string;
  };
}

export default function WanIpAnalyzerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showGate, setShowGate] = useState(false);
  const [gateReason, setGateReason] = useState<string | null>(null);
  const [gateChecks, setGateChecks] = useState({ yt: false, tg: false, li: false, x: false, ig: false, tk: false });
  const [ytOpened, setYtOpened] = useState(false);
  const [tgUserId, setTgUserId] = useState("");
  const [tgVerifying, setTgVerifying] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accessNumber, setAccessNumber] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [customerLookup, setCustomerLookup] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    accountNumber: '',
    accessNumber: '',
    customerName: '',
    location: '',
    routerModel: ''
  });

  const handleClear = () => {
    setIpAddress('');
    setAccountNumber('');
    setAccessNumber('');
    setAnalysis(null);
    setCustomerLookup(null);
    setError(null);
    setShowAssignmentForm(false);
    setAssignmentForm({
      accountNumber: '',
      accessNumber: '',
      customerName: '',
      location: '',
      routerModel: ''
    });
  };

  const analyzeIp = async (ip: string) => {
    if (!ip) return;
    
    setLoading(true);
    setError(null);
    setCustomerLookup(null);
    
    try {
      const isLoggedIn = Boolean(session);
      const isPrivileged = (session?.user?.email || '').toLowerCase() === 'josen@gmail.com';
      const trialUsed = typeof window !== 'undefined' && (localStorage.getItem('trialUsed') === '1' || document.cookie.includes('trial_used=1'));
      if (!isLoggedIn && trialUsed) {
        toast.info("Free trial used", { description: "Create an account to continue using IP tools." });
        setLoading(false);
        router.push('/auth/signup');
        return;
      }

      // Logged-in soft gate after 2 successful uses if not social verified
      const userKey = (session?.user?.email || session?.user?.name || 'user').toLowerCase();
      const usesKey = `uses_analyzer_${userKey}`;
      const verifiedKey = `social_verified_${userKey}`;
      const verified = typeof window !== 'undefined' && (localStorage.getItem(verifiedKey) === '1' || document.cookie.includes(`${verifiedKey}=1`));
      const lsUses = parseInt(localStorage.getItem(usesKey) || '0', 10) || 0;
      const cookieMatch = document.cookie.match(new RegExp(`${usesKey}=([^;]+)`));
      const ckUses = cookieMatch ? parseInt(cookieMatch[1], 10) || 0 : 0;
      const pastUses = Math.max(lsUses, ckUses);
      if (!isPrivileged && isLoggedIn && !verified && pastUses >= 2) {
        setShowGate(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/wan-ip/analyze?ip=${encodeURIComponent(ip)}&unmetered=1`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          setGateReason(data.error || 'Verification required');
          setShowGate(true);
          return;
        }
        throw new Error(data.error || 'Failed to analyze IP');
      }
      
      if (!data || !data.networkInfo || typeof data.networkInfo.cidr === 'undefined') {
        throw new Error('No analysis data returned');
      }
      setAnalysis(data);
      try {
        const regionName = data?.region?.name ? ` — ${data.region.name}` : '';
        toast.success(`Nice! We found details for ${data.ip}${regionName}`, {
          description: data.status?.assigned
            ? `Assigned to ${data.status.customerName} at ${data.status.location}`
            : `IP is available. Gateway: ${data.region?.defaultGateway ?? 'N/A'}`,
        });
        if (!isLoggedIn) {
          try {
            localStorage.setItem('trialUsed', '1');
            document.cookie = `trial_used=1; max-age=31536000; path=/`;
          } catch {}
        }
        if (isLoggedIn && !isPrivileged) {
          try {
            const next = String(pastUses + 1);
            localStorage.setItem(usesKey, next);
            document.cookie = `${usesKey}=${next}; max-age=31536000; path=/`;
          } catch {}
        }
      } catch {}
      setShowAssignmentForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const allGateChecked = gateChecks.yt && gateChecks.tg && gateChecks.li && gateChecks.x && gateChecks.ig && gateChecks.tk;
  const completeGate = () => {
    try {
      const userKey = (session?.user?.email || session?.user?.name || 'user').toLowerCase();
      const verifiedKey = `social_verified_${userKey}`;
      localStorage.setItem(verifiedKey, '1');
      document.cookie = `${verifiedKey}=1; max-age=31536000; path=/`;
    } catch {}
    setShowGate(false);
    toast.success('Thanks for supporting us!');
  };

  const handleCustomerLookup = async () => {
    if (!accountNumber && !accessNumber) {
      setError("Please enter either account number or access number");
      return;
    }

    // Validate formats
    if (accountNumber && !/^\d{9}$/.test(accountNumber)) {
      setError("Account number must be exactly 9 digits");
      return;
    }
    if (accessNumber && !/^\d{11}$/.test(accessNumber)) {
      setError("Access number must be exactly 11 digits");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const params = new URLSearchParams();
      if (accountNumber) params.append('accountNumber', accountNumber);
      if (accessNumber) params.append('accessNumber', accessNumber);
      
      const response = await fetch(`/api/wan-ip/lookup-by-customer?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup customer');
      }

      setCustomerLookup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIp = async () => {
    if (!analysis || !ipAddress) return;
    
    try {
      const response = await fetch('/api/wan-ip/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress,
          ...assignmentForm
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to assign IP");
      }
      
      toast.success("IP assigned successfully!", {
        description: `Assigned ${ipAddress} to ${assignmentForm.customerName || 'customer'}`,
      });
      setShowAssignmentForm(false);
      analyzeIp(ipAddress); // Refresh analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign IP");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeIp(ipAddress);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WAN IP Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze WAN IP addresses for Ethio Telecom network configuration
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter WAN IP Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-2">WAN IP Address</label>
              <Input
                type="text"
                placeholder="e.g., 197.156.64.1"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full sm:max-w-md"
              />
              {ipAddress && (
                <button
                  type="button"
                  aria-label="Clear WAN IP"
                  onClick={() => setIpAddress('')}
                  className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="9 digits (e.g., 742684130)"
                  maxLength={9}
                  className="w-full sm:max-w-xs"
                />
                {accountNumber && (
                  <button
                    type="button"
                    aria-label="Clear Account Number"
                    onClick={() => setAccountNumber('')}
                    className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Access Number</label>
                <Input
                  value={accessNumber}
                  onChange={(e) => setAccessNumber(e.target.value)}
                  placeholder="11 digits (e.g., 13101826064)"
                  maxLength={11}
                  className="w-full sm:max-w-xs"
                />
                {accessNumber && (
                  <button
                    type="button"
                    aria-label="Clear Access Number"
                    onClick={() => setAccessNumber('')}
                    className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !ipAddress}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Analyzing..." : "Analyze IP"}
              </Button>
              <Button 
                onClick={handleCustomerLookup}
                disabled={loading || (!accountNumber && !accessNumber)}
                variant="outline"
              >
                {loading ? "Searching..." : "Search Customer"}
              </Button>
              
              <Button 
                type="button"
                onClick={handleClear}
                disabled={loading}
                variant="secondary"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          )}

      {/* Customer Lookup Results */}
      {customerLookup && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Customer Service Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {customerLookup.found ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-semibold">
                      Service Type: {customerLookup.serviceType}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 font-semibold">
                      Service Type: {customerLookup.serviceType}
                    </span>
                  </>
                )}
              </div>
              
              {customerLookup.found ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Account Number:</strong> {customerLookup.accountNumber}</div>
                  <div><strong>Access Number:</strong> {customerLookup.accessNumber}</div>
                  <div><strong>Customer Name:</strong> {customerLookup.customerName}</div>
                  <div><strong>Location:</strong> {customerLookup.location}</div>
                  <div><strong>WAN IP:</strong> {customerLookup.wanIp}</div>
                  {customerLookup.interface && (
                    <>
                      <div><strong>Region:</strong> {customerLookup.interface.region}</div>
                      <div><strong>Interface:</strong> {customerLookup.interface.name}</div>
                      <div><strong>Gateway:</strong> {customerLookup.interface.defaultGateway}</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>No WAN IP assignment found. Customer likely has PPPOE service.</p>
                  {customerLookup.routerModel && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <strong>Router Recommendation:</strong> {customerLookup.routerModel}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="grid gap-6">
          {/* Network Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Network Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">IP Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>IP Address:</strong> {analysis.ip}</div>
                    <div><strong>CIDR:</strong> /{analysis.networkInfo?.cidr}</div>
                    <div><strong>Subnet Mask:</strong> {analysis.networkInfo?.subnetMask}</div>
                    <div><strong>Network Address:</strong> {analysis.networkInfo?.networkAddress}</div>
                    <div><strong>Broadcast Address:</strong> {analysis.networkInfo?.broadcastAddress}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usable Range</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>First IP:</strong> {analysis.networkInfo?.firstUsableIp}</div>
                  <div><strong>Last IP:</strong> {analysis.networkInfo?.lastUsableIp}</div>
                  <div><strong>Total Hosts:</strong> {(analysis.networkInfo?.totalHosts || 0).toLocaleString()}</div>
                  <div><strong>Usable Hosts:</strong> {(analysis.networkInfo?.usableHosts || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Region Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Region & Interface Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Region</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {analysis.region?.name}</div>
                    <div><strong>Interface:</strong> {analysis.region?.interface}</div>
                    <div><strong>Default Gateway:</strong> {analysis.region?.defaultGateway}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Assignment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.status?.assigned ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 font-semibold">IP Already Assigned</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Customer:</strong> {analysis.status.customerName}</div>
                    <div><strong>Account:</strong> {analysis.status.accountNumber}</div>
                    <div><strong>Location:</strong> {analysis.status.location}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-semibold">IP Available for Assignment</span>
                  </div>
                  <Button 
                    onClick={() => setShowAssignmentForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Assign to Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Form */}
          {showAssignmentForm && !analysis.isAssigned && (
            <Card>
              <CardHeader>
                <CardTitle>Assign IP to Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <Input
                      value={assignmentForm.accountNumber}
                      onChange={(e) => setAssignmentForm({...assignmentForm, accountNumber: e.target.value})}
                      placeholder="ETH123456789"
                    />
                    {assignmentForm.accountNumber && (
                      <button
                        type="button"
                        aria-label="Clear Account Number"
                        onClick={() => setAssignmentForm({...assignmentForm, accountNumber: ''})}
                        className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Access Number</label>
                    <Input
                      value={assignmentForm.accessNumber}
                      onChange={(e) => setAssignmentForm({...assignmentForm, accessNumber: e.target.value})}
                      placeholder="ACC123456"
                    />
                    {assignmentForm.accessNumber && (
                      <button
                        type="button"
                        aria-label="Clear Access Number"
                        onClick={() => setAssignmentForm({...assignmentForm, accessNumber: ''})}
                        className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Customer Name</label>
                    <Input
                      value={assignmentForm.customerName}
                      onChange={(e) => setAssignmentForm({...assignmentForm, customerName: e.target.value})}
                      placeholder="John Doe"
                    />
                    {assignmentForm.customerName && (
                      <button
                        type="button"
                        aria-label="Clear Customer Name"
                        onClick={() => setAssignmentForm({...assignmentForm, customerName: ''})}
                        className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                      value={assignmentForm.location}
                      onChange={(e) => setAssignmentForm({...assignmentForm, location: e.target.value})}
                      placeholder="Addis Ababa, Bole"
                    />
                    {assignmentForm.location && (
                      <button
                        type="button"
                        aria-label="Clear Location"
                        onClick={() => setAssignmentForm({...assignmentForm, location: ''})}
                        className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Router Model</label>
                    <Input
                      value={assignmentForm.routerModel}
                      onChange={(e) => setAssignmentForm({...assignmentForm, routerModel: e.target.value})}
                      placeholder="TP-Link Archer C6"
                    />
                    {assignmentForm.routerModel && (
                      <button
                        type="button"
                        aria-label="Clear Router Model"
                        onClick={() => setAssignmentForm({...assignmentForm, routerModel: ''})}
                        className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAssignIp} className="bg-green-600 hover:bg-green-700">
                      Confirm Assignment
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAssignmentForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Router Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                Router Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations?.routerModel ? (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">{analysis.recommendations.routerModel}</h4>
                    <p className="text-sm text-muted-foreground mb-2">Recommended for {analysis.region?.name} region</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific router recommendation available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tutorial Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Tutorial Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations?.tutorials && analysis.recommendations.tutorials.length > 0 ? (
                  analysis.recommendations.tutorials.map((tutorial: { title: string; url: string; description: string }, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{tutorial.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                      <a 
                        href={tutorial.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Watch Tutorial →
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tutorials available for this region</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.knowledgeBase && analysis.knowledgeBase.length > 0 ? (
                  analysis.knowledgeBase.map((article: { title: string; description: string; slug: string }, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                      <a 
                        href={`/knowledge-base/${article.slug}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Read Article →
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No knowledge base articles available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Support Yoh-Tech Solutions</h3>
            <p className="text-sm text-gray-600 mb-1">Follow/subscribe to continue using the tools.</p>
            {gateReason && (
              <p className="text-xs text-orange-600 mb-3">{gateReason}</p>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" disabled={!ytOpened} checked={gateChecks.yt} onChange={(e) => setGateChecks({ ...gateChecks, yt: e.target.checked })} />
                  <span>YouTube</span>
                </label>
                <a onClick={() => setYtOpened(true)} href="https://www.youtube.com/@Yoh-Tech-Solutions" target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open</a>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" disabled checked={gateChecks.tg} onChange={() => {}} />
                    <span>Telegram (auto-verified)</span>
                  </label>
                  <a href="https://t.me/YohTechSolutions" target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open</a>
                </div>
                <div className="flex gap-2">
                  <input
                    value={tgUserId}
                    onChange={(e) => setTgUserId(e.target.value)}
                    placeholder="Your Telegram user ID"
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  <Button size="sm" disabled={!tgUserId || tgVerifying} onClick={async () => {
                    try {
                      setTgVerifying(true);
                      const res = await fetch('/api/social/telegram/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: tgUserId }) });
                      const data = await res.json();
                      if (data.ok && data.isMember) {
                        setGateChecks((g) => ({ ...g, tg: true }));
                        toast.success('Telegram verified');
                      } else {
                        toast.error('Telegram not verified', { description: 'Join the channel then try again.' });
                      }
                    } finally {
                      setTgVerifying(false);
                    }
                  }}>Verify</Button>
                </div>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={gateChecks.li} onChange={(e) => setGateChecks({ ...gateChecks, li: e.target.checked })} />
                <a href="https://www.linkedin.com/in/yohanes-senbeto-61833218a/" target="_blank" rel="noreferrer" className="text-blue-600 underline">LinkedIn</a>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={gateChecks.x} onChange={(e) => setGateChecks({ ...gateChecks, x: e.target.checked })} />
                <a href="https://x.com/YohanesSenbeto?t=XGudVyYnkdss3xidqoI4fQ&s=09" target="_blank" rel="noreferrer" className="text-blue-600 underline">X (Twitter)</a>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={gateChecks.ig} onChange={(e) => setGateChecks({ ...gateChecks, ig: e.target.checked })} />
                <a href="https://www.instagram.com/joni_senbeto/?igsh=MXhsNGs2dmlvZHluYg%3D%3D#" target="_blank" rel="noreferrer" className="text-blue-600 underline">Instagram</a>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={gateChecks.tk} onChange={(e) => setGateChecks({ ...gateChecks, tk: e.target.checked })} />
                <a href="https://www.tiktok.com/@jonisenbeto?_t=ZM-8zpIZ0SiSxn&_r=1" target="_blank" rel="noreferrer" className="text-blue-600 underline">TikTok</a>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGate(false)}>Cancel</Button>
              <Button disabled={!allGateChecked} onClick={completeGate}>Continue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}