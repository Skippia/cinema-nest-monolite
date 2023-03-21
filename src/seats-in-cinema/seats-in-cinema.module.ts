import { Module } from '@nestjs/common'
import { SeatsInCinemaService } from './seats-in-cinema.service'
import { SeatsInCinemaController } from './seats-in-cinema.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [SeatsInCinemaController],
  providers: [SeatsInCinemaService],
  imports: [PrismaModule],
})
export class SeatsInCinemaModule {}
