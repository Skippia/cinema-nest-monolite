import { ConfigService } from '@nestjs/config'
import { Injectable, ForbiddenException, Res } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { Prisma, Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { HASH_SALT, EXPIRES_IN_AT_MIN, EXPIRES_IN_RT_MIN } from './auth-jwt.constants'
import { CreateUserDto, SigninDto } from './dto'
import { Tokens, JwtPayload } from './types'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthJwtService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  async signupLocal(dto: CreateUserDto): Promise<Tokens> {
    try {
      const newUser = await this.usersService.createUser(dto)

      const tokens = await this.generateTokens({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      })

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

    const user = await this.usersService.findUser({ email })

    // 1. If user doesn't exist - throw 403
    if (!user) throw new ForbiddenException('Access Denied')

    const arePasswordEqual = bcrypt.compareSync(password, user?.hashedPassword || '')

    // 2. If user's password is not correct - throw 403
    if (!arePasswordEqual) throw new ForbiddenException('Access Denied')

    // 3. Generate tokens and add RT to current sessions
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    await this.createRtSession(user.id, tokens.refresh_token)

    return tokens
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.rTSession.deleteMany({
      where: {
        userId: userId,
      },
    })

    return true
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findUser({ id: userId })

    // Check if user exists
    if (!user) throw new ForbiddenException('Access Denied')

    // Get all active sessions for this user
    const userSessions = await this.prisma.rTSession.findMany({
      where: {
        userId,
      },
    })

    if (userSessions.length === 0)
      throw new ForbiddenException('Sessions for this user are not exist')

    // Check if there is active session for this user with such RT
    const matchArray = await Promise.all(
      userSessions.map((userSession) => bcrypt.compare(refreshToken, userSession.hashedRt)),
    )

    const isMatch = matchArray.some((el) => el === true)

    if (!isMatch) throw new ForbiddenException('There is not RT in user session DB')

    // Generate new pair of tokens and new session
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

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

  async generateTokens({
    userId,
    email,
    role,
  }: {
    userId: number
    email: string
    role: Role
  }): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
      role,
    }

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: `${EXPIRES_IN_AT_MIN}m`,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: `${EXPIRES_IN_RT_MIN}m`,
      }),
    ])

    return {
      access_token: at,
      refresh_token: rt,
    }
  }

  addTokensToCookies(
    @Res({ passthrough: true }) res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * EXPIRES_IN_AT_MIN),
    })

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * EXPIRES_IN_RT_MIN),
    })
  }

  clearCookies(res: Response) {
    res.clearCookie('Authentication')
    res.clearCookie('Refresh')
  }
}
