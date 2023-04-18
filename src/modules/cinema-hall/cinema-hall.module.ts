import { Module } from '@nestjs/common'
import { CinemaHallService } from './cinema-hall.service'
import { CinemaHallController } from './cinema-hall.controller'
import { SeatsInCinemaHallModule } from '../seats-in-cinema-hall/seats-in-cinema-hall.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [CinemaHallController],
  imports: [SeatsInCinemaHallModule, PrismaModule],
  providers: [CinemaHallService],
})
export class CinemaHallModule {}
