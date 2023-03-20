import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SeatsOnCinemaModule } from './seats-in-cinema/seats-in-cinema.module'

@Module({
  imports: [SeatsOnCinemaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
