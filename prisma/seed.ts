import { ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { TestingModule, Test } from '@nestjs/testing'
import { PrismaClient, TypeSeatEnum } from '@prisma/client'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/modules/prisma/prisma.service'
import { loadMovies } from 'test/helpers/common'
import {
  createUsers,
  createSeats,
  createTypeSeats,
  createCinemas,
  addMoviesToCinemas,
  createSeatingCinemaSchemas,
} from 'test/helpers/create'

const prisma = new PrismaClient() as PrismaService

let prismaInApp: PrismaService
let app: NestApplication

async function createApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  app = moduleFixture.createNestApplication()
  prismaInApp = app.get<PrismaService>(PrismaService)

  app.useGlobalPipes(new ValidationPipe())

  await app.init()
}

async function main() {
  async function createMovieSessions() {
    const mapSeat = await prisma.typeSeat.findMany()
    const priceFactors: Record<TypeSeatEnum, number> = {
      SEAT: 1,
      VIP: 1.5,
      LOVE: 2.25,
    }
    const movieSession1 = await prisma.movieSession.create({
      data: {
        // startDate: '2024-01-10T10:00:01.504Z',
        // endDate: '2024-01-10T12:50:01.504Z',
        startDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1),
        ),
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1),
        ),
        movieId: 1,
        cinemaId: 1,
        price: 40,
        currency: 'USD',
      },
    })

    await prisma.movieSessionMultiFactor.createMany({
      data: Object.keys(TypeSeatEnum).map((typeSeatEnumKey) => ({
        movieSessionId: movieSession1.id,
        typeSeatId: mapSeat.find((el) => el.type === typeSeatEnumKey)?.id as number,
        priceFactor: priceFactors[typeSeatEnumKey as keyof typeof priceFactors],
      })),
    })

    const movieSession2 = await prisma.movieSession.create({
      data: {
        // startDate: '2024-01-10T10:00:01.504Z',
        // endDate: '2024-01-10T12:50:01.504Z',
        startDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1),
        ),
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1),
        ),
        movieId: 1,
        cinemaId: 2,
        price: 60,
        currency: 'USD',
      },
    })

    await prisma.movieSessionMultiFactor.createMany({
      data: Object.keys(TypeSeatEnum).map((typeSeatEnumKey) => ({
        movieSessionId: movieSession2.id,
        typeSeatId: mapSeat.find((el) => el.type === typeSeatEnumKey)?.id as number,
        priceFactor: priceFactors[typeSeatEnumKey as keyof typeof priceFactors],
      })),
    })

    const movieSession3 = await prisma.movieSession.create({
      data: {
        // startDate: '2024-01-10T10:00:01.504Z',
        // endDate: '2024-01-10T12:10:01.504Z',
        startDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 10, 1),
        ),
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 10, 1),
        ),
        movieId: 2,
        cinemaId: 3,
        price: 80,
        currency: 'USD',
      },
    })

    await prisma.movieSessionMultiFactor.createMany({
      data: Object.keys(TypeSeatEnum).map((typeSeatEnumKey) => ({
        movieSessionId: movieSession3.id,
        typeSeatId: mapSeat.find((el) => el.type === typeSeatEnumKey)?.id as number,
        priceFactor: priceFactors[typeSeatEnumKey as keyof typeof priceFactors],
      })),
    })
  }

  await createApp()
  // await prismaInApp.clearDatabase()

  await createUsers(prisma)
  await createSeats(prisma)
  await createTypeSeats(prisma)
  await createCinemas(prisma)
  await loadMovies(prisma)
  await addMoviesToCinemas(prisma, [
    { cinemaId: 1, movieId: 1 },
    { cinemaId: 1, movieId: 2 },
    { cinemaId: 2, movieId: 1 },
    { cinemaId: 3, movieId: 1 },
    { cinemaId: 3, movieId: 2 },
  ])
  await createMovieSessions()
  await createSeatingCinemaSchemas(app)
}
// execute the main function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect()
  })
