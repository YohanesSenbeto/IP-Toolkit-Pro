-- AlterTable
ALTER TABLE "public"."customer_wan_ips" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "technicianId" TEXT;

-- AlterTable
ALTER TABLE "public"."ethio_telecom_technicians" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "public"."customer_wan_ips" ADD CONSTRAINT "customer_wan_ips_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."ethio_telecom_technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
