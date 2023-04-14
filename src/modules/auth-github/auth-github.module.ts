import { Module } from '@nestjs/common'
import { AuthJwtModule } from '../auth-jwt/auth-jwt.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { AuthGithubController } from './auth-github.controller'
import { AuthGithubService } from './auth-github.service'
import { GithubOauthGuard } from './guards/github.guard'
import { GithubStrategy } from './strategies'

@Module({
  imports: [PrismaModule, AuthJwtModule, UsersModule],
  providers: [AuthGithubService, GithubStrategy, GithubOauthGuard],
  controllers: [AuthGithubController],
  exports: [AuthGithubService],
})
export class AuthGithubModule {}
