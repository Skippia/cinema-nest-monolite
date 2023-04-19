import { Module } from '@nestjs/common'
import { CinemaHallService } from './cinema-hall.service'
import { CinemaHallController } from './cinema-hall.controller'
import { SeatsInCinemaHallModule } from '../seats-in-cinema-hall/seats-in-cinema-hall.module'

@Module({
  controllers: [CinemaHallController],
  imports: [SeatsInCinemaHallModule],
  providers: [CinemaHallService],
})
export class CinemaHallModule {}
