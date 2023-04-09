import { MovieSession, TypeSeatEnum } from '@prisma/client'
import { TypeSeatEnumFull } from '../../src/utils/types'

const bookingMockDataInput1 = {
  userId: 1,
  movieSessionId: 1,
  desiredSeats: [
    {
      col: 1,
      row: 1,
    },
    {
      col: 2,
      row: 2,
    },
  ],
}
const bookingMockDataInput2 = {
  userId: 1,
  movieSessionId: 1,
  desiredSeats: [
    {
      col: 1,
      row: 2,
    },
    {
      col: 2,
      row: 1,
    },
  ],
}

const bookingMockDataInput3 = {
  userId: 1,
  movieSessionId: 1,
  desiredSeats: [
    {
      col: 1,
      row: 3,
    },
  ],
}

const bookingMockDataOutput1 = (movieSession: MovieSession) => ({
  id: 1,
  userId: bookingMockDataInput1.userId,
  totalPrice: bookingMockDataInput1.desiredSeats.length * movieSession.price,
  currency: movieSession.currency,
  movieSessionId: movieSession.id,
  seats: bookingMockDataInput1.desiredSeats.map((x) => ({
    ...x,
    type: TypeSeatEnum.SEAT,
  })),
})

const bookingMockDataOutput2 = (movieSession: MovieSession) => ({
  id: 2,
  userId: bookingMockDataInput2.userId,
  totalPrice: bookingMockDataInput2.desiredSeats.length * movieSession.price,
  currency: movieSession.currency,
  movieSessionId: movieSession.id,
  seats: bookingMockDataInput2.desiredSeats,
})

const bookingMockDataOutput3 = (movieSession: MovieSession) => ({
  id: 3,
  userId: bookingMockDataInput3.userId,
  totalPrice: bookingMockDataInput3.desiredSeats.length * movieSession.price,
  currency: movieSession.currency,
  movieSessionId: movieSession.id,
  seats: bookingMockDataInput3.desiredSeats,
})

const mergedCinemaSchemaAfterFirstBooking = [
  {
    row: 1,
    col: 2,
    type: TypeSeatEnumFull.SEAT,
    bookingCol: 1,
    bookingRow: 1,
    isBooked: true,
  },
  {
    row: 1,
    col: 3,
    type: TypeSeatEnumFull.SEAT,
    bookingCol: 2,
    bookingRow: 1,
    isBooked: false,
  },
  {
    row: 2,
    col: 1,
    type: TypeSeatEnumFull.VIP,
    bookingCol: 1,
    bookingRow: 2,
    isBooked: false,
  },
  {
    row: 2,
    col: 4,
    type: TypeSeatEnumFull.SEAT,
    bookingCol: 2,
    bookingRow: 2,
    isBooked: true,
  },
  {
    row: 3,
    col: 2,
    type: TypeSeatEnumFull.LOVE,
    bookingCol: 1,
    bookingRow: 3,
    isBooked: false,
  },
  {
    row: 3,
    col: 3,
    type: TypeSeatEnumFull.LOVE,
    bookingCol: 2,
    bookingRow: 3,
    isBooked: false,
  },
]
const mergedCinemaSchemaAfterSecondBooking = [
  {
    row: 1,
    col: 2,
    type: TypeSeatEnumFull.SEAT,
    bookingCol: 1,
    bookingRow: 1,
    isBooked: true,
  },
  {
    row: 1,
    col: 3,
    type: TypeSeatEnumFull.SEAT,
    bookingCol: 2,
    bookingRow: 1,
    isBooked: true,
  },
  {
    row: 2,
    col: 1,
    type: TypeSeatEnumFull.VIP,
    bookingCol: 1,
    bookingRow: 2,
    isBooked: true,
  },
  {
    row: 2,
    col: 4,
    type: TypeSeatEnumFull.SEAT,
    bookingCol: 2,
    bookingRow: 2,
    isBooked: true,
  },
  {
    row: 3,
    col: 2,
    type: TypeSeatEnumFull.LOVE,
    bookingCol: 1,
    bookingRow: 3,
    isBooked: false,
  },
  {
    row: 3,
    col: 3,
    type: TypeSeatEnumFull.LOVE,
    bookingCol: 2,
    bookingRow: 3,
    isBooked: false,
  },
]

export {
  bookingMockDataInput1,
  bookingMockDataInput2,
  bookingMockDataOutput3,
  bookingMockDataOutput1,
  bookingMockDataOutput2,
  bookingMockDataInput3,
  mergedCinemaSchemaAfterFirstBooking,
  mergedCinemaSchemaAfterSecondBooking,
}
