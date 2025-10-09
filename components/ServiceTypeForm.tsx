"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  Wifi, 
  Shield, 
  Database,
  Home,
  Building,
  Info,
  HelpCircle,
  AlertCircle,
  Search,
  User,
  Phone
} from "lucide-react";
import { toast } from "sonner";

interface ServiceTypeFormProps {
  onCustomerLookup: (data: {
    accountNumber?: string;
    accessNumber?: string;
  }) => void;
  loading?: boolean;
}

export default function ServiceTypeForm({ onCustomerLookup, loading = false }: ServiceTypeFormProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [accessNumber, setAccessNumber] = useState('');
  const [errors, setErrors] = useState<{
    accountNumber?: boolean;
    accessNumber?: boolean;
  }>({});

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value);
    setErrors(prev => ({ ...prev, accountNumber: false }));
  };

  const handleAccessNumberChange = (value: string) => {
    setAccessNumber(value);
    setErrors(prev => ({ ...prev, accessNumber: false }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!accountNumber.trim() && !accessNumber.trim()) {
      newErrors.accountNumber = true;
      newErrors.accessNumber = true;
    }
    
    if (accountNumber && !/^\d{9}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = true;
    }
    
    if (accessNumber && !/^\d{11}$/.test(accessNumber.trim())) {
      newErrors.accessNumber = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validateForm()) {
      toast.error('Please enter a valid account number or access number');
      return;
    }

    onCustomerLookup({
      accountNumber: accountNumber.trim() || undefined,
      accessNumber: accessNumber.trim() || undefined
    });
  };

  const handleClear = () => {
    setAccountNumber('');
    setAccessNumber('');
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Customer Lookup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Customer Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Number
              </Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                placeholder="9 digits (e.g., 123456789)"
                className={`mt-2 ${errors.accountNumber ? 'border-red-500' : ''}`}
                maxLength={9}
              />
              {errors.accountNumber && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please enter a valid 9-digit account number</span>
                </div>
              )}
            </div>

            {/* Access Number */}
            <div>
              <Label htmlFor="accessNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Access Number
              </Label>
              <Input
                id="accessNumber"
                value={accessNumber}
                onChange={(e) => handleAccessNumberChange(e.target.value)}
                placeholder="11 digits (e.g., 12345678901)"
                className={`mt-2 ${errors.accessNumber ? 'border-red-500' : ''}`}
                maxLength={11}
              />
              {errors.accessNumber && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please enter a valid 11-digit access number</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSearch}
                disabled={loading || (!accountNumber.trim() && !accessNumber.trim())}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Customer
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Wifi className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">WAN IP Service</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    If you have WAN IP service, we'll provide your IP address, subnet mask, default gateway, and VLAN information from our network database.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800">PPPOE Service</h4>
                  <p className="text-sm text-green-700 mt-1">
                    If you have PPPOE service, we'll provide your account credentials and connection settings for router configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Database className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-800">CRM Integration</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    We automatically check Ethio Telecom's CRM system to determine your service type and provide accurate network configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Where to find your numbers:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>Account Number:</strong> On your bill or Customer Acceptance Sheet</li>
                <li><strong>Access Number:</strong> Your phone number (11 digits)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Service Types:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>WAN IP:</strong> Static IP address service</li>
                <li><strong>PPPOE:</strong> Username/password based service</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
