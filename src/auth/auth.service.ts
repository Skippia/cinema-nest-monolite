import { SigninDto } from './dto/Signin.dto'
import { ForbiddenException, Injectable, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { SignupDto } from './dto/Signup.dto'
import { JwtPayload } from './utils/types/jwtPayload.type'
import { Tokens } from './utils/types/tokens.type'
import { Prisma, User } from '@prisma/client'
import { getExpiresInRtOffset } from './utils/getExpiresInRtOffset'
import { EXPIRES_IN_AT_MIN, HASH_SALT } from './auth.constants'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private config: ConfigService) {}

  async signupLocal(dto: SignupDto): Promise<Tokens> {
    const { email, name, lastName, gender, language, password } = dto

    const hashedPassword = bcrypt.hashSync(password, HASH_SALT)

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          name,
          lastName,
          gender,
          language,
          hashedPassword,
        },
      })

      const tokens = await this.getTokens(newUser.id, newUser.email)
      await this.createRtSession(newUser.id, tokens.refresh_token)

      return tokens
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials incorrect')
        }
      }
      throw error
    }
  }

  async signinLocal(dto: SigninDto): Promise<Tokens> {
    const { email, password } = dto

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    // 1. If user doesn't exist - throw 403
    if (!user) throw new ForbiddenException('Access Denied')

    const arePasswordEqual = bcrypt.compareSync(password, user.hashedPassword)

    // 2. If user's password is not correct - throw 403
    if (!arePasswordEqual) throw new ForbiddenException('Access Denied')

    // 3. Generate tokens and add RT to current sessions
    const tokens = await this.getTokens(user.id, user.email)
    await this.createRtSession(user.id, tokens.refresh_token)

    return tokens
  }

  async logout(userId: number): Promise<boolean> {
    // TODO: Delete many cause we want to break all active sessions (think through multi sessions)
    await this.prisma.rTSession.deleteMany({
      where: {
        userId: userId,
      },
    })

    return true
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    // Check if user exists
    if (!user) throw new ForbiddenException('Access Denied')

    // Get all active sessions for this user
    const userSessions = await this.prisma.rTSession.findMany({
      where: {
        userId,
      },
    })

    if (userSessions.length === 0) throw new ForbiddenException('Sessions for this user are not exist')

    // Check if there is active session for this user with such RT
    const matchArray = await Promise.all(
      userSessions.map((userSession) => bcrypt.compare(refreshToken, userSession.hashedRt)),
    )

    const isMatch = matchArray.some((el) => el === true)

    if (!isMatch) throw new ForbiddenException('There is not RT in user session DB')

    // Generate new pair of tokens and new session
    const tokens = await this.getTokens(user.id, user.email)

    await this.createRtSession(user.id, tokens.refresh_token)

    return tokens
  }

  async createRtSession(userId: number, refreshToken: string): Promise<void> {
    const hashedRt = bcrypt.hashSync(refreshToken, HASH_SALT)

    await this.prisma.rTSession.create({
      data: {
        userId,
        hashedRt,
      },
    })
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    }

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: `${EXPIRES_IN_AT_MIN}m`,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: `${EXPIRES_IN_AT_MIN}m`,
      }),
    ])

    return {
      access_token: at,
      refresh_token: rt,
    }
  }

  setRefreshTokenInCookies(@Res({ passthrough: true }) res: Response, refreshToken: string): void {
    ;(res as any).cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + getExpiresInRtOffset()),
    })
  }

  async getUserIfRefreshTokenMatches(userId: number, refreshToken: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new ForbiddenException('Access Denied')
    }

    const userRtToken = await this.prisma.rTSession.findFirst({
      where: {
        userId,
      },
    })

    // Check if RT exists
    if (!userRtToken) throw new ForbiddenException('RT is not exist')

    // Check if RT is valid
    const areRtMatch = await bcrypt.compare(refreshToken, userRtToken.hashedRt)

    if (!areRtMatch) throw new ForbiddenException('Access Denied')

    return user
  }
}
