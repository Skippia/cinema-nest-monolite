-- DropForeignKey
ALTER TABLE "CinemaHall" DROP CONSTRAINT "CinemaHall_cinemaId_fkey";

-- DropForeignKey
ALTER TABLE "SeatOnCinemaHall" DROP CONSTRAINT "SeatOnCinemaHall_cinemaHallId_fkey";

-- AddForeignKey
ALTER TABLE "CinemaHall" ADD CONSTRAINT "CinemaHall_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatOnCinemaHall" ADD CONSTRAINT "SeatOnCinemaHall_cinemaHallId_fkey" FOREIGN KEY ("cinemaHallId") REFERENCES "CinemaHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
