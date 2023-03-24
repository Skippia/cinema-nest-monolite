import { Cinema, PrismaClient } from '@prisma/client'
import * as movies from '../data/movies.json'
// initialize Prisma Client
const prisma = new PrismaClient()

async function main() {
  async function createSeats() {
    const colLength = 40
    const rowLength = 30

    const dataSeat = [] as { col: number; row: number }[]

    for (let x = 1; x <= colLength; x++) {
      for (let y = 1; y <= rowLength; y++) {
        dataSeat.push({ col: x, row: y })
      }
    }

    await prisma.seat.createMany({ data: dataSeat })
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

  await createSeats()
  await createCinemas()
  await loadMovies()
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
