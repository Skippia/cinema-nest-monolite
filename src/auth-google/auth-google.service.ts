import { UsersService } from './../users/users.service'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { GooglePayload } from './types'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { User } from '@prisma/client'

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  async signinGoogle(googlePayload: GooglePayload) {
    if (!googlePayload) {
      throw new ForbiddenException('Google Auth error')
    }

    let user: User | null

    const { email, firstName, lastName, avatar } = googlePayload

    user = await this.usersService.findUser({ email })

    // User with such email doesn't exist - create it
    if (!user) {
      user = await this.usersService.createUser({ email, firstName, lastName, avatar })
    }

    const tokens = await this.authJwtService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await this.authJwtService.createRtSession(user.id, tokens.refresh_token)

    return tokens
  }
}
