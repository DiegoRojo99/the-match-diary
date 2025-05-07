/*
  Warnings:

  - You are about to drop the column `stadium` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `teamAwayId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `teamHomeId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Stadium` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Team` table. All the data in the column will be lost.
  - Added the required column `awayTeamId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seasonId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Stadium` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamAwayId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamHomeId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "stadium",
DROP COLUMN "teamAwayId",
DROP COLUMN "teamHomeId",
ADD COLUMN     "awayTeamId" TEXT NOT NULL,
ADD COLUMN     "competitionId" TEXT NOT NULL,
ADD COLUMN     "homeTeamId" TEXT NOT NULL,
ADD COLUMN     "seasonId" TEXT NOT NULL,
ADD COLUMN     "stadiumId" TEXT,
ALTER COLUMN "homeScore" SET DEFAULT 0,
ALTER COLUMN "awayScore" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Stadium" DROP COLUMN "createdAt",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "createdAt";

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "apiId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "currentMatchday" INTEGER,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_apiId_key" ON "Season"("apiId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
