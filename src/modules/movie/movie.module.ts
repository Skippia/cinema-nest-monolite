import { Module } from '@nestjs/common'
import { MovieService } from './movie.service'
import { MovieController } from './movie.controller'
import { S3Service } from '../s3/s3.service'

@Module({
  controllers: [MovieController],
  providers: [MovieService, S3Service],
  exports: [MovieService],
})
export class MovieModule {}
