/*
  Warnings:

  - You are about to drop the column `end_date` on the `MovieSession` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `MovieSession` table. All the data in the column will be lost.
  - You are about to drop the column `available` on the `SeatOnCinema` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `MovieSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `MovieSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "totalPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MovieSession" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SeatOnCinema" DROP COLUMN "available";
