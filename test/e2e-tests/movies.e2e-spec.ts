import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Movies endoints (e2e)', () => {
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
  })

  let movieId1: number

  /**
   * Create:
   *   2 movies,
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
    await prisma.movieRecord.create({
      data: {
        imdbId: imdbId2,
      },
    })
    movieId1 = newMovie1.id
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

  describe('GET /movies', () => {
    it('should return the movies', async () => {
      const { status, body } = await request(app.getHttpServer()).get('/movies')

      expect(status).toBe(200)
      expect(body).toStrictEqual(expect.arrayContaining([movieShape]))
    })
  })

  describe('GET /movies/:movieId', () => {
    it('should return the movie by id', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/movies/${movieId1}`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(movieShape)
    })
  })
})
