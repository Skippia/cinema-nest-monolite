import { PrismaModule } from './../prisma/prisma.module'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AtGuard } from './guards/at.guard'
import { AtStrategy } from './strategies/at.strategy'
import { RtGuard } from './guards/rt.guard'
import { RtStrategy } from './strategies/rt.strategy'

@Module({
  imports: [JwtModule.register({}), PrismaModule],
  providers: [AuthService, AtStrategy, AtGuard, RtStrategy, RtGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
