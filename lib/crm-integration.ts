/**
 * Ethio Telecom CRM Integration Module
 * 
 * This module handles integration with Ethio Telecom's CRM system
 * to fetch customer information based on account number and access number.
 * 
 * Features:
 * - Customer lookup by account/access number
 * - Service type detection (PPPOE vs WAN IP)
 * - Network configuration parameters
 * - Router configuration recommendations
 */

export interface EthioTelecomCustomer {
  accountNumber: string;
  accessNumber?: string;
  customerName: string;
  location: string;
  serviceType: 'PPPOE' | 'BROADBAND_INTERNET' | 'VPN_DATA_ONLY';
  customerType: 'RESIDENTIAL' | 'ENTERPRISE';
  serviceStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  // PPPOE specific fields
  pppoeUsername?: string;
  pppoePassword?: string;
}

export interface CRMResponse {
  success: boolean;
  customer?: EthioTelecomCustomer;
  error?: string;
  message?: string;
}

export interface CRMConfig {
  apiBaseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

class EthioTelecomCRM {
  private config: CRMConfig;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  /**
   * Lookup customer by account number - Simplified to only get service type and customer type
   */
  async lookupByAccountNumber(accountNumber: string): Promise<CRMResponse> {
    try {
      const response = await this.makeRequest('/api/customers/service-type', {
        method: 'POST',
        body: JSON.stringify({
          accountNumber: accountNumber.trim()
        })
      });

      return this.processCustomerResponse(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to lookup customer: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Lookup customer by access number - Simplified to only get service type and customer type
   */
  async lookupByAccessNumber(accessNumber: string): Promise<CRMResponse> {
    try {
      const response = await this.makeRequest('/api/customers/service-type', {
        method: 'POST',
        body: JSON.stringify({
          accessNumber: accessNumber.trim()
        })
      });

      return this.processCustomerResponse(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to lookup customer: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get network configuration for customer
   */
  async getNetworkConfiguration(accountNumber: string): Promise<CRMResponse> {
    try {
      const response = await this.makeRequest('/api/customers/network-config', {
        method: 'POST',
        body: JSON.stringify({
          accountNumber: accountNumber.trim()
        })
      });

      return this.processCustomerResponse(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to get network configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update customer network configuration
   */
  async updateNetworkConfiguration(
    accountNumber: string, 
    networkConfig: any
  ): Promise<CRMResponse> {
    try {
      const response = await this.makeRequest('/api/customers/network-config', {
        method: 'PUT',
        body: JSON.stringify({
          accountNumber: accountNumber.trim(),
          networkConfig
        })
      });

      return this.processCustomerResponse(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update network configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get router recommendations based on service type and location
   */
  async getRouterRecommendations(
    serviceType: 'PPPOE' | 'WAN_IP',
    location: string
  ): Promise<{ models: string[]; tutorials: string[] }> {
    try {
      const response = await this.makeRequest('/api/recommendations/router', {
        method: 'POST',
        body: JSON.stringify({
          serviceType,
          location: location.trim()
        })
      });

      const data = await response.json();
      return {
        models: data.models || [],
        tutorials: data.tutorials || []
      };
    } catch (error) {
      console.error('Failed to get router recommendations:', error);
      return {
        models: ['TP-Link Archer C6', 'Huawei HG8245H', 'D-Link DIR-825'],
        tutorials: []
      };
    }
  }

  /**
   * Make HTTP request to CRM API
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Version': '1.0',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.retryAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Process customer response from CRM
   */
  private async processCustomerResponse(response: Response): Promise<CRMResponse> {
    try {
      const data = await response.json();
      
      if (data.success === false) {
        return {
          success: false,
          error: data.error || 'Customer not found',
          message: data.message
        };
      }

      // Transform CRM data to our simplified interface
      const customer: EthioTelecomCustomer = {
        accountNumber: data.accountNumber,
        accessNumber: data.accessNumber,
        customerName: data.customerName || 'Unknown Customer',
        location: data.location || 'Unknown Location',
        serviceType: data.serviceType || 'PPPOE',
        customerType: data.customerType || 'RESIDENTIAL',
        serviceStatus: data.serviceStatus || 'ACTIVE'
      };

      return {
        success: true,
        customer
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process response: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Default configuration (to be set via environment variables)
const defaultConfig: CRMConfig = {
  apiBaseUrl: process.env.ETHIO_TELECOM_CRM_API_URL || 'https://api.ethiotelecom.et/crm',
  apiKey: process.env.ETHIO_TELECOM_CRM_API_KEY || '',
  timeout: 10000, // 10 seconds
  retryAttempts: 3
};

// Export singleton instance
export const ethioTelecomCRM = new EthioTelecomCRM(defaultConfig);

// Export class for custom instances
export { EthioTelecomCRM };

// Utility functions
export const validateAccountNumber = (accountNumber: string): boolean => {
  return /^\d{9}$/.test(accountNumber.trim());
};

export const validateAccessNumber = (accessNumber: string): boolean => {
  return /^\d{11}$/.test(accessNumber.trim());
};

export const formatCustomerData = (customer: EthioTelecomCustomer) => {
  return {
    accountNumber: customer.accountNumber,
    accessNumber: customer.accessNumber,
    customerName: customer.customerName,
    location: customer.location,
    serviceType: customer.serviceType,
    customerType: customer.customerType,
    serviceStatus: customer.serviceStatus,
    hasWanIp: customer.serviceType === 'BROADBAND_INTERNET' || customer.serviceType === 'VPN_DATA_ONLY'
  };
};
