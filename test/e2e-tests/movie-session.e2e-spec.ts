import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import * as movies from '../../data/movies.json'
import { formatLogSessionTime } from '../../src/utils/helpers/formatLogSessionTime'
import { initMovieSessionMocks } from '../mocks/movie-session.mock'
import { TypeSeatEnum } from '@prisma/client'

describe('Movie Session endoints (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  const imdbId1 = 'tt0068646'
  const imdbId2 = 'tt0111161'

  const movieSessionShape = expect.objectContaining({
    id: expect.any(Number),
    movieId: expect.any(Number),
    cinemaId: expect.any(Number),
    startDate: expect.any(String),
    price: expect.any(Number),
  })

  let movieId1: number
  let movieId2: number
  let cinemaId1: number
  let cinemaId2: number
  const durationMovie1 = movies.find((m) => m.id === imdbId1)?.duration as number // 120 min for movie1
  const durationMovie2 = movies.find((m) => m.id === imdbId2)?.duration as number // 160 min for movie2
  /**
   * Create:
   *   2 movies,
   *   2 cinema
   * Add:
   *  1 movie to cinema1
   *  1 movie to cinema2
   *  1 movie session
   */
  async function runInitMovieDataMigration(prisma: PrismaService) {
    async function createTypeSeats() {
      await prisma.typeSeat.createMany({
        data: [{ type: TypeSeatEnum.SEAT }, { type: TypeSeatEnum.VIP }, { type: TypeSeatEnum.LOVE }],
      })
    }

    /**
     * Add movies to db
     */
    const newMovie1 = await prisma.movieRecord.create({
      data: {
        imdbId: imdbId1,
      },
    })
    const newMovie2 = await prisma.movieRecord.create({
      data: {
        imdbId: imdbId2,
      },
    })
    movieId1 = newMovie1.id
    movieId2 = newMovie2.id

    /**
     * Add cinema to db
     */
    const newCinema1 = await prisma.cinema.create({
      data: {
        name: 'Aurora',
        address: 'str Romanovskaya 5',
        city: 'Gomel',
      },
    })
    const newCinema2 = await prisma.cinema.create({
      data: {
        name: 'DOM KINO',
        address: 'str Pochkova 15',
        city: 'Minsk',
      },
    })
    cinemaId1 = newCinema1.id
    cinemaId2 = newCinema2.id

    await createTypeSeats()
    /**
     * Add movie1 to cinema1
     */
    await prisma.movieOnCinema.create({
      data: {
        movieId: movieId1,
        cinemaId: cinemaId1,
      },
    })
    /**
     * Add movie2 to cinema1
     */
    await prisma.movieOnCinema.create({
      data: {
        movieId: movieId2,
        cinemaId: cinemaId1,
      },
    })
    /**
     * Add movie1 to cinema2
     */
    await prisma.movieOnCinema.create({
      data: {
        movieId: movieId1,
        cinemaId: cinemaId2,
      },
    })
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)

    app.useGlobalPipes(new ValidationPipe())

    await app.init()
    await runInitMovieDataMigration(prisma)
  })

  afterAll(async () => {
    await prisma.clearDatabase()
    await app.close()
  })

  const { successMockDataControlCase, failMockGapData, successMockGapData, failMockData } =
    initMovieSessionMocks(durationMovie1)

  describe('POST /createMovieSession', () => {
    /**
     * Tests for cinema1 and movie1
     */

    for (const test of successMockDataControlCase) {
      it(`${test.name}, ${formatLogSessionTime({ startDate: test.startDate, duration: test.duration })}`, async () => {
        const { body, status } = await request(app.getHttpServer()).post('/movies-sessions').send({
          cinemaId: cinemaId1,
          movieId: movieId1,
          startDate: test.startDate,
          price: test.price,
          priceFactors: test.priceFactors,
        })

        expect(status).toBe(201)
        expect(body).toStrictEqual(movieSessionShape)
      })
    }

    for (const test of failMockGapData) {
      it(`${test.name}, ${formatLogSessionTime({ startDate: test.startDate, duration: test.duration })}`, async () => {
        const { status } = await request(app.getHttpServer()).post('/movies-sessions').send({
          cinemaId: cinemaId1,
          movieId: movieId1,
          startDate: test.startDate,
          price: test.price,
          priceFactors: test.priceFactors,
        })

        expect(status).toBe(400)
      })
    }

    for (const test of successMockGapData) {
      it(`${test.name}, ${formatLogSessionTime({ startDate: test.startDate, duration: test.duration })}`, async () => {
        const { body, status } = await request(app.getHttpServer()).post('/movies-sessions').send({
          cinemaId: cinemaId1,
          movieId: movieId1,
          startDate: test.startDate,
          price: test.price,
          priceFactors: test.priceFactors,
        })

        expect(status).toBe(201)
        expect(body).toStrictEqual(movieSessionShape)
      })
    }

    for (const test of failMockData) {
      it(`${test.name}, ${formatLogSessionTime({ startDate: test.startDate, duration: test.duration })}`, async () => {
        const { status } = await request(app.getHttpServer()).post('/movies-sessions').send({
          cinemaId: cinemaId1,
          movieId: movieId1,
          startDate: test.startDate,
          price: test.price,
          priceFactors: test.priceFactors,
        })

        expect(status).toBe(400)
      })
    }

    /**
     * Tests for cinema2
     */

    it(`(success) - overlapping time but another cinema`, async () => {
      const { body, status } = await request(app.getHttpServer())
        .post('/movies-sessions')
        .send({
          cinemaId: cinemaId2,
          movieId: movieId1,
          startDate: new Date('July 1, 2022, 16:00:00'),
          price: 50,
          priceFactors: {
            SEAT: 1,
            VIP: 1.5,
            LOVE: 2.25,
          },
        })

      expect(status).toBe(201)
      expect(body).toStrictEqual(movieSessionShape)
    })

    it(`(fail) - that movie is not available for cinema: ${formatLogSessionTime({
      startDate: new Date('July 2, 2022, 22:00:00'),
      duration: durationMovie2,
    })} `, async () => {
      const { status } = await request(app.getHttpServer())
        .post('/movies-sessions')
        .send({
          cinemaId: cinemaId2,
          movieId: movieId2,
          startDate: new Date('July 2, 2022, 22:00:00'),
          price: 50,
          priceFactors: {
            SEAT: 1,
            VIP: 1.5,
            LOVE: 2.25,
          },
        })

      expect(status).toBe(400)
    })
  })
})
