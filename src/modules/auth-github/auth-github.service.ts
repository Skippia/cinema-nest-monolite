import { Injectable, ForbiddenException } from '@nestjs/common'
import { AuthProviderEnum, User } from '@prisma/client'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { TokensWithRtSessionId } from '../auth-jwt/types'
import { UsersService } from '../users/users.service'
import { GithubPayload } from './types'

@Injectable()
export class AuthGithubService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  async signinGithub(githubPayload: GithubPayload): Promise<TokensWithRtSessionId> {
    if (!githubPayload) {
      throw new ForbiddenException('Github Auth error')
    }

    let user: User | null

    const { username, firstName, lastName, avatar } = githubPayload

    user = await this.usersService.findUser({ username })

    // User with such email doesn't exist - create it
    if (!user) {
      user = await this.usersService.createUser({
        username,
        firstName,
        lastName,
        avatar,
        provider: AuthProviderEnum.GITHUB,
      })
    }

    const tokens = await this.authJwtService.generateTokens({
      userId: user.id,
      username: user.username as string,
      role: user.role,
    })

    const newRtSession = await this.authJwtService.createRtSession(user.id, tokens.refresh_token)

    return { ...tokens, rt_session_id: newRtSession.id }
  }
}
