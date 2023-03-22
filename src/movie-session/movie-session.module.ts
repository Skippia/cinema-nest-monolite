import { Module } from '@nestjs/common'
import { MovieSessionService } from './movie-session.service'
import { MovieSessionController } from './movie-session.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { MovieModule } from '../movie/movie.module'

@Module({
  controllers: [MovieSessionController],
  providers: [MovieSessionService],
  imports: [PrismaModule, MovieModule],
})
export class MovieSessionModule {}
