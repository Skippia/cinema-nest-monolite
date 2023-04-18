import { Module } from '@nestjs/common'
import { MovieService } from './movie.service'
import { MovieController } from './movie.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [PrismaModule],
  exports: [MovieService],
})
export class MovieModule {}
