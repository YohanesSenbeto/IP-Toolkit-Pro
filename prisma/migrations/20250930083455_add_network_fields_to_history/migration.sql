-- AlterTable
ALTER TABLE "public"."WanIpAnalyzerHistory" ADD COLUMN     "broadcastAddress" TEXT,
ADD COLUMN     "networkAddress" TEXT,
ADD COLUMN     "totalHosts" INTEGER;
