import { Injectable, ForbiddenException } from '@nestjs/common'
import { User } from '@prisma/client'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { TokensWithRtSessionId } from '../auth-jwt/types'
import { UsersService } from '../users/users.service'
import { GooglePayload } from './types'

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  async signinGoogle(googlePayload: GooglePayload): Promise<TokensWithRtSessionId> {
    if (!googlePayload) {
      throw new ForbiddenException('Google Auth error')
    }

    let user: User | null

    const { email, firstName, lastName, avatar } = googlePayload

    user = await this.usersService.findUser({ email })

    // User with such email doesn't exist - create it
    if (!user) {
      user = await this.usersService.createUser({
        email,
        firstName,
        lastName,
        avatar,
        isRegisteredWithGoogle: true,
      })
    }

    const tokens = await this.authJwtService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const newRtSession = await this.authJwtService.createRtSession(user.id, tokens.refresh_token)

    return { ...tokens, rt_session_id: newRtSession.id }
  }
}
