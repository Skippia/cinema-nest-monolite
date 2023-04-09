import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import { addSomeMovieRecords } from '../helpers/addSomeMoviesRecords'
import { createCinemas, addMoviesToCinemas, signinAccount, createUsers } from '../helpers'
import { deleteMoviesInCinema } from '../helpers/deleteMoviesInCinema'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser')

describe('Movies in cinema endoints (e2e)', () => {
  const imdbId1 = 'tt0068646'
  const imdbId2 = 'tt0111161'
  const movieShape = expect.objectContaining({
    id: expect.any(String),
    title: expect.any(String),
    description: expect.any(String),
    releaseYear: expect.any(Number),
    rating: expect.any(Number),
    image: expect.any(String),
    trailer: expect.any(String),
    writers: expect.arrayContaining([expect.any(String)]),
    actors: expect.arrayContaining([expect.any(String)]),
    genres: expect.arrayContaining([expect.any(String)]),
    authors: expect.arrayContaining([expect.any(String)]),
    duration: expect.any(Number),
    countries: expect.arrayContaining([expect.any(String)]),
  })

  let app: INestApplication
  let prisma: PrismaService
  let cookies: string[]
  let cinemaId: number
  let movieId1: number
  let movieId2: number

  /**
   * Create:
   *   2 movie,
   *   1 cinema,
   *   1 movie in cinema
   */
  async function runInitMovieDataMigration(prisma: PrismaService) {
    ;[movieId1, movieId2] = await addSomeMovieRecords(prisma, [imdbId1, imdbId2])
    ;[cinemaId] = await createCinemas(prisma)

    await createUsers(prisma)
    await addMoviesToCinemas(prisma, [{ movieId: movieId1, cinemaId: cinemaId }])
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
    await runInitMovieDataMigration(prisma)

    cookies = await signinAccount(app)
  })

  afterAll(async () => {
    await prisma.clearDatabase()
    await app.close()
  })

  describe('GET /movies-in-cinema/:cinemaId/:movieId', () => {
    it('should return if movie is available for cinema (true)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/movies-in-cinema/${cinemaId}/${movieId1}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual({ isAvailable: true })
    })

    it('should return if movie is available for cinema (false)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/movies-in-cinema/${cinemaId}/999`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual({ isAvailable: false })
    })
  })

  describe('GET /movies-in-cinema/:cinemaId', () => {
    it('should return the movies for cinema', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/movies-in-cinema/${cinemaId}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toHaveLength(1)
      expect(body).toStrictEqual([movieShape])
    })
  })

  describe('POST /movies-in-cinema', () => {
    it('should create a movie', async () => {
      await deleteMoviesInCinema(prisma, cinemaId)

      const beforeCount = await prisma.movieOnCinema.count()

      const { status, body } = await request(app.getHttpServer())
        .post('/movies-in-cinema')
        .send({
          cinemaId,
          movieIds: [movieId1],
        })
        .set('Cookie', cookies)

      const afterCount = await prisma.movieOnCinema.count()

      expect(status).toBe(201)
      expect(body).toStrictEqual([movieShape])
      expect(body).toHaveLength(1)
      expect(afterCount - beforeCount).toBe(1)
    })

    it('should not create a movie (CONFLICT)', async () => {
      const beforeCount = await prisma.movieOnCinema.count()

      const { status, body } = await request(app.getHttpServer())
        .post('/movies-in-cinema')
        .send({
          cinemaId,
          movieIds: [movieId1],
        })
        .set('Cookie', cookies)

      const afterCount = await prisma.movieOnCinema.count()

      expect(status).toBe(409)
      expect(body.error).toEqual('Unique violation for foreign key')
      expect(afterCount - beforeCount).toBe(0)
    })
  })

  describe('DELETE /movies-in-cinema/:cinemaId/:movieId', () => {
    it('should delete a movie', async () => {
      const { status, body } = await request(app.getHttpServer())
        .delete(`/movies-in-cinema/${cinemaId}/${movieId1}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(movieShape)
    })
  })

  describe('DELETE /movies-in-cinema/:cinemaId', () => {
    it('should delete all movies for cinema', async () => {
      await addMoviesToCinemas(prisma, [
        { cinemaId, movieId: movieId1 },
        { cinemaId, movieId: movieId2 },
      ])

      const beforeCount = await prisma.movieOnCinema.count()

      const { status, body } = await request(app.getHttpServer())
        .delete(`/movies-in-cinema/${cinemaId}`)
        .set('Cookie', cookies)

      const afterCount = await prisma.movieOnCinema.count()

      expect(status).toBe(200)
      expect(body).toStrictEqual({ count: beforeCount - afterCount })
    })
  })
})
