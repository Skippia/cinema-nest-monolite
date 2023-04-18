import { ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { TestingModule, Test } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/modules/prisma/prisma.service'
import { signinAccount, loadMovies } from '../test/helpers/common'
import {
  createUsers,
  createSeats,
  createTypeSeats,
  createCinemas,
  createCinemaHalls,
  addMoviesToCinemas,
} from '../test/helpers/create'
import { createMovieSessions } from '../test/helpers/create/createMoviesSessions.'

const prisma = new PrismaClient() as PrismaService

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  await createApp()

  async function seedDb() {
    // 1
    await createUsers(prisma)

    const cookies = await signinAccount(app)

    await loadMovies(prisma)
    await createSeats(prisma)
    await createTypeSeats(prisma)
    const [cinema1, cinema2] = await createCinemas(prisma)

    // 2

    await createCinemaHalls(app, cookies, cinema1, cinema2)
    await addMoviesToCinemas(prisma, [
      { cinemaId: 1, movieId: 1 },
      { cinemaId: 1, movieId: 2 },
      { cinemaId: 2, movieId: 1 },
    ])

    // 3
    await createMovieSessions(prisma)

    // 4 - create bookings
  }

  await seedDb()
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
