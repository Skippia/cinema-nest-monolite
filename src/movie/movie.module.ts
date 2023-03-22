import { Module } from '@nestjs/common'
import { MovieService } from './movie.service'
import { MovieController } from './movie.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [PrismaModule],
})
export class MovieModule {}
