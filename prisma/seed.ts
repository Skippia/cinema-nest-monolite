import { PrismaService } from './../src/prisma/prisma.service'
import { Cinema, PrismaClient, TypeSeatEnum } from '@prisma/client'
import { seatsSchemaInput1, seatsSchemaInput2, seatsSchemaInput3 } from '../test/mocks/seats-in-cinema.mocks'
import * as movies from '../data/movies.json'
import * as request from 'supertest'
import { NestApplication } from '@nestjs/core'
import { TestingModule, Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { ValidationPipe } from '@nestjs/common'

const prisma = new PrismaClient()

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
  async function createSeats() {
    const colLength = 40
    const rowLength = 30

    const dataSeat = [] as { col: number; row: number }[]

    for (let x = 1; x <= colLength; x++) {
      for (let y = 1; y <= rowLength; y++) {
        dataSeat.push({ col: x, row: y })
      }
    }

    await prisma.seat.createMany({ data: dataSeat })
  }

  async function createTypeSeats() {
    await prisma.typeSeat.createMany({
      data: [{ type: TypeSeatEnum.SEAT }, { type: TypeSeatEnum.VIP }, { type: TypeSeatEnum.LOVE }],
    })
  }

  async function createCinemas() {
    const cinema1: Omit<Cinema, 'id'> = {
      name: 'Dom Kino',
      address: 'Talbuchina 18',
      city: 'Minsk',
    }
    const cinema2: Omit<Cinema, 'id'> = {
      name: 'Aurora',
      address: 'Prytyckaha 23',
      city: 'Minsk',
    }
    const cinema3: Omit<Cinema, 'id'> = {
      name: 'Rodina',
      address: 'Leninskaya 4',
      city: 'Vitebsk',
    }

    await prisma.cinema.createMany({
      data: [cinema1, cinema2, cinema3],
    })
  }

  async function addMoviesToCinemas() {
    // Adding movie1 to all cinemas3

    const movieCinema11 = {
      movieId: 1,
      cinemaId: 1,
    }

    const movieCinema21 = {
      movieId: 2,
      cinemaId: 1,
    }

    const movieCinema12 = {
      movieId: 1,
      cinemaId: 2,
    }

    const movieCinema13 = {
      movieId: 1,
      cinemaId: 3,
    }

    const movieCinema23 = {
      movieId: 2,
      cinemaId: 3,
    }

    await prisma.movieOnCinema.createMany({
      data: [movieCinema11, movieCinema21, movieCinema12, movieCinema13, movieCinema23],
    })
  }

  async function createMovieSessions() {
    await prisma.movieSession.create({
      data: {
        startDate: '2024-01-10T10:00:01.504Z',
        endDate: '2024-01-10T12:50:01.504Z',
        movieId: 1,
        cinemaId: 1,
        price: 40,
      },
    })

    await prisma.movieSession.create({
      data: {
        startDate: '2024-01-10T10:00:01.504Z',
        endDate: '2024-01-10T12:50:01.504Z',
        movieId: 1,
        cinemaId: 2,
        price: 60,
      },
    })

    await prisma.movieSession.create({
      data: {
        startDate: '2024-01-10T10:00:01.504Z',
        endDate: '2024-01-10T12:10:01.504Z',
        movieId: 2,
        cinemaId: 3,
        price: 80,
      },
    })
  }

  async function createSeatingCinemaSchemas() {
    // Seating schema for cinema1
    await request(app.getHttpServer())
      .post('/seats-in-cinema/1')
      .send({ ...seatsSchemaInput1 })

    // Seating schema for cinema2
    await request(app.getHttpServer())
      .post('/seats-in-cinema/2')
      .send({ ...seatsSchemaInput2 })

    // Seating schema for cinema3
    await request(app.getHttpServer())
      .post('/seats-in-cinema/3')
      .send({ ...seatsSchemaInput3 })
  }

  async function loadMovies() {
    const movieIds = movies.map((m) => ({ imdbId: m.id }))
    await prisma.movieRecord.createMany({
      data: movieIds,
    })
  }

  async function createUsers() {
    await prisma.user.create({
      data: {
        email: 'pocketbook.love24@gmail.com',
        name: 'John',
        lastName: 'Doe',
        password: 'midapa',
        role: 'USER',
        gender: 'MALE',
        language: 'EN',
      },
    })
  }
  await createApp()

  await createUsers()
  // await prismaInApp.clearDatabase()

  await createSeats()
  await createTypeSeats()
  await createCinemas()
  await createSeatingCinemaSchemas()
  await loadMovies()
  await addMoviesToCinemas()
  await createMovieSessions()
  await createSeatingCinemaSchemas()
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
