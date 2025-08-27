/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProviderProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Proposal" DROP CONSTRAINT "Proposal_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Proposal" DROP CONSTRAINT "Proposal_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Proposal" DROP CONSTRAINT "Proposal_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProviderProfile" DROP CONSTRAINT "ProviderProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Request" DROP CONSTRAINT "Request_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_providerId_fkey";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."Proposal";

-- DropTable
DROP TABLE "public"."ProviderProfile";

-- DropTable
DROP TABLE "public"."Request";

-- DropTable
DROP TABLE "public"."Review";

-- DropTable
DROP TABLE "public"."Service";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."ProposalStatus";

-- DropEnum
DROP TYPE "public"."RequestStatus";

-- DropEnum
DROP TYPE "public"."Role";
