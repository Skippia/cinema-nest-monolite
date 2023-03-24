import { PrismaModule } from '../prisma/prisma.module'
import { Module } from '@nestjs/common'
import { MovieReviewsService } from './movie-reviews.service'
import { MovieReviewsController } from './movie-reviews.controller'

@Module({
  controllers: [MovieReviewsController],
  imports: [PrismaModule],
  providers: [MovieReviewsService],
})
export class MovieReviewsModule {}
