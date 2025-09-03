-- CreateTable
CREATE TABLE "public"."wan_ips" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "cidr" INTEGER NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "routerModel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wan_ips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."router_models" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capabilities" TEXT[],
    "tutorialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "router_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wan_ips_ipAddress_key" ON "public"."wan_ips"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "router_models_modelName_key" ON "public"."router_models"("modelName");
