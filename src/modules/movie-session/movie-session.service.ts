import { Injectable } from '@nestjs/common'
import { CurrencyEnum, MovieSession, Prisma, TypeSeat, TypeSeatEnum } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateMovieSessionDto } from './dto/update-movie-session.dto'

@Injectable()
export class MovieSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllMovieSessions(): Promise<MovieSession[]> {
    return await this.prisma.movieSession.findMany()
  }

  async findOneMovieSession(movieSessionId: number): Promise<MovieSession | null> {
    return await this.prisma.movieSession.findUnique({ where: { id: movieSessionId } })
  }

  async createMovieSession({
    startDate,
    endDate,
    movieId,
    cinemaHallId,
    price,
    currency,
    priceFactors,
  }: {
    startDate: Date
    endDate: Date
    movieId: number
    cinemaHallId: number
    price: number
    currency?: CurrencyEnum
    priceFactors: Record<TypeSeatEnum, number>
  }): Promise<MovieSession> {
    const typeSeatArray = await this.prisma.typeSeat.findMany()

    const movieSession = await this.prisma.$transaction(async (tx) => {
      const movieSession = await tx.movieSession.create({
        data: { startDate, endDate, movieId, cinemaHallId, price, currency },
      })

      await tx.movieSessionMultiFactor.createMany({
        data: Object.keys(priceFactors).map((priceFactorKey) => ({
          movieSessionId: movieSession.id,
          typeSeatId: (typeSeatArray.find((x) => x.type === priceFactorKey) as TypeSeat).id,
          priceFactor: priceFactors[priceFactorKey as keyof typeof priceFactors],
        })),
      })

      return movieSession
    })

    return movieSession
  }

  async findOverlappingMovieSession({
    startDate,
    endDate,
    cinemaHallId,
    timeGapBetweenMovieSession,
  }: {
    startDate: Date
    endDate: Date
    cinemaHallId: number
    timeGapBetweenMovieSession: number
  }) {
    const overlappingMovieSession = await this.prisma.movieSession.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: new Date(endDate.getTime() + timeGapBetweenMovieSession * 60000),
            },
            cinemaHallId,
          },
          {
            endDate: {
              gte: new Date(startDate.getTime() - timeGapBetweenMovieSession * 60000),
              lte: endDate,
            },
            cinemaHallId,
          },
        ],
      },
    })

    return overlappingMovieSession
  }

  async updateMovieSession(
    movieSessionId: number,
    updateMovieSessionDto: UpdateMovieSessionDto,
  ): Promise<MovieSession> {
    return await this.prisma.movieSession.update({
      where: { id: movieSessionId },
      data: updateMovieSessionDto,
    })
  }

  async deleteMovieSession(movieSessionId: number): Promise<MovieSession> {
    return await this.prisma.movieSession.delete({ where: { id: movieSessionId } })
  }

  async resetMoviesSessionsForCinemaHall(cinemaHallId: number): Promise<Prisma.BatchPayload> {
    return await this.prisma.movieSession.deleteMany({ where: { cinemaHallId } })
  }
}
