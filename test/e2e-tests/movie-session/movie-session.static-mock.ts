const movieSession1DataMock = {
  // startDate: '2024-01-10T10:00:01.504Z',
  // endDate: '2024-01-10T12:50:01.504Z',
  startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
  endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
  movieId: 1,
  cinemaHallId: 1,
  price: 40,
  currency: 'USD' as const,
}

const movieSession2DataMock = {
  // startDate: '2024-01-10T10:00:01.504Z',
  // endDate: '2024-01-10T12:50:01.504Z',
  startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
  endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
  movieId: 1,
  cinemaHallId: 2,
  price: 60,
  currency: 'USD' as const,
}

const movieSession3DataMock = {
  // startDate: '2024-01-10T10:00:01.504Z',
  // endDate: '2024-01-10T12:10:01.504Z',
  startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 10, 1)),
  endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 10, 1)),
  movieId: 2,
  cinemaHallId: 3,
  price: 80,
  currency: 'USD' as const,
}

export { movieSession1DataMock, movieSession2DataMock, movieSession3DataMock }
