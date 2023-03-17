import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { MovieModule } from './movie/movie.module'

@Module({
  imports: [PrismaModule, MovieModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
