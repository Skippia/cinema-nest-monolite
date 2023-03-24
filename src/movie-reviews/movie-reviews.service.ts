import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as reviews from '../../data/reviews.json'
import { MovieReviews } from './dto/types'

@Injectable()
export class MovieReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllMoviesReviews(): MovieReviews[] {
    return reviews
  }

  async findReviewsByMovie(id: number): Promise<MovieReviews | undefined> {
    const movieRecord = await this.prisma.movieRecord.findUnique({
      where: {
        id,
      },
    })

    if (movieRecord) {
      return reviews.find((reviews) => reviews.id === movieRecord.imdbId)
    }
  }
}
