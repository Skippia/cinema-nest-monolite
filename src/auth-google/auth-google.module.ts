import { Module } from '@nestjs/common'
import { AuthGoogleService } from './auth-google.service'
import { AuthGoogleController } from './auth-google.controller'
import { GoogleStrategy } from './strategies'
import { PrismaModule } from '../prisma/prisma.module'
import { GoogleOauthGuard } from './guards/google.guard'
import { AuthJwtModule } from '../auth-jwt/auth-jwt.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [PrismaModule, AuthJwtModule, UsersModule],
  providers: [AuthGoogleService, GoogleStrategy, GoogleOauthGuard],
  controllers: [AuthGoogleController],
  exports: [AuthGoogleService],
})
export class AuthGoogleModule {}
