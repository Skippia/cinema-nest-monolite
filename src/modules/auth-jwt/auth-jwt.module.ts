import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthJwtController } from './auth-jwt.controller'
import { AuthJwtService } from './auth-jwt.service'
import { AtGuard } from './guards/at.guard'
import { AtStrategy } from './strategies/at.strategy'
import { RtGuard } from './guards/rt.guard'
import { RtStrategy } from './strategies/rt.strategy'
import { UsersModule } from '../users/users.module'
import { PrismaModule } from '../prisma/prisma.module'
import { S3Service } from '../s3/s3.service'

@Module({
  imports: [JwtModule.register({}), PrismaModule, UsersModule],
  providers: [AuthJwtService, S3Service, AtStrategy, AtGuard, RtStrategy, RtGuard],
  controllers: [AuthJwtController],
  exports: [AuthJwtService],
})
export class AuthJwtModule {}
