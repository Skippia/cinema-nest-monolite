import { MIN_DAYS_UNTIL_BOOKING } from './../../src/bookings/booking.constants'
import {
  mergedCinemaSchema1,
  mergedCinemaSchema2,
  mergedCinemaSchema3,
  seatsSchemaInput1,
  seatsSchemaInput2,
  seatsSchemaInput3,
} from '../mocks/seats-in-cinema.mocks'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import * as movies from '../../data/movies.json'
import { AppModule } from '../../src/app.module'
import { Cinema, MovieSession, TypeSeatEnum } from '@prisma/client'
import {
  bookingMockDataInput1,
  bookingMockDataInput2,
  bookingMockDataInput3,
  bookingMockDataOutput1,
  bookingMockDataOutput2,
  bookingMockDataOutput3,
  mergedCinemaSchemaAfterFirstBooking,
  mergedCinemaSchemaAfterSecondBooking,
} from '../mocks/bookings.mock'
import { convertSeatsArrayToString } from '../../src/bookings/utils/helpers/convertSeatsArrayToString'
import * as bcrypt from 'bcrypt'

describe('Movies in cinema endoints (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  const bookingShape = expect.objectContaining({
    id: expect.any(Number),
    userId: expect.any(Number),
    totalPrice: expect.any(Number),
    movieSessionId: expect.any(Number),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  })

  const cinemaId1 = 1
  const cinemaId2 = 2
  const cinemaId3 = 3

  const movieId1 = 1
  const movieId2 = 2

  const userId1 = 1

  let movieSession1: MovieSession
  let movieSession2: MovieSession
  let movieSession3: MovieSession

  const movieSessionId1 = 1
  const movieSessionId2 = 2
  const movieSessionId3 = 3

  /**
   * Create:
   *   100 seats,
   *   3 cinemas,
   *   3 cinena seating schema
   *   load all movies
   *   1 user
   *   add 2 movies to 3 cinemas ( [1-1, 2-1], [1-2], [1-3, 2-3] )
   *   3 movie sessions
   */
  async function runInitMovieDataMigration(prisma: PrismaService) {
    async function createSeats() {
      const colLength = 10
      const rowLength = 10

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
          hashedPassword: bcrypt.hashSync('midapa', 10),
          role: 'USER',
          gender: 'MALE',
          language: 'EN',
        },
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
      movieSession1 = await prisma.movieSession.create({
        data: {
          // startDate: '2024-01-10T10:00:01.504Z',
          // endDate: '2024-01-10T12:50:01.504Z',
          startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
          endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
          movieId: 1,
          cinemaId: 1,
          price: 40,
          currency: 'USD',
        },
      })

      movieSession2 = await prisma.movieSession.create({
        data: {
          // startDate: '2024-01-10T10:00:01.504Z',
          // endDate: '2024-01-10T12:50:01.504Z',
          startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
          endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
          movieId: 1,
          cinemaId: 2,
          price: 60,
          currency: 'USD',
        },
      })

      movieSession3 = await prisma.movieSession.create({
        data: {
          // startDate: '2024-01-10T10:00:01.504Z',
          // endDate: '2024-01-10T12:10:01.504Z',
          startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 10, 1)),
          endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 10, 1)),
          movieId: 2,
          cinemaId: 3,
          price: 80,
          currency: 'USD',
        },
      })
    }

    await createSeats()
    await createTypeSeats()
    await createCinemas()
    await loadMovies()
    await createUsers()
    await addMoviesToCinemas()
    await createMovieSessions()
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

  describe('GET booking schema - /bookings/booking-schema/:sessionId', () => {
    it('get booking schema for movieSession1 (cinemaId = 1) (success)', async () => {
      // Creating seating schema for cinema1
      await request(app.getHttpServer())
        .post('/seats-in-cinema/1')
        .send({ ...seatsSchemaInput1 })

      const { status, body } = await request(app.getHttpServer()).get(`/bookings/booking-schema/${movieSessionId1}`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema1)
    })

    it('get booking schema for movieSession3 (cinemaId = 2) (success)', async () => {
      // Creating seating schema for cinema2
      await request(app.getHttpServer())
        .post('/seats-in-cinema/2')
        .send({ ...seatsSchemaInput2 })

      const { status, body } = await request(app.getHttpServer()).get(`/bookings/booking-schema/${movieSessionId2}`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema2)
    })

    it('get booking schema for movieSession3 (cinemaId = 3) (success)', async () => {
      // Creating seating schema for cinema3
      await request(app.getHttpServer())
        .post('/seats-in-cinema/3')
        .send({ ...seatsSchemaInput3 })

      const { status, body } = await request(app.getHttpServer()).get(`/bookings/booking-schema/${movieSessionId3}`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema3)
    })
  })

  describe('POST create booking 1 (control case) - /bookings ', () => {
    it('get booking schema (success) - primary schema (0 seats are reserved)', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/bookings/booking-schema/1`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema1)
      expect(body.filter((e: any) => !!e.isBooked).length).toEqual(0)
    })

    it('create control booking (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput1,
        })

      expect(status).toBe(201)
      expect(body).toMatchObject(bookingMockDataOutput1(movieSession1))
    })

    it('get booking schema (success) - after first booking (2 seats are reserved)', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/bookings/booking-schema/1`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchemaAfterFirstBooking)
      expect(body.filter((e: any) => !!e.isBooked).length).toEqual(2)
    })
  })

  describe('GET bookings, seats by booking', () => {
    it('GET bookings by user - /bookings/users/:userId', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/bookings/users/${userId1}`)

      expect(status).toBe(200)
      expect(body).toEqual(expect.arrayContaining([expect.objectContaining(bookingMockDataOutput1(movieSession1))]))
    })

    it('GET seats by booking - /bookings/seats/:bookingId', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/bookings/seats/1`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(
        bookingMockDataOutput1(movieSession1).seats.map((e) => ({ ...e, type: TypeSeatEnum.SEAT })),
      )
    })

    it('GET booking by booking id - /bookings/:bookingId', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/bookings/1`)

      expect(status).toBe(200)
      expect(body).toMatchObject(bookingMockDataOutput1(movieSession1))
    })
  })

  describe('POST create booking (different scenario) - /bookings ', () => {
    it('create booking 2 - seats are available (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput2,
        })

      expect(status).toBe(201)
      expect(body).toMatchObject(bookingMockDataOutput2(movieSession1))
    })

    it('get booking schema (success) - after second booking (4 seats are reserved)', async () => {
      const { status, body } = await request(app.getHttpServer()).get(`/bookings/booking-schema/1`)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchemaAfterSecondBooking)
      expect(body.filter((e: any) => !!e.isBooked).length).toEqual(4)
    })

    it('create booking (failure) - such movie session is not exist ', async () => {
      const { status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          movieSessionId: 9999,
        })

      expect(status).toBe(404)
    })

    it('create booking (failure) - such seat is already reserved ', async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: bookingMockDataInput1.desiredSeats,
        })

      const alreadyBookedSeatsString = convertSeatsArrayToString(bookingMockDataInput1.desiredSeats)
      const errorMessage = `These seats are already booked: ${alreadyBookedSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - all seats are not exist in cinema ', async () => {
      const outSeats = [
        { row: 999, col: 999 },
        { row: -1, col: -1 },
      ]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: outSeats,
        })

      const outSeatsString = convertSeatsArrayToString(outSeats)
      const errorMessage = `These seats are outside of booking schema: ${outSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - one of seats is not exist in cinema ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const outSeats = [{ row: -1, col: -1 }]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...outSeats],
        })

      const outSeatsString = convertSeatsArrayToString(outSeats)
      const errorMessage = `These seats are outside of booking schema: ${outSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - several of seats are not exist in cinema ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const outSeats = [
        { row: 999, col: 999 },
        { row: -1, col: -1 },
      ]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...outSeats],
        })

      const outSeatsString = convertSeatsArrayToString(outSeats)
      const errorMessage = `These seats are outside of booking schema: ${outSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - one of seats is already reserved ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const bookedSeat = [bookingMockDataInput1.desiredSeats[0]]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...bookedSeat],
        })

      const bookedSeatsString = convertSeatsArrayToString(bookedSeat)
      const errorMessage = `These seats are already booked: ${bookedSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - several of seats are already reserved ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const bookedSeats = bookingMockDataInput1.desiredSeats

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...bookedSeats],
        })

      const bookedSeatsString = convertSeatsArrayToString(bookedSeats)
      const errorMessage = `These seats are already booked: ${bookedSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - too far to movie session', async () => {
      // subject movie sessin in one year

      const { body: movieSessionBody } = (await request(app.getHttpServer())
        .post(`/movies-sessions`)
        .send({
          startDate: new Date(
            new Date(new Date().setDate(new Date().getDate() + 10)).setHours(
              new Date().getHours(),
              new Date().getMinutes(),
              new Date().getSeconds(),
            ),
          ),
          movieId: 1,
          cinemaId: 1,
          price: 40,
          currency: 'USD',
          priceFactors: {
            SEAT: 1,
            VIP: 1.5,
            LOVE: 2.25,
          },
        })) as { body: MovieSession }

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          userId: 1,
          movieSessionId: movieSessionBody.id,
          desiredSeats: [
            {
              col: 1,
              row: 1,
            },
          ],
        })

      const errorMessage = `Wait please ${10 - MIN_DAYS_UNTIL_BOOKING - 1} day(s) to make a booking`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking 3 - seats are available (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/bookings`)
        .send({
          ...bookingMockDataInput3,
        })

      expect(status).toBe(201)
      expect(body).toMatchObject(bookingMockDataOutput3(movieSession1))
    })
  })

  describe('DELETE cancel booking - /bookings/:bookingId', () => {
    it('cancel booking (success)', async () => {
      const beforeCount = await prisma.booking.count()

      const { body, status } = await request(app.getHttpServer()).delete(`/bookings/1`)

      const afterCount = await prisma.booking.count()

      expect(status).toBe(200)
      expect(beforeCount - afterCount).toBe(1)
      expect(body).toMatchObject(bookingMockDataOutput1(movieSession1))
    })

    it('cancel all rest booking (success)', async () => {
      const beforeCount = await prisma.booking.count()

      const { body, status } = await request(app.getHttpServer()).delete(`/bookings/users/1`)

      const afterCount = await prisma.booking.count()

      expect(status).toBe(200)
      expect(beforeCount - afterCount).toBe(2)
      expect(body).toStrictEqual({ count: 2 })
    })
  })
})
