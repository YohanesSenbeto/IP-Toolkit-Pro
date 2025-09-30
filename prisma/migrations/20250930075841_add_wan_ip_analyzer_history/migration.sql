-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ServiceType" ADD VALUE 'BROADBAND_INTERNET';
ALTER TYPE "public"."ServiceType" ADD VALUE 'VPN_DATA_ONLY';

-- CreateTable
CREATE TABLE "public"."WanIpAnalyzerHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "wanIp" TEXT NOT NULL,
    "subnetMask" TEXT,
    "defaultGateway" TEXT,
    "cidr" INTEGER,
    "usableHosts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WanIpAnalyzerHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WanIpAnalyzerHistory" ADD CONSTRAINT "WanIpAnalyzerHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
