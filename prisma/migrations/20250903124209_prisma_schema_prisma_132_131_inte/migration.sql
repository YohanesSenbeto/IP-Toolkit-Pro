-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'ETHIO_TELECOM_TECHNICIAN';

-- CreateTable
CREATE TABLE "public"."ethio_telecom_regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ethio_telecom_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ethio_telecom_interfaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "ipPoolStart" TEXT NOT NULL,
    "ipPoolEnd" TEXT NOT NULL,
    "subnetMask" TEXT NOT NULL,
    "defaultGateway" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ethio_telecom_interfaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ethio_telecom_technicians" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "regionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ethio_telecom_technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_wan_ips" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accessNumber" TEXT,
    "wanIp" TEXT NOT NULL,
    "interfaceId" TEXT,
    "customerName" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_wan_ips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ethio_telecom_regions_name_key" ON "public"."ethio_telecom_regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ethio_telecom_technicians_employeeId_key" ON "public"."ethio_telecom_technicians"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ethio_telecom_technicians_username_key" ON "public"."ethio_telecom_technicians"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ethio_telecom_technicians_email_key" ON "public"."ethio_telecom_technicians"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_wan_ips_accountNumber_key" ON "public"."customer_wan_ips"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customer_wan_ips_accessNumber_key" ON "public"."customer_wan_ips"("accessNumber");

-- AddForeignKey
ALTER TABLE "public"."ethio_telecom_interfaces" ADD CONSTRAINT "ethio_telecom_interfaces_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."ethio_telecom_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ethio_telecom_technicians" ADD CONSTRAINT "ethio_telecom_technicians_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."ethio_telecom_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_wan_ips" ADD CONSTRAINT "customer_wan_ips_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."ethio_telecom_interfaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
