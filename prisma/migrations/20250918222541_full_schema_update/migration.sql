-- AlterTable
ALTER TABLE "public"."WanIpPool" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."customer_wan_ips" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."ethio_telecom_regions" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."router_models" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
