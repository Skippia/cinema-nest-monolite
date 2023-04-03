import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Movies in cinema endoints (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

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
    const newCinema = await prisma.cinema.create({
      data: {
        name: 'Aurora',
        address: 'random street',
        city: 'Minsk',
      },
    })
    cinemaId = newCinema.id

    /**
     * Add movie to cinema
     */
    await prisma.movieOnCinema.create({
      data: {
        cinemaId,
        movieId: movieId1,
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

  describe('GET /movies-in-cinema/:cinemaId/:movieId', () => {
    it('should return if movie is available for cinema (true)', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/movies-in-cinema/${cinemaId}/${movieId1}`)

      expect(status).toBe(200)
      expect(body).toStrictEqual({ isAvailable: true })
    })

    it('should return if movie is available for cinema (false)', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/movies-in-cinema/${cinemaId}/999`)

      expect(status).toBe(200)
      expect(body).toStrictEqual({ isAvailable: false })
    })
  })

  describe('GET /movies-in-cinema/:cinemaId', () => {
    it('should return the movies for cinema', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/movies-in-cinema/${cinemaId}`)

      expect(status).toBe(200)
      expect(body).toHaveLength(1)
      expect(body).toStrictEqual([movieShape])
    })
  })

  describe('POST /movies-in-cinema', () => {
    it('should create a movie', async () => {
      /**
       * Delete all movies in cinema
       */
      await prisma.movieOnCinema.deleteMany({
        where: {
          cinemaId,
        },
      })

      const beforeCount = await prisma.movieOnCinema.count()

      const { status, body } = await request(app.getHttpServer())
        .post('/movies-in-cinema')
        .send({
          cinemaId,
          movieIds: [movieId1],
        })

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

      const afterCount = await prisma.movieOnCinema.count()

      expect(status).toBe(409)
      expect(body.error).toEqual('Unique violation for foreign key')
      expect(afterCount - beforeCount).toBe(0)
    })
  })

  describe('DELETE /movies-in-cinema/:cinemaId/:movieId', () => {
    it('should delete a movie', async () => {
      const { status, body } = await request(app.getHttpServer()).delete(`/movies-in-cinema/${cinemaId}/${movieId1}`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(movieShape)
    })
  })

  describe('DELETE /movies-in-cinema/:cinemaId', () => {
    it('should delete all movies for cinema', async () => {
      /**
       * Create sevaral movies for cinema
       */
      await prisma.movieOnCinema.createMany({
        data: [
          { cinemaId, movieId: movieId1 },
          { cinemaId, movieId: movieId2 },
        ],
      })
      const beforeCount = await prisma.movieOnCinema.count()

      const { status, body } = await request(app.getHttpServer()).delete(`/movies-in-cinema/${cinemaId}`)

      const afterCount = await prisma.movieOnCinema.count()

      expect(status).toBe(200)
      expect(body).toStrictEqual({ count: beforeCount - afterCount })
    })
  })
})
