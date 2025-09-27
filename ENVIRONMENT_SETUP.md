# Environment Setup for IP Toolkit Pro

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ip_toolkit_pro"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Ethio Telecom CRM Integration
ETHIO_TELECOM_CRM_API_URL="https://api.ethiotelecom.et/crm"
ETHIO_TELECOM_CRM_API_KEY="your-crm-api-key-here"

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="your-openai-api-key"

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

## CRM Integration Setup

### 1. Contact Ethio Telecom
- Reach out to Ethio Telecom's enterprise service center
- Request API access for CRM integration
- Obtain API documentation and credentials

### 2. Configure CRM API
- Set the `ETHIO_TELECOM_CRM_API_URL` to the provided endpoint
- Set the `ETHIO_TELECOM_CRM_API_KEY` with your API key
- Test the connection using the customer lookup endpoint

### 3. Database Setup
- Run `npx prisma migrate dev` to set up the database
- Run `npx prisma db seed` to populate initial data
- Verify the connection with `npx prisma studio`

## Features Overview

### WAN IP Analyzer
- **Customer Lookup**: Search by account number (9 digits) or access number (11 digits)
- **Service Type Detection**: Automatically detects PPPOE vs WAN IP service
- **Network Configuration**: Provides subnet mask and default gateway
- **Router Recommendations**: Suggests appropriate router models
- **Tutorial Videos**: Step-by-step configuration guides

### CRM Integration
- **Real-time Customer Data**: Fetches customer information from Ethio Telecom CRM
- **Service Status**: Shows active, suspended, or pending status
- **Network Configuration**: Retrieves WAN IP, subnet mask, and gateway
- **Technician Assignment**: Shows assigned technician information
- **Router Information**: Displays router model and serial number

### Router Configuration Generator
- **Static IP Configuration**: Generates configuration for WAN IP users
- **PPPOE Configuration**: Creates PPPOE setup for residential users
- **Multiple Router Support**: Supports various router models
- **DNS Configuration**: Configurable DNS servers
- **Download Scripts**: Generates downloadable configuration scripts

### Tutorial Video System
- **Video Library**: Comprehensive collection of configuration tutorials
- **Router-specific**: Videos tailored to specific router models
- **Service Type**: Different tutorials for PPPOE vs WAN IP
- **Search and Filter**: Easy navigation through video content
- **Embedded Player**: In-app video playback

## Usage Instructions

### For Technicians
1. **Customer Lookup**: Enter account number or access number
2. **Service Analysis**: Review service type and network configuration
3. **Router Configuration**: Generate appropriate router settings
4. **Tutorial Access**: Watch relevant configuration videos
5. **Customer Assignment**: Assign WAN IPs to customers

### For Customers
1. **Service Check**: Verify service type and configuration
2. **Router Setup**: Follow generated configuration steps
3. **Tutorial Videos**: Watch step-by-step setup guides
4. **Support**: Contact assigned technician if needed

## API Endpoints

### CRM Integration
- `GET /api/crm/customer-lookup` - Lookup customer by account/access number
- `POST /api/crm/customer-lookup` - Update customer network configuration

### WAN IP Analysis
- `GET /api/wan-ip/analyze` - Analyze WAN IP address
- `POST /api/wan-ip/analyze` - Assign WAN IP to customer

### Tutorial Videos
- `GET /api/tutorials` - Get tutorial videos
- `POST /api/tutorials` - Create new tutorial video

## Security Considerations

1. **API Key Protection**: Keep CRM API keys secure
2. **Authentication**: All endpoints require proper authentication
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Data Validation**: Validate all input data
5. **Error Handling**: Proper error handling and logging

## Troubleshooting

### Common Issues
1. **CRM Connection Failed**: Check API URL and key
2. **Database Connection**: Verify DATABASE_URL
3. **Authentication Issues**: Check NEXTAUTH_SECRET
4. **Video Playback**: Ensure video URLs are accessible

### Support
- Check the knowledge base for common solutions
- Contact system administrator for technical issues
- Refer to Ethio Telecom documentation for CRM integration

