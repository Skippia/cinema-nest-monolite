import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/modules/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { createUsers, signinAccount } from '../helpers'
import { addSomeMovieRecords } from '../helpers/addSomeMoviesRecords'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser')

describe('Movies endoints (e2e)', () => {
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

  let app: INestApplication
  let prisma: PrismaService
  let cookies: string[]
  let movieId1: number
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let movieId2: number

  /**
   * Create:
   *   2 movies,
   */
  async function runInitMovieDataMigration(prisma: PrismaService) {
    ;[movieId1, movieId2] = await addSomeMovieRecords(prisma, [imdbId1, imdbId2])
    await createUsers(prisma)
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

  describe('GET /movies', () => {
    it('should return the movies', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/movies')
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(expect.arrayContaining([movieShape]))
    })
  })

  describe('GET /movies/:movieId', () => {
    it('should return the movie by id', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/movies/${movieId1}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(movieShape)
    })
  })
})
