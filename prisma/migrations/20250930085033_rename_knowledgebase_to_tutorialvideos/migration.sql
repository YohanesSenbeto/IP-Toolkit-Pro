/*
  Warnings:

  - You are about to drop the `KnowledgeBaseArticle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."KnowledgeBaseArticle" DROP CONSTRAINT "KnowledgeBaseArticle_authorId_fkey";

-- DropTable
DROP TABLE "public"."KnowledgeBaseArticle";

-- CreateTable
CREATE TABLE "public"."TutorialVideos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "routerModels" TEXT[],
    "category" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TutorialVideos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorialVideos_slug_key" ON "public"."TutorialVideos"("slug");

-- AddForeignKey
ALTER TABLE "public"."TutorialVideos" ADD CONSTRAINT "TutorialVideos_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
