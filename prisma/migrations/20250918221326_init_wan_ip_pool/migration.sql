/*
  Warnings:

  - You are about to drop the `wan_ips` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ethio_telecom_interfaces" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."wan_ips";

-- CreateTable
CREATE TABLE "public"."WanIpPool" (
    "id" TEXT NOT NULL,
    "poolName" TEXT NOT NULL,
    "startIp" TEXT NOT NULL,
    "endIp" TEXT NOT NULL,
    "cidr" INTEGER NOT NULL,
    "totalIps" INTEGER NOT NULL,
    "usedIps" INTEGER NOT NULL,
    "availableIps" INTEGER NOT NULL,
    "description" TEXT,
    "regionId" TEXT NOT NULL,
    "interfaceId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WanIpPool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WanIpPool" ADD CONSTRAINT "WanIpPool_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "public"."ethio_telecom_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WanIpPool" ADD CONSTRAINT "WanIpPool_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."ethio_telecom_interfaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WanIpPool" ADD CONSTRAINT "WanIpPool_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."ethio_telecom_technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
