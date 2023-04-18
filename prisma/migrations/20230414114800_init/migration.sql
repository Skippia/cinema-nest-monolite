/*
  Warnings:

  - Changed the type of `hallType` on the `CinemaHall` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CinemaHall" DROP COLUMN "hallType",
ADD COLUMN     "hallType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "HallTypeEnum";
