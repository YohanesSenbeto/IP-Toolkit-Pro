-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('RESIDENTIAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('PPPOE', 'WAN_IP');

-- AlterTable
ALTER TABLE "public"."customer_wan_ips" ADD COLUMN     "customerType" "public"."CustomerType" NOT NULL DEFAULT 'RESIDENTIAL',
ADD COLUMN     "serviceType" "public"."ServiceType" NOT NULL DEFAULT 'PPPOE';
