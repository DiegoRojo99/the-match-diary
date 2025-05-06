/*
  Warnings:

  - You are about to drop the column `country` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "country",
DROP COLUMN "logoUrl",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "apiId" INTEGER NOT NULL,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "clubColors" TEXT,
ADD COLUMN     "crest" TEXT,
ADD COLUMN     "stadiumId" TEXT,
ADD COLUMN     "tla" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Stadium" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_apiId_key" ON "Team"("apiId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
