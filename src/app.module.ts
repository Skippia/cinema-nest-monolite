import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { SeatModule } from './seat/seat.module'
import { MovieModule } from './movie/movie.module'

@Module({
  imports: [PrismaModule, SeatModule, MovieModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
