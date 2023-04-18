/*
  Warnings:

  - A unique constraint covering the columns `[name,cinemaId]` on the table `CinemaHall` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `CinemaHall` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CinemaHall" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CinemaHall_name_cinemaId_key" ON "CinemaHall"("name", "cinemaId");
