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

@Module({
  imports: [JwtModule.register({}), PrismaModule, UsersModule],
  providers: [AuthJwtService, AtStrategy, AtGuard, RtStrategy, RtGuard],
  controllers: [AuthJwtController],
  exports: [AuthJwtService],
})
export class AuthJwtModule {}
