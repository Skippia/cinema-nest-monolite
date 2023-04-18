import { Module } from '@nestjs/common'
import { AuthJwtModule } from '../auth-jwt/auth-jwt.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { AuthGoogleController } from './auth-google.controller'
import { AuthGoogleService } from './auth-google.service'
import { GoogleOauthGuard } from './guards/google.guard'
import { GoogleStrategy } from './strategies'

@Module({
  imports: [PrismaModule, AuthJwtModule, UsersModule],
  providers: [AuthGoogleService, GoogleStrategy, GoogleOauthGuard],
  controllers: [AuthGoogleController],
  exports: [AuthGoogleService],
})
export class AuthGoogleModule {}
