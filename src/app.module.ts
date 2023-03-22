import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { SeatModule } from './seat/seat.module'
import { MovieModule } from './movie/movie.module'
import { CinemaModule } from './cinema/cinema.module'

@Module({
  imports: [PrismaModule, SeatModule, MovieModule, CinemaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
