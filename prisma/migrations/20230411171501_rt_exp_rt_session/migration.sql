/*
  Warnings:

  - Added the required column `rtExpDate` to the `RTSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RTSession" ADD COLUMN     "rtExpDate" TIMESTAMP(3) NOT NULL;
