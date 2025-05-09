/*
  Warnings:

  - A unique constraint covering the columns `[apiId]` on the table `Competition` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Competition" ALTER COLUMN "apiId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Competition_apiId_key" ON "Competition"("apiId");
