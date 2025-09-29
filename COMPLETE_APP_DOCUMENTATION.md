# IP Toolkit Pro - Complete Application Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [Pages & Components](#pages--components)
6. [API Routes](#api-routes)
7. [Styling System](#styling-system)
8. [Bot Integration](#bot-integration)
9. [Deployment Guide](#deployment-guide)
10. [API Reference](#api-reference)

---

## Application Overview

**IP Toolkit Pro** is a comprehensive network configuration platform designed specifically for **Ethio Telecom** employees and customers. The application provides advanced WAN IP management, network analysis tools, and educational resources for network technicians.

### Core Purpose
- **WAN IP Analysis**: Intelligent IP address analysis with automatic CIDR calculations
- **Customer Management**: Integration with Ethio Telecom's CRM system
- **Network Configuration**: Router and modem configuration assistance
- **Educational Resources**: Video tutorials and knowledge base
- **Technician Tools**: IP pool management and assignment workflows

### Target Users
- **Ethio Telecom Technicians**: IP pool management and customer assignments
- **Network Engineers**: Advanced IP calculations and analysis
- **Customers**: Self-service network configuration guidance
- **Administrators**: System management and oversight

---

## Architecture & Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript for type safety
- **UI Library**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS with DaisyUI
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and context

### Backend Technologies
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with bcrypt password hashing
- **Validation**: Zod schemas
- **File Storage**: Local file system

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in bundler
- **Type Checking**: TypeScript compiler
- **Linting**: ESLint with Next.js config
- **Process Management**: Concurrently for parallel processes

### External Integrations
- **YouTube API**: Video tutorial integration
- **Telegram Bot**: Customer support automation
- **Ethio Telecom CRM**: Customer data integration

---

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id            String                 @id @default(cuid())
  name          String?
  email         String?                @unique
  password      String?
  role          Role                   @default(USER)
  createdAt     DateTime               @default(now())
  updatedAt     DateTime               @updatedAt
  emailVerified DateTime?
  image         String?
  calculations  Calculation[]
  knowledgeBase KnowledgeBaseArticle[] @relation("ArticleAuthor")
}
```

**Purpose**: User authentication and role management
**Key Features**:
- Role-based access control (USER, ADMIN, ETHIO_TELECOM_TECHNICIAN)
- Email verification support
- Profile image storage
- Relationship to calculations and knowledge base articles

#### CustomerWanIp Model
```prisma
model CustomerWanIp {
  id            String                  @id @default(cuid())
  accountNumber String                  @unique
  accessNumber  String?                 @unique
  wanIp         String
  interfaceId   String?
  customerName  String?
  location      String?
  isActive      Boolean                 @default(true)
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @default(now())
  assignedAt    DateTime?
  technicianId  String?
  customerType  CustomerType            @default(RESIDENTIAL)
  serviceType   ServiceType             @default(PPPOE)
  interface     EthioTelecomInterface?  @relation(fields: [interfaceId], references: [id])
  technician    EthioTelecomTechnician? @relation(fields: [technicianId], references: [id])
}
```

**Purpose**: Customer WAN IP assignments and management
**Key Features**:
- Unique account and access number tracking
- Service type classification (PPPOE, WAN_IP, BROADBAND_INTERNET, VPN_DATA_ONLY)
- Customer type distinction (RESIDENTIAL, ENTERPRISE)
- Interface and technician relationships
- Assignment tracking with timestamps

#### EthioTelecomRegion Model
```prisma
model EthioTelecomRegion {
  id          String                   @id @default(cuid())
  name        String                   @unique
  code        String?
  description String?
  isActive    Boolean                  @default(true)
  createdAt   DateTime                 @default(now())
  updatedAt   DateTime                 @updatedAt
  pools       WanIpPool[]              @relation("RegionPools")
  interfaces  EthioTelecomInterface[]
  technicians EthioTelecomTechnician[]
}
```

**Purpose**: Regional network infrastructure management
**Key Features**:
- Regional network organization
- Interface and pool relationships
- Technician assignments by region
- Active/inactive status management

#### EthioTelecomInterface Model
```prisma
model EthioTelecomInterface {
  id             String             @id @default(cuid())
  name           String
  regionId       String
  ipPoolStart    String
  ipPoolEnd      String
  subnetMask     String
  defaultGateway String
  isActive       Boolean            @default(true)
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @default(now())
  pools          WanIpPool[]        @relation("InterfacePools")
  customerWanIps CustomerWanIp[]
  region         EthioTelecomRegion @relation(fields: [regionId], references: [id])
}
```

**Purpose**: Network interface configuration and IP pool management
**Key Features**:
- IP pool range definitions
- Subnet mask and gateway configuration
- Customer IP assignments
- Regional relationships

#### WanIpPool Model
```prisma
model WanIpPool {
  id           String                 @id @default(cuid())
  poolName     String
  startIp      String
  endIp        String
  cidr         Int
  totalIps     Int
  usedIps      Int
  availableIps Int
  description  String?
  regionId     String
  interfaceId  String
  technicianId String
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @default(now())
  interface    EthioTelecomInterface  @relation("InterfacePools", fields: [interfaceId], references: [id])
  region       EthioTelecomRegion     @relation("RegionPools", fields: [regionId], references: [id])
  technician   EthioTelecomTechnician @relation("TechnicianPools", fields: [technicianId], references: [id])
}
```

**Purpose**: IP pool management and tracking
**Key Features**:
- Pool capacity and usage tracking
- CIDR notation support
- Technician ownership
- Interface and region relationships

### Enums

#### Role Enum
```prisma
enum Role {
  USER
  ADMIN
  ETHIO_TELECOM_TECHNICIAN
}
```

#### CustomerType Enum
```prisma
enum CustomerType {
  RESIDENTIAL
  ENTERPRISE
}
```

#### ServiceType Enum
```prisma
enum ServiceType {
  PPPOE
  WAN_IP
  BROADBAND_INTERNET
  VPN_DATA_ONLY
}
```

---

## Authentication System

### NextAuth.js Configuration

**File**: `lib/auth.ts`

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
      }
      return session;
    }
  }
};
```

### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: JWT-based sessions
- **Role-Based Access**: Different permissions for user types
- **Email Verification**: Optional email verification flow
- **CSRF Protection**: Built-in NextAuth.js protection

### Authentication Pages

#### Sign In Page (`app/auth/signin/page.tsx`)
- **Features**: Email/password login form
- **Validation**: Zod schema validation
- **Styling**: Dark mode support with Tailwind CSS
- **Responsive**: Mobile-first design
- **Error Handling**: User-friendly error messages

#### Sign Up Page (`app/auth/signup/page.tsx`)
- **Features**: User registration form
- **Validation**: Comprehensive form validation
- **Password Requirements**: Strength validation
- **Role Assignment**: Default USER role
- **Auto-login**: Automatic login after successful registration

#### Technician Sign In (`app/auth/technician-signin/page.tsx`)
- **Features**: Specialized login for Ethio Telecom technicians
- **Role**: ETHIO_TELECOM_TECHNICIAN role assignment
- **Access**: Direct access to technician tools
- **Validation**: Enhanced validation for technician credentials

---

## Pages & Components

### Main Landing Page (`app/page.tsx`)

**Purpose**: Application introduction and feature showcase

**Key Features**:
- Hero section with application overview
- Feature cards highlighting core functionality
- Call-to-action buttons for user engagement
- Responsive design with modern UI

**Components Used**:
- Custom feature cards with icons
- Responsive grid layout
- Gradient backgrounds
- Interactive hover effects

### Dashboard (`app/dashboard/page.tsx`)

**Purpose**: User's personal workspace and statistics

**Key Features**:
- **Statistics Cards**: Total calculations, saved calculations, member since, account type
- **Quick Actions**: Direct links to main tools
- **Recent Calculations**: Latest user activities
- **Admin Panel**: Conditional access for administrators
- **Responsive Design**: Mobile-optimized layout

**State Management**:
```typescript
const [calculations, setCalculations] = useState<any[]>([]);
const [totalCalculations, setTotalCalculations] = useState(0);
const [savedCalculations, setSavedCalculations] = useState(0);
```

**API Integration**:
- Fetches user calculations from `/api/calculations`
- Real-time statistics updates
- Error handling with user feedback

### WAN IP Analyzer (`app/tools/wan-ip-analyzer/page.tsx`)

**Purpose**: Primary tool for Ethio Telecom IP analysis

**Key Features**:
- **IP Input Validation**: Real-time IP address validation
- **Customer Lookup**: Account number and access number search
- **Service Type Detection**: Automatic PPPoE vs WAN IP identification
- **Network Analysis**: Comprehensive IP calculations
- **Regional Information**: Interface and region mapping
- **Router Configuration**: Automatic router config generation
- **Tutorial Integration**: Links to modem configuration tutorials

**State Management**:
```typescript
const [wanIp, setWanIp] = useState('');
const [analysis, setAnalysis] = useState<WanIpAnalysis | null>(null);
const [loading, setLoading] = useState(false);
const [customerLookup, setCustomerLookup] = useState<any>(null);
```

**API Endpoints Used**:
- `/api/wan-ip/analyze` - IP analysis
- `/api/wan-ip/lookup` - Customer lookup
- `/api/wan-ip/lookup-by-customer` - Customer-specific lookup

**UI Components**:
- Form inputs with validation
- Results cards with network information
- Loading states and error handling
- Responsive tables for data display

### Modem Configuration Tutorials (`app/tools/modem-tutorials/page.tsx`)

**Purpose**: Video tutorial library for modem configuration

**Key Features**:
- **YouTube Integration**: Fetches videos from Yoh-Tech Solutions channel
- **Advanced Filtering**: Filter by modem model, connection type, difficulty
- **Search Functionality**: Real-time video search
- **Categorization**: Automatic video categorization
- **Responsive Design**: Mobile-optimized video grid

**YouTube API Integration**:
```typescript
const fetchVideos = async () => {
  const response = await fetch('/api/youtube/videos');
  const data = await response.json();
  setVideos(data.videos || []);
};
```

**Filtering System**:
- Primary keywords: modem, router, configuration
- Secondary keywords: setup, tutorial, guide
- Exclusion keywords: non-technical content
- Relevance scoring based on views and content

### Technician Dashboard (`app/technician/dashboard/page.tsx`)

**Purpose**: Specialized interface for Ethio Telecom technicians

**Key Features**:
- **IP Pool Management**: View and manage IP pools
- **Assignment Statistics**: Recent assignments and usage
- **Customer Management**: Customer lookup and assignment
- **Regional Overview**: Region-specific statistics

**Role-Based Access**:
- Only accessible to ETHIO_TELECOM_TECHNICIAN role
- Enhanced permissions for IP management
- Customer data access

### IP Pool Management (`app/technician/ip-pools/page.tsx`)

**Purpose**: IP pool creation and management

**Key Features**:
- **Pool Creation**: Create new IP pools with validation
- **Pool Statistics**: Usage and availability tracking
- **Regional Filtering**: Filter pools by region
- **Customer Type Support**: Residential vs Enterprise pools

### History & Save (`app/dashboard/history/page.tsx`)

**Purpose**: User's calculation history and saved items

**Key Features**:
- **History Display**: Chronological list of calculations
- **Search Functionality**: Search through saved calculations
- **Detail View**: Detailed calculation information
- **Export Options**: Save and share calculations

### Knowledge Base (`app/knowledge-base/page.tsx`)

**Purpose**: Educational resources and tutorials

**Key Features**:
- **Article Management**: Knowledge base articles
- **Video Integration**: Embedded tutorial videos
- **Search Functionality**: Content search
- **Category Organization**: Organized by topics

---

## API Routes

### Authentication APIs

#### `/api/auth/[...nextauth]/route.ts`
**Purpose**: NextAuth.js authentication handler
**Methods**: GET, POST
**Features**: Session management, JWT tokens, role-based access

#### `/api/auth/login/route.ts`
**Purpose**: Custom login endpoint
**Methods**: POST
**Request Body**:
```typescript
{
  email: string;
  password: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

#### `/api/auth/signup/route.ts`
**Purpose**: User registration
**Methods**: POST
**Request Body**:
```typescript
{
  name: string;
  email: string;
  password: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

### WAN IP Analysis APIs

#### `/api/wan-ip/analyze/route.ts`
**Purpose**: Comprehensive IP analysis
**Methods**: POST
**Request Body**:
```typescript
{
  wanIp: string;
}
```
**Response**:
```typescript
{
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  totalHosts: number;
  usableHosts: number;
  usableIpRange: string;
  interface: {
    name: string;
    region: string;
  };
  region: {
    name: string;
    code: string;
  };
  recommendations: {
    routerModel: string;
    tutorials: string[];
  };
}
```

#### `/api/wan-ip/lookup/route.ts`
**Purpose**: Customer lookup by IP
**Methods**: GET
**Query Parameters**:
- `ip`: IP address to lookup
**Response**:
```typescript
{
  found: boolean;
  customer?: {
    accountNumber: string;
    customerName: string;
    location: string;
    serviceType: string;
  };
  networkConfig?: {
    wanIp: string;
    subnetMask: string;
    defaultGateway: string;
  };
}
```

#### `/api/wan-ip/lookup-by-customer/route.ts`
**Purpose**: Customer lookup by account/access number
**Methods**: GET
**Query Parameters**:
- `accountNumber`: Customer account number
- `accessNumber`: Customer access number
**Response**: Customer information and network configuration

#### `/api/wan-ip/pool-info/route.ts`
**Purpose**: IP pool information
**Methods**: GET
**Query Parameters**:
- `ip`: IP address
**Response**: Pool details, interface information, region data

### CRM Integration APIs

#### `/api/crm/customer-lookup/route.ts`
**Purpose**: CRM system integration
**Methods**: GET
**Query Parameters**:
- `accountNumber`: 9-digit account number
- `accessNumber`: 11-digit access number
**Response**:
```typescript
{
  found: boolean;
  source: 'crm' | 'local';
  customer: {
    accountNumber: string;
    customerName: string;
    location: string;
    serviceType: string;
    customerType: string;
  };
  networkConfig: {
    wanIp?: string;
    subnetMask?: string;
    defaultGateway?: string;
    needsAssignment?: boolean;
  };
  recommendations: {
    routerModel: string;
    tutorials: string[];
  };
}
```

### VPN Data Customers API

#### `/api/vpn-data-customers/route.ts`
**Purpose**: VPN/Data only customer management
**Methods**: GET, POST
**GET Response**: Customer lookup
**POST Request**:
```typescript
{
  accountNumber: string;
  accessNumber?: string;
  customerName: string;
  location: string;
  wanIp: string;
  customerType: 'RESIDENTIAL' | 'ENTERPRISE';
}
```

### Technician APIs

#### `/api/technician/assign-ip/route.ts`
**Purpose**: IP assignment to customers
**Methods**: POST
**Request Body**:
```typescript
{
  accountNumber: string;
  wanIp: string;
  customerName: string;
  location: string;
  customerType: string;
}
```

#### `/api/technician/dashboard/stats/route.ts`
**Purpose**: Technician dashboard statistics
**Methods**: GET
**Response**:
```typescript
{
  totalPools: number;
  totalAssignments: number;
  recentAssignments: any[];
  poolStats: any[];
}
```

#### `/api/technician/pools/route.ts`
**Purpose**: IP pool management
**Methods**: GET, POST
**GET Response**: List of IP pools
**POST Request**: Create new IP pool

### YouTube Integration API

#### `/api/youtube/videos/route.ts`
**Purpose**: YouTube video fetching and categorization
**Methods**: GET
**Response**:
```typescript
{
  videos: YouTubeVideo[];
  categories: {
    modemModels: string[];
    connectionTypes: string[];
    difficulties: string[];
    serviceTypes: string[];
  };
}
```

**Video Processing**:
- Fetches videos from YouTube channel
- Filters for modem/tech content
- Categorizes by model, connection type, difficulty
- Sorts by relevance and view count

### Calculations API

#### `/api/calculations/route.ts`
**Purpose**: User calculation management
**Methods**: GET, POST
**GET Response**: User's saved calculations
**POST Request**: Save new calculation

---

## Styling System

### Tailwind CSS Configuration

**File**: `tailwind.config.ts`

```typescript
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
```

### CSS Variables

**File**: `app/globals.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Component Styling Patterns

#### Card Components
```css
.card {
  @apply bg-card text-card-foreground rounded-lg border shadow-sm;
}

.card-header {
  @apply flex flex-col space-y-1.5 p-6;
}

.card-content {
  @apply p-6 pt-0;
}
```

#### Button Components
```css
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}
```

#### Form Components
```css
.input {
  @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}
```

### Responsive Design

#### Breakpoints
- **Mobile**: `sm:` (640px+)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

#### Mobile-First Approach
```css
/* Mobile styles (default) */
.container {
  @apply px-4 py-2;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    @apply px-6 py-4;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    @apply px-8 py-6;
  }
}
```

### Dark Mode Support

#### Theme Provider
**File**: `lib/theme-provider.tsx`

```typescript
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
```

#### Theme Toggle Component
**File**: `components/theme-toggle.tsx`

```typescript
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Bot Integration

### Telegram Bot

**File**: `bot.ts`

**Purpose**: Customer support automation and notifications

**Features**:
- **Customer Support**: Automated responses to common queries
- **IP Lookup**: Telegram-based IP address lookup
- **Notifications**: System notifications and alerts
- **Multi-language Support**: Support for multiple languages

**Configuration**:
```typescript
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to IP Toolkit Pro!');
});

bot.onText(/\/lookup (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const ip = match![1];
  
  try {
    const response = await fetch(`${process.env.APP_URL}/api/wan-ip/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wanIp: ip })
    });
    
    const data = await response.json();
    bot.sendMessage(chatId, `IP Analysis: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    bot.sendMessage(chatId, 'Error analyzing IP address');
  }
});
```

**Commands**:
- `/start` - Welcome message
- `/lookup <ip>` - IP address analysis
- `/help` - Command help
- `/status` - System status

---

## Deployment Guide

### Environment Variables

**File**: `.env`

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ip_toolkit_pro"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-bot-token"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"
YOUTUBE_CHANNEL_ID="UC20UnSFgW5KadIRHbo-Rbkg"

# Ethio Telecom CRM
ETHIO_TELECOM_CRM_API_URL="https://api.ethiotelecom.et"
ETHIO_TELECOM_CRM_API_KEY="your-crm-api-key"
```

### Build Process

**Development**:
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
```

**Start Production**:
```bash
npm run start
```

**Bot Development**:
```bash
npm run bot:dev
```

**Bot Production**:
```bash
npm run bot:build
npm run bot:start
```

### Database Setup

**Prisma Migration**:
```bash
npx prisma migrate dev
```

**Generate Prisma Client**:
```bash
npx prisma generate
```

**Seed Database**:
```bash
npx prisma db seed
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ip_toolkit_pro
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ip_toolkit_pro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

#### POST /api/auth/signup
Register a new user account.

**Request**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

### WAN IP Analysis Endpoints

#### POST /api/wan-ip/analyze
Analyze a WAN IP address and provide comprehensive network information.

**Request**:
```json
{
  "wanIp": "10.239.139.51"
}
```

**Response**:
```json
{
  "ipAddress": "10.239.139.51",
  "cidr": 19,
  "subnetMask": "255.255.224.0",
  "networkAddress": "10.239.128.0",
  "broadcastAddress": "10.239.159.255",
  "totalHosts": 8192,
  "usableHosts": 8190,
  "usableIpRange": "10.239.128.1 - 10.239.159.254",
  "interface": {
    "name": "Vbui300",
    "region": "Addis Ababa"
  },
  "region": {
    "name": "Addis Ababa",
    "code": "AA"
  },
  "recommendations": {
    "routerModel": "TP-Link Archer C6",
    "tutorials": [
      "https://youtube.com/watch?v=example1",
      "https://youtube.com/watch?v=example2"
    ]
  }
}
```

#### GET /api/wan-ip/lookup
Lookup customer information by IP address.

**Request**:
```
GET /api/wan-ip/lookup?ip=10.239.139.51
```

**Response**:
```json
{
  "found": true,
  "customer": {
    "accountNumber": "123456789",
    "customerName": "John Doe",
    "location": "Addis Ababa",
    "serviceType": "WAN_IP"
  },
  "networkConfig": {
    "wanIp": "10.239.139.51",
    "subnetMask": "255.255.224.0",
    "defaultGateway": "10.239.128.1"
  }
}
```

### CRM Integration Endpoints

#### GET /api/crm/customer-lookup
Lookup customer information from CRM system.

**Request**:
```
GET /api/crm/customer-lookup?accountNumber=123456789
```

**Response**:
```json
{
  "found": true,
  "source": "crm",
  "customer": {
    "accountNumber": "123456789",
    "customerName": "John Doe",
    "location": "Addis Ababa",
    "serviceType": "WAN_IP",
    "customerType": "RESIDENTIAL"
  },
  "networkConfig": {
    "wanIp": "10.239.139.51",
    "subnetMask": "255.255.224.0",
    "defaultGateway": "10.239.128.1"
  },
  "recommendations": {
    "routerModel": "TP-Link Archer C6",
    "tutorials": [
      "https://youtube.com/watch?v=example1"
    ]
  }
}
```

### Technician Endpoints

#### POST /api/technician/assign-ip
Assign IP address to customer.

**Request**:
```json
{
  "accountNumber": "123456789",
  "wanIp": "10.239.139.51",
  "customerName": "John Doe",
  "location": "Addis Ababa",
  "customerType": "RESIDENTIAL"
}
```

**Response**:
```json
{
  "success": true,
  "assignment": {
    "id": "assignment_id",
    "accountNumber": "123456789",
    "wanIp": "10.239.139.51",
    "customerName": "John Doe",
    "assignedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/technician/dashboard/stats
Get technician dashboard statistics.

**Response**:
```json
{
  "totalPools": 25,
  "totalAssignments": 150,
  "recentAssignments": [
    {
      "id": "assignment_id",
      "customerName": "John Doe",
      "wanIp": "10.239.139.51",
      "assignedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "poolStats": [
    {
      "poolName": "Addis Ababa Residential",
      "totalIps": 1000,
      "usedIps": 750,
      "availableIps": 250
    }
  ]
}
```

### YouTube Integration Endpoints

#### GET /api/youtube/videos
Fetch and categorize YouTube videos.

**Response**:
```json
{
  "videos": [
    {
      "id": "video_id",
      "title": "Huawei Modem Configuration Tutorial",
      "description": "Step-by-step guide to configure Huawei modem",
      "thumbnailUrl": "https://img.youtube.com/vi/video_id/maxresdefault.jpg",
      "videoUrl": "https://youtube.com/watch?v=video_id",
      "viewCount": 15000,
      "likeCount": 500,
      "publishedAt": "2024-01-01T00:00:00Z",
      "modemModel": "Huawei",
      "connectionType": "Fiber",
      "difficulty": "Beginner",
      "serviceType": "WAN_IP",
      "relevanceScore": 95
    }
  ],
  "categories": {
    "modemModels": ["Huawei", "TP-Link", "D-Link", "Cisco"],
    "connectionTypes": ["Fiber", "Copper", "DSL"],
    "difficulties": ["Beginner", "Intermediate", "Advanced"],
    "serviceTypes": ["WAN_IP", "PPPOE", "BROADBAND_INTERNET"]
  }
}
```

### Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

**Common Error Codes**:
- `INVALID_INPUT` - Invalid request parameters
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

---

## Conclusion

IP Toolkit Pro is a comprehensive network management platform designed specifically for Ethio Telecom's infrastructure. The application provides:

1. **Advanced IP Analysis**: Intelligent WAN IP analysis with automatic calculations
2. **Customer Management**: Integration with CRM systems for customer data
3. **Technician Tools**: Specialized interfaces for network technicians
4. **Educational Resources**: Video tutorials and knowledge base
5. **Modern Architecture**: Built with Next.js, TypeScript, and PostgreSQL
6. **Security**: Role-based access control and secure authentication
7. **Responsive Design**: Mobile-first approach with dark mode support
8. **Bot Integration**: Telegram bot for customer support automation

The application is production-ready with comprehensive error handling, validation, and security measures. It serves as a complete solution for Ethio Telecom's network management needs.
