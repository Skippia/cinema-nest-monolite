import { Module } from '@nestjs/common'
import { CinemaService } from './cinema.service'
import { CinemaController } from './cinema.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [CinemaController],
  providers: [CinemaService],
  imports: [PrismaModule],
})
export class CinemaModule {}
