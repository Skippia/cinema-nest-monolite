import { Injectable, ForbiddenException } from '@nestjs/common'
import { AuthProviderEnum, User } from '@prisma/client'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { TokensWithClientData } from '../auth-jwt/types'
import { UsersService } from '../users/users.service'
import { GooglePayload } from './types'

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  async signinGoogle(googlePayload: GooglePayload): Promise<TokensWithClientData> {
    if (!googlePayload || !googlePayload.email) {
      throw new ForbiddenException('Google Auth error')
    }

    let user: User | null

    const { email, firstName, lastName, avatar } = googlePayload

    user = await this.usersService.findOneUser({ email })
    // email, username, firstName, lastName, gender, language, password, avatar
    // User with such email doesn't exist - create it
    if (!user) {
      user = await this.usersService.createUser({
        email,
        firstName,
        lastName,
        avatar,
        provider: AuthProviderEnum.GMAIL,
      })
    }

    const tokens = await this.authJwtService.generateTokens({
      userId: user.id,
      email: user.email as string,
      role: user.role,
    })

    const newRtSession = await this.authJwtService.createRtSession(user.id, tokens.refresh_token)

    return { ...tokens, rt_session_id: newRtSession.id, user_id: user.id }
  }
}
