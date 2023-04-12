/*
  Warnings:

  - A unique constraint covering the columns `[hashedRt,userId]` on the table `RTSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RTSession_hashedRt_userId_key" ON "RTSession"("hashedRt", "userId");
