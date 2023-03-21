import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SeatsInCinemaModule } from './seats-in-cinema/seats-in-cinema.module'

@Module({
  imports: [SeatsInCinemaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
