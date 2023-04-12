-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "MovieOnCinema" DROP CONSTRAINT "MovieOnCinema_cinemaId_fkey";

-- DropForeignKey
ALTER TABLE "MovieOnCinema" DROP CONSTRAINT "MovieOnCinema_movieId_fkey";

-- DropForeignKey
ALTER TABLE "MovieSession" DROP CONSTRAINT "MovieSession_cinemaId_fkey";

-- DropForeignKey
ALTER TABLE "MovieSession" DROP CONSTRAINT "MovieSession_movieId_fkey";

-- DropForeignKey
ALTER TABLE "MovieSessionMultiFactor" DROP CONSTRAINT "MovieSessionMultiFactor_movieSessionId_fkey";

-- DropForeignKey
ALTER TABLE "MovieSessionMultiFactor" DROP CONSTRAINT "MovieSessionMultiFactor_typeSeatId_fkey";

-- DropForeignKey
ALTER TABLE "RTSession" DROP CONSTRAINT "RTSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "SeatOnBooking" DROP CONSTRAINT "SeatOnBooking_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "SeatOnBooking" DROP CONSTRAINT "SeatOnBooking_seatId_fkey";

-- DropForeignKey
ALTER TABLE "SeatOnCinema" DROP CONSTRAINT "SeatOnCinema_cinemaId_fkey";

-- DropForeignKey
ALTER TABLE "SeatOnCinema" DROP CONSTRAINT "SeatOnCinema_seatId_fkey";

-- DropForeignKey
ALTER TABLE "SeatOnCinema" DROP CONSTRAINT "SeatOnCinema_typeSeatId_fkey";

-- AddForeignKey
ALTER TABLE "RTSession" ADD CONSTRAINT "RTSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOnCinema" ADD CONSTRAINT "MovieOnCinema_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOnCinema" ADD CONSTRAINT "MovieOnCinema_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "MovieRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSession" ADD CONSTRAINT "MovieSession_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "MovieRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSession" ADD CONSTRAINT "MovieSession_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatOnBooking" ADD CONSTRAINT "SeatOnBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatOnBooking" ADD CONSTRAINT "SeatOnBooking_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatOnCinema" ADD CONSTRAINT "SeatOnCinema_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatOnCinema" ADD CONSTRAINT "SeatOnCinema_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatOnCinema" ADD CONSTRAINT "SeatOnCinema_typeSeatId_fkey" FOREIGN KEY ("typeSeatId") REFERENCES "TypeSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSessionMultiFactor" ADD CONSTRAINT "MovieSessionMultiFactor_movieSessionId_fkey" FOREIGN KEY ("movieSessionId") REFERENCES "MovieSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSessionMultiFactor" ADD CONSTRAINT "MovieSessionMultiFactor_typeSeatId_fkey" FOREIGN KEY ("typeSeatId") REFERENCES "TypeSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
