-- CreateEnum
CREATE TYPE "LanguageEnum" AS ENUM ('EN', 'RU');
-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('MALE', 'FEMALE');
-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('USER', 'ADMIN');
-- CreateEnum
CREATE TYPE "CurrencyEnum" AS ENUM ('USD', 'EUR', 'BYN', 'RUB');
-- CreateEnum
CREATE TYPE "TypeSeatEnum" AS ENUM ('SEAT', 'VIP', 'LOVE');
-- CreateEnum
CREATE TYPE "AuthProviderEnum" AS ENUM ('LOCAL', 'GMAIL', 'GITHUB', 'FACEBOOK');
-- CreateTable
CREATE TABLE "User" (
  "id" SERIAL NOT NULL,
  "email" TEXT,
  "username" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "avatar" TEXT,
  "hashedPassword" TEXT,
  "role" "RoleEnum" NOT NULL DEFAULT 'USER',
  "gender" "GenderEnum",
  "language" "LanguageEnum" NOT NULL DEFAULT 'EN',
  "provider" "AuthProviderEnum" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "either_email_username" CHECK (email IS NOT NULL OR username IS NOT NULL)
);
-- CreateTable
CREATE TABLE "RTSession" (
  "id" SERIAL NOT NULL,
  "hashedRt" TEXT NOT NULL,
  "rtExpDate" TIMESTAMP(3) NOT NULL,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" INTEGER NOT NULL,
  CONSTRAINT "RTSession_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Cinema" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "MovieOnCinema" (
  "cinemaId" INTEGER NOT NULL,
  "movieId" INTEGER NOT NULL,
  CONSTRAINT "MovieOnCinema_pkey" PRIMARY KEY ("cinemaId", "movieId")
);
-- CreateTable
CREATE TABLE "MovieRecord" (
  "id" SERIAL NOT NULL,
  "imdbId" TEXT NOT NULL,
  CONSTRAINT "MovieRecord_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "MovieSession" (
  "id" SERIAL NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "currency" "CurrencyEnum" NOT NULL DEFAULT 'USD',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "movieId" INTEGER NOT NULL,
  "cinemaId" INTEGER NOT NULL,
  CONSTRAINT "MovieSession_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Booking" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "totalPrice" DOUBLE PRECISION NOT NULL,
  "currency" "CurrencyEnum" NOT NULL,
  "movieSessionId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SeatOnBooking" (
  "bookingId" INTEGER NOT NULL,
  "seatId" INTEGER NOT NULL,
  CONSTRAINT "SeatOnBooking_pkey" PRIMARY KEY ("bookingId", "seatId")
);
-- CreateTable
CREATE TABLE "Seat" (
  "id" SERIAL NOT NULL,
  "row" INTEGER NOT NULL,
  "col" INTEGER NOT NULL,
  CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SeatOnCinema" (
  "seatId" INTEGER NOT NULL,
  "cinemaId" INTEGER NOT NULL,
  "typeSeatId" INTEGER NOT NULL,
  CONSTRAINT "SeatOnCinema_pkey" PRIMARY KEY ("seatId", "cinemaId")
);
-- CreateTable
CREATE TABLE "TypeSeat" (
  "id" SERIAL NOT NULL,
  "type" "TypeSeatEnum" NOT NULL,
  CONSTRAINT "TypeSeat_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "MovieSessionMultiFactor" (
  "id" SERIAL NOT NULL,
  "movieSessionId" INTEGER NOT NULL,
  "typeSeatId" INTEGER NOT NULL,
  "priceFactor" REAL NOT NULL,
  CONSTRAINT "MovieSessionMultiFactor_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
-- CreateIndex
CREATE UNIQUE INDEX "RTSession_hashedRt_userId_key" ON "RTSession"("hashedRt", "userId");
-- CreateIndex
CREATE UNIQUE INDEX "Cinema_name_address_city_key" ON "Cinema"("name", "address", "city");
-- CreateIndex
CREATE UNIQUE INDEX "MovieRecord_imdbId_key" ON "MovieRecord"("imdbId");
-- CreateIndex
CREATE UNIQUE INDEX "Seat_row_col_key" ON "Seat"("row", "col");
-- CreateIndex
CREATE UNIQUE INDEX "TypeSeat_type_key" ON "TypeSeat"("type");
-- AddForeignKey
ALTER TABLE "RTSession"
ADD CONSTRAINT "RTSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MovieOnCinema"
ADD CONSTRAINT "MovieOnCinema_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MovieOnCinema"
ADD CONSTRAINT "MovieOnCinema_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "MovieRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MovieSession"
ADD CONSTRAINT "MovieSession_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "MovieRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MovieSession"
ADD CONSTRAINT "MovieSession_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_movieSessionId_fkey" FOREIGN KEY ("movieSessionId") REFERENCES "MovieSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SeatOnBooking"
ADD CONSTRAINT "SeatOnBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SeatOnBooking"
ADD CONSTRAINT "SeatOnBooking_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SeatOnCinema"
ADD CONSTRAINT "SeatOnCinema_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SeatOnCinema"
ADD CONSTRAINT "SeatOnCinema_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SeatOnCinema"
ADD CONSTRAINT "SeatOnCinema_typeSeatId_fkey" FOREIGN KEY ("typeSeatId") REFERENCES "TypeSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MovieSessionMultiFactor"
ADD CONSTRAINT "MovieSessionMultiFactor_movieSessionId_fkey" FOREIGN KEY ("movieSessionId") REFERENCES "MovieSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MovieSessionMultiFactor"
ADD CONSTRAINT "MovieSessionMultiFactor_typeSeatId_fkey" FOREIGN KEY ("typeSeatId") REFERENCES "TypeSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
