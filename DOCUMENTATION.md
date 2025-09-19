# IP Toolkit Pro / NetConfig Hub - Complete Documentation

## Project Overview

This document details the complete **IP Toolkit Pro/NetConfig Hub** - a comprehensive network configuration platform for Ethio Telecom employees and customers.

## 🏗️ Core Infrastructure Changes

### 1. Enhanced Database Schema

**File**: `prisma/schema.prisma`

**Complete Ethio Telecom Network Management Schema**:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  calculations Calculation[]
  articles     KnowledgeBaseArticle[]
}

model Calculation {
  id          String   @id @default(cuid())
  wanIp       String
  cidr        Int
  subnetMask  String
  networkAddr String
  broadcast   String
  usableHosts Int
  totalHosts  Int
  createdAt   DateTime @default(now())
  userId      String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CustomerWanIp {
  id            String   @id @default(cuid())
  accountNumber String   @unique
  accessNumber  String   @unique
  wanIp         String   @unique
  customerName  String
  location      String
  interfaceName String
  regionName    String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WanIp {
  id        String   @id @default(cuid())
  ipAddress String   @unique
  regionId  String
  isUsed    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  region EthioTelecomRegion @relation(fields: [regionId], references: [id])
}

model RouterModel {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model EthioTelecomRegion {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  interfaces EthioTelecomInterface[]
  wanIps     WanIp[]
}

model EthioTelecomInterface {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  regionId    String
  ipPoolStart String
  ipPoolEnd   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  region EthioTelecomRegion @relation(fields: [regionId], references: [id])
}

model EthioTelecomTechnician {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  region    String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model KnowledgeBaseArticle {
  id          String   @id @default(cuid())
  title       String
  content     String
  category    String
  routerModels String[]
  videoUrl    String?
  author      String
  publishedAt DateTime @default(now())
  userId      String?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

enum Role {
  USER
  ADMIN
}
```

### 2. Utility Functions

**File**: `lib/utils.ts`

comprehensive IP calculation utilities:

```typescript
// Network calculation functions
calculateNetworkAddress(ip: string, cidr: number): string
calculateBroadcastAddress(ip: string, cidr: number): string
calculateSubnetMask(cidr: number): string
calculateWildcardMask(cidr: number): string
calculateDefaultGateway(ip: string, cidr: number): string
calculateUsableHostRange(ip: string, cidr: number): { first: string; last: string }
calculateTotalHosts(cidr: number): number
calculateUsableHosts(cidr: number): number

// Validation functions
isValidIPAddress(ip: string): boolean
isValidCIDR(cidr: number): boolean
```

### 3. Validation Schemas

**File**: `lib/validations.ts`

Implemented Zod validation schemas:

```typescript
// IP address and CIDR validation
ipAddressSchema: Zod schema for valid IP addresses
cidrSchema: Zod schema for valid CIDR notation (1-32)

// Form validations
ipCalculatorSchema: Form validation for IP calculator
userRegistrationSchema: User registration form validation
userLoginSchema: User login form validation

// Data validations
knowledgeBaseArticleSchema: Article creation/editing
calculationSchema: Calculation data validation
```

## 🔐 Authentication & Security

### 4. NextAuth Configuration

**File**: `lib/auth.ts`

Authentication system:

-   **Providers**: Credentials + Google OAuth
-   **Role Management**: USER/ADMIN roles with proper typing
-   **Session Strategy**: JWT with proper callback handling
-   **Database Adapter**: Prisma adapter for user management

**File**: `app/api/auth/[...nextauth]/route.ts`

-   Simplified API route using centralized configuration
-   Proper error handling and session management

## 🎨 User Interface Components

### 5. Environment Configuration

**File**: `.env`

Updated database configuration:

-   Changed `DATABASE_URL` from `postgres` to `iptoolkit` database name
-   Maintained existing `NEXTAUTH_URL` and `NEXTAUTH_SECRET` configurations
-   Proper database connection setup for IP Toolkit Pro

### 6. Enhanced Main Landing Page

**File**: `app/page.tsx`

Complete featuring:

-   Modern hero section with IP Toolkit Pro branding
-   Feature grid showcasing:
    -   **WAN IP Analyzer** (primary tool for Ethio Telecom customers)
    -   IP Calculator with real-time results
    -   Knowledge Base with categorized tutorials
    -   History & Save functionality
    -   Router Configurations
    -   Multi-Device Sync
-   NextAuth.js integration for conditional rendering
-   Responsive design with Tailwind CSS
-   Updated navigation paths from `/tools/ip-calculator` to `/tools/wan-ip-analyzer`

### 7. WAN IP Analyzer (Primary Tool)

**File**: `app/tools/wan-ip-analyzer/page.tsx`

**Advanced WAN IP management system for Ethio Telecom customers:**

-   **Customer Data Integration**: Fetches account numbers, access numbers, and service types from database
-   **Service Type Detection**: Automatically identifies PPPoE vs WAN IP service types
-   **Regional IP Assignment**: Links customers to specific Ethio Telecom regions and interfaces
-   **Router Recommendations**: Suggests appropriate router models based on service type
-   **Assignment Workflow**: Complete IP assignment process with validation
-   **Customer Lookup**: Find customers by account or access numbers
-   **Real-time IP Analysis**: Comprehensive network calculations
-   **Database Integration**: Full Prisma ORM integration with customer data

**Key Features:**
- Account number and access number validation
- Service type identification (PPPoE/WAN IP)
- Regional IP pool management
- Customer location mapping
- Router compatibility checking
- Historical assignment tracking

### 8. IP Calculator Component (Secondary Tool)

**File**: `app/tools/ip-calculator/page.tsx`

Full-featured subnet calculator:

-   Real-time calculation as user types
-   Form validation with Zod schemas
-   Comprehensive network information display:
    -   Network Address
    -   Broadcast Address
    -   Subnet Mask
    -   Wildcard Mask
    -   Usable Host Range
    -   Total Hosts
    -   Usable Hosts
-   Save functionality for logged-in users
-   CIDR notation explanation section
-   Responsive design with modern UI

### 9. Dashboard System (Updated)

**File**: `app/dashboard/page.tsx`

User dashboard featuring:

-   Statistics cards (Total Calculations, Saved Calculations, Member Since, Account Type)
-   Recent calculations section
-   Quick actions with navigation to:
    -   **WAN IP Analyzer** (primary tool)
    -   IP Calculator (secondary tool)
    -   Calculation History
    -   Knowledge Base
    -   Admin Dashboard (for ADMIN users)
-   Role-based access control
-   Responsive grid layout
-   Updated navigation paths from IP calculator to WAN IP analyzer

**File**: `app/dashboard/history/page.tsx`

Calculation history page:

-   Search functionality for calculations
-   Clean card-based layout for saved calculations
-   Empty state with call-to-action
-   Navigation to create new calculations
-   Updated button text and navigation paths

### 10. Knowledge Base System

**File**: `app/knowledge-base/page.tsx`

Comprehensive knowledge base featuring:

-   Category system:
    -   Fiber Internet
    -   DSL Internet
    -   LTE/4G/5G
    -   Router Models
-   Search functionality across articles
-   Popular articles section
-   Video tutorial integration
-   Router model-specific guides
-   Request tutorial feature

**File**: `app/knowledge-base/[slug]/page.tsx`

Individual article pages:

-   Dynamic routing based on article slug
-   Article content with proper formatting
-   Video tutorial sections
-   Related articles
-   Author information and publish dates
-   Category and router model tags

## 🚀 Key Features Implemented

### Core Functionality

1. **WAN IP Analyzer**: Advanced customer management system for Ethio Telecom
2. **IP Subnet Calculator**: Real-time network calculations with comprehensive results
3. **User Authentication**: NextAuth.js with multiple providers (Credentials + Google)
4. **Role-based Access Control**: USER and ADMIN roles with different permissions
5. **Calculation History**: Save and manage network calculations with search
6. **Knowledge Base**: Comprehensive tutorials and guides with video integration
7. **Responsive Design**: Mobile-first approach with Tailwind CSS
8. **Dark Mode Support**: Complete dark mode implementation for all auth pages

### Technical Stack

-   **Framework**: Next.js 14+ with App Router
-   **Database**: PostgreSQL with Prisma ORM (enhanced schema for Ethio Telecom)
-   **Authentication**: NextAuth.js with proper session management
-   **Validation**: Zod for comprehensive form and data validation
-   **UI**: Modern responsive design with Tailwind CSS and dark mode support
-   **Type Safety**: Full TypeScript implementation with proper typing
-   **Icons**: Lucide React for consistent iconography

## 📁 Project Structure

```
IP Toolkit Pro/
├── app/
│   ├── dashboard/                 # User dashboard components
│   │   ├── page.tsx              # Main dashboard
│   │   └── history/              # Calculation history
│   │       └── page.tsx
│   ├── knowledge-base/           # Tutorials and guides
│   │   ├── page.tsx              # Knowledge base landing
│   │   └── [slug]/               # Individual articles
│   │       └── page.tsx
│   ├── tools/
│   │   ├── wan-ip-analyzer/     # New primary tool for Ethio Telecom
│   │   └── ip-calculator/       # IP subnet calculator
│   ├── api/auth/                 # Authentication API
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── auth/                     # Authentication pages
│   │   ├── signin/               # Updated with dark mode & responsiveness
│   │   ├── signup/               # Updated with dark mode & responsiveness
│   │   └── forgot-password/
│   └── page.tsx                  # Main landing page
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── utils.ts                  # IP calculation utilities
│   ├── validations.ts            # Zod validation schemas
│   └── prisma.ts                 # Database client
└── prisma/
    └── schema.prisma             # Enhanced schema for Ethio Telecom
```

## 🎯 Target Audience

### Primary Users

-   **Ethio Telecom Customers**: Primary focus on WAN IP management and customer service
-   **Ethio Telecom Employees**: Internal network configuration and troubleshooting
-   **Ethio Telecom Technicians**: Customer management and IP assignment workflows
-   **Network Engineers**: Professional IP subnet calculations and documentation
-   **System Administrators**: Network planning and troubleshooting
-   **Students**: Learning IP networking concepts
-   **IT Professionals**: Quick network calculations and reference

### Use Cases

1. **Network Setup**: Configure routers for Ethio Telecom services
2. **Troubleshooting**: Resolve common network configuration issues
3. **Education**: Learn about IP subnetting and network concepts
4. **Reference**: Quick access to router-specific configuration guides

## 🔧 Setup & Deployment

### Prerequisites

-   Node.js 18+
-   PostgreSQL database
-   Google OAuth credentials (for Google login)

### Installation

1. Install dependencies:

    ```bash
    npm install
    ```

2. Set up environment variables:

    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/iptoolkit"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    ```

3. Run database migrations:

    ```bash
    npx prisma migrate dev
    ```

4. Start development server:
    ```bash
    npm run dev
    ```

### Production Deployment

1. Build the application:

    ```bash
    npm run build
    ```

2. Start production server:
    ```bash
    npm start
    ```

## 🚀 Next Steps

### Completed Updates ✅
- ✅ **WAN IP Analyzer**: Complete customer management system for Ethio Telecom
- ✅ **Enhanced Database Schema**: Full Ethio Telecom network management schema
- ✅ **Dark Mode Support**: Complete dark mode implementation for all auth pages
- ✅ **Responsive Design**: Mobile-first responsive design across all pages
- ✅ **Navigation Updates**: All paths updated from IP calculator to WAN IP analyzer

### Immediate Actions

1. **Database Migration**: Run `npx prisma migrate dev` to apply schema changes
2. **Environment Setup**: Configure Google OAuth credentials and NextAuth secret
3. **Testing**: Thoroughly test all calculator functions and authentication flows
4. **Content Population**: Add actual knowledge base articles and tutorials

### Future Enhancements

1. **Enhanced IP Calculator**: Add IPv6 support and advanced subnet calculations
2. **Mobile App**: React Native version for mobile users
3. **Advanced Analytics**: Network usage insights and reporting
4. **API Documentation**: RESTful API for third-party integrations
5. **Advanced Security**: Two-factor authentication and security audits
6. **Performance Optimization**: Caching and CDN implementation
7. **Multi-language Support**: Amharic language addition
8. **Integration Testing**: Comprehensive test suite
9. **Customer Portal**: Self-service WAN IP management for customers
10. **Technician Dashboard**: Specialized tools for Ethio Telecom technicians

## 📞 Support

For technical support or questions about this transformation:

-   Review the knowledge base articles
-   Check the calculator documentation
-   Contact the development team

---

**Documentation Version**: 1.1  
**Last Updated**: 2025-01-01  
**Project**: IP Toolkit Pro / NetConfig Hub  
**Status**: Complete ✅

## Frontend Architecture (Tools)

### IP Calculator (app/tools/ip-calculator/page.tsx)
- Input: User types WAN IP and CIDR.
- Validation: `isValidIPAddress` and `isValidCIDR` from `lib/utils.ts`.
- Auto-correction: Calls `/api/wan-ip/analyze?ip=…&unmetered=1`. If the analyzer returns a valid CIDR from the provider pool, the UI overrides the entered CIDR and displays a notice with the source (Interface — Region).
- Calculation: Uses `calculateIP(wanIp, cidr)` from `lib/utils.ts` to compute network, mask, broadcast, gateway, usable range, and host counts.
- Save: POSTs to `/api/calculations` for logged-in users.

### WAN IP Analyzer (app/tools/wan-ip-analyzer/page.tsx)
- Input: User types WAN IP (optional customer account/access numbers).
- Analysis: Calls `/api/wan-ip/analyze?ip=…&unmetered=1` and renders returned network info (CIDR, mask, range), Region/Interface/defaultGateway, assignment status, and recommendations.
- Assignment: POST to `/api/wan-ip/analyze` with customer details to assign an IP.
- Errors: Shows clear messages when analyzer returns no data or errors.

Notes
- The tools do not pull IPs from seeds automatically. Users provide the WAN IP. The analyzer uses seeded pool data stored in the DB to detect the correct CIDR/gateway.

## Backend Architecture

### Data model (Prisma)
- Regions: `EthioTelecomRegion`
- Interfaces: `EthioTelecomInterface` (fields include `ipPoolStart`, `ipPoolEnd`, `subnetMask`, `defaultGateway`, `isActive`)
- Customer assignments: `CustomerWanIp`
- Knowledge Base: `KnowledgeBaseArticle`

Seed data
- `prisma/seed-ethio-telecom.js` populates regions, interfaces (provider pools), and sample customers.

### Core library (lib/cidr-utils.ts)
- `findRegionForIp(ip, regions)`: Finds the pool containing `ip` by comparing against `ipPoolStart`/`ipPoolEnd`. Converts pool `subnetMask` → CIDR and returns `defaultGateway`.
- `calculateIpInfo(ip, cidr)`: Computes mask, network, broadcast, first/last usable, total/usable hosts.

### Analyzer API (app/api/wan-ip/analyze/route.ts)
- Reads regions/interfaces from DB and builds region data.
- Finds the matching pool via `findRegionForIp` and computes IP info via `calculateIpInfo`.
- Returns network info, region/interface, default gateway, recommendations, and assignment status.
- Gating: Guests 1 try; logged-in 2 tries unless social-verified. Bypass for privileged email `josen@gmail.com`. The query `unmetered=1` skips gating and does not increment counters.

## API Reference

### GET /api/wan-ip/analyze
Analyze a WAN IP against provider pools.

Query params
- `ip` (required): WAN IP to analyze
- `unmetered` (optional): `1` to bypass usage gating (used internally by tools)

Success response (200)
```json
{
  "ipAddress": "10.239.139.51",
  "networkInfo": {
    "cidr": 19,
    "subnetMask": "255.255.224.0",
    "networkAddress": "10.239.128.0",
    "broadcastAddress": "10.239.159.255",
    "firstUsableIp": "10.239.128.1",
    "lastUsableIp": "10.239.159.254",
    "totalHosts": 8192,
    "usableHosts": 8190
  },
  "region": {
    "name": "CWR Ambo",
    "interface": "Vbui300",
    "defaultGateway": "10.239.128.1"
  },
  "recommendations": {
    "routerModel": "Standard Enterprise Router",
    "tutorials": ["https://…"],
    "knowledgeBase": []
  },
  "status": { "assigned": false, "available": true }
}
```

Errors
- 400: `{ "error": "Invalid IP address format" }`
- 404: `{ "error": "IP address not found in any configured region" }`
- 429: `{ "error": "Usage limit reached, verification required" }`

### POST /api/wan-ip/analyze
Assign a WAN IP to a customer (creates `CustomerWanIp`).

Body
```json
{
  "accountNumber": "147258369",
  "accessNumber": "13101833892",
  "wanIp": "10.239.139.51",
  "customerName": "Getachew Lemma",
  "location": "Ambo, Ethiopia"
}
```

Success (200)
```json
{
  "success": true,
  "assignment": {
    "id": "…",
    "accountNumber": "147258369",
    "accessNumber": "13101833892",
    "wanIp": "10.239.139.51",
    "customerName": "Getachew Lemma",
    "location": "Ambo, Ethiopia",
    "region": "CWR Ambo",
    "interface": "Vbui300"
  }
}
```

Errors
- 400: validation errors (missing/invalid fields)
- 404: interface configuration not found
- 409: IP already assigned

### GET /api/wan-ip/lookup
Return WAN IP suggestions for autocomplete.

Query params
- `q` (required): partial IP string

Success (200)
```json
[
  { "id": "10.239.139.51", "ipAddress": "10.239.139.51", "description": "Sample" }
]
```

### GET /api/wan-ip/lookup-by-customer
Lookup customer/account information.

Query params
- `accountNumber` (optional)
- `accessNumber` (optional)

Success (200)
```json
{
  "found": true,
  "accountNumber": "147258369",
  "accessNumber": "13101833892",
  "customerName": "Getachew Lemma",
  "location": "Ambo, Ethiopia",
  "wanIp": "10.239.139.51",
  "interface": { "region": "CWR Ambo", "name": "Vbui300", "defaultGateway": "10.239.128.1" }
}
```

### POST /api/calculations
Save an IP calculation from the calculator.

Body
```json
{
  "title": "Calculation for 10.239.139.51/19",
  "wanIp": "10.239.139.51",
  "cidr": 19,
  "result": { "subnetMask": "255.255.224.0", "defaultGateway": "10.239.128.1", "usableHosts": 8190 }
}
```

