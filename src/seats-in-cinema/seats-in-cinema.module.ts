import { Module } from '@nestjs/common'
import { SeatsOnCinemaService } from './seats-in-cinema.service'
import { SeatsOnCinemaController } from './seats-in-cinema.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [SeatsOnCinemaController],
  providers: [SeatsOnCinemaService],
  imports: [PrismaModule],
})
export class SeatsOnCinemaModule {}
