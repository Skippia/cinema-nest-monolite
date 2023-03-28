import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import * as movies from '../data/movies.json'
import { formatLogSessionTime } from '../src/utils/helpers/formatLogSessionTime'
import { EXTRA_MOVIE_SESSION_TIME } from '../src/movie-session/movie-session.constants'

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

  /**
   * Mocks
   */

  const successMockDataControlCase = [
    {
      name: '(success) - CONTROL CASE',
      startDate: new Date('July 1, 2022, 14:00:00'),
      duration: durationMovie1 + EXTRA_MOVIE_SESSION_TIME,
    },
  ]

  const failMockGapData = [
    {
      name: '(fail) - gap only 1 minute: ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration + 1) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
    },
    {
      name: '(fail) - gap only 60 minute: ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration + 60) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
    },
  ]

  const successMockGapData = [
    {
      name: '(success) - gap for 61 minutes: ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration + 61) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
    },
  ]

  const failMockData = [
    {
      name: '(fail) - overlapping (exact both boundaries): ',
      startDate: successMockDataControlCase[0].startDate,
      duration: successMockDataControlCase[0].duration,
    },
    {
      name: '(fail) - overlapping (full overlapping): ',
      startDate: new Date(successMockDataControlCase[0].startDate.getTime() + 1 * 60000),
      duration: successMockDataControlCase[0].duration - 2,
    },
    {
      name: '(fail) - overlapping (external both boundaries): ',
      startDate: new Date(successMockDataControlCase[0].startDate.getTime() - 1 * 60000),
      duration: successMockDataControlCase[0].duration + 2,
    },
    {
      name: '(fail) - overlapping (left boundary): ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration / 2) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
    },
    {
      name: '(fail) - overlapping (right boundaries): ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() - (successMockDataControlCase[0].duration / 2) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
    },
  ]

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
        })

      expect(status).toBe(400)
    })
  })
})
