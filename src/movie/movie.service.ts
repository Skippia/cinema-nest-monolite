import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as movies from '../../data/movies.json'
import { Movie } from './dto/types'

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) {}

  findAllMovies(): Movie[] {
    return movies
  }

  async findOneMovie(id: number): Promise<Movie | undefined> {
    const movieRecord = await this.prisma.movieRecord.findUnique({
      where: {
        id,
      },
    })

    if (movieRecord) {
      return movies.find((movie) => movie.id === movieRecord.imdbId)
    }
  }
}
