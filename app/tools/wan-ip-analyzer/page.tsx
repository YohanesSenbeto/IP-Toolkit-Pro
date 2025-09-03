"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Router, BookOpen, CheckCircle, AlertCircle, Search } from "lucide-react";

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

  const analyzeIp = async (ip: string) => {
    if (!ip) return;
    
    setLoading(true);
    setError(null);
    setCustomerLookup(null);
    
    try {
      const response = await fetch(`/api/wan-ip/analyze?ip=${encodeURIComponent(ip)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze IP');
      }
      
      setAnalysis(data);
      setShowAssignmentForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
      
      alert("IP assigned successfully!");
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
            <div>
              <label className="block text-sm font-medium mb-2">WAN IP Address</label>
              <Input
                type="text"
                placeholder="e.g., 197.156.64.1"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="9 digits (e.g., 742684130)"
                  maxLength={9}
                  className="max-w-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Access Number</label>
                <Input
                  value={accessNumber}
                  onChange={(e) => setAccessNumber(e.target.value)}
                  placeholder="11 digits (e.g., 13101826064)"
                  maxLength={11}
                  className="max-w-xs"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <Input
                      value={assignmentForm.accountNumber}
                      onChange={(e) => setAssignmentForm({...assignmentForm, accountNumber: e.target.value})}
                      placeholder="ETH123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Access Number</label>
                    <Input
                      value={assignmentForm.accessNumber}
                      onChange={(e) => setAssignmentForm({...assignmentForm, accessNumber: e.target.value})}
                      placeholder="ACC123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer Name</label>
                    <Input
                      value={assignmentForm.customerName}
                      onChange={(e) => setAssignmentForm({...assignmentForm, customerName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                      value={assignmentForm.location}
                      onChange={(e) => setAssignmentForm({...assignmentForm, location: e.target.value})}
                      placeholder="Addis Ababa, Bole"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Router Model</label>
                    <Input
                      value={assignmentForm.routerModel}
                      onChange={(e) => setAssignmentForm({...assignmentForm, routerModel: e.target.value})}
                      placeholder="TP-Link Archer C6"
                    />
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
    </div>
  );
}