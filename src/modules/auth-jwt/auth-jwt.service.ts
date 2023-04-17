import { Injectable, ForbiddenException, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Prisma, RTSession, RoleEnum, AuthProviderEnum } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { UsersService } from '../users/users.service'
import { HASH_SALT, EXPIRES_IN_AT_MIN, EXPIRES_IN_RT_MIN } from './auth-jwt.constants'
import { TokensWithClientData, JwtPayload, Tokens } from './types'
import { Response } from 'express'
import { SigninDto } from './dto'

@Injectable()
export class AuthJwtService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  async signupLocal(dto: CreateUserDto): Promise<TokensWithClientData> {
    try {
      const newUser = await this.usersService.createUser({
        ...dto,
        provider: AuthProviderEnum.LOCAL,
      })

      const tokens = await this.generateTokens({
        userId: newUser.id,
        email: newUser.email as string,
        username: newUser.username ?? undefined,
        role: newUser.role,
      })

      const newRtSession = await this.createRtSession(newUser.id, tokens.refresh_token)

      return { ...tokens, rt_session_id: newRtSession.id, user_id: newUser.id }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials incorrect')
        }
      }
      throw error
    }
  }

  async signinLocal(dto: SigninDto): Promise<TokensWithClientData> {
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
      email: user.email as string,
      role: user.role,
    })

    const newRtSession = await this.createRtSession(user.id, tokens.refresh_token)

    return { ...tokens, rt_session_id: newRtSession.id, user_id: user.id }
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.rTSession.deleteMany({
      where: {
        userId: userId,
      },
    })

    return true
  }

  async refreshTokens({
    rtSessionId,
    refreshToken,
  }: {
    rtSessionId: number
    refreshToken: string
  }): Promise<TokensWithClientData> {
    const { sub: userId, email, role } = this.jwtService.decode(refreshToken) as JwtPayload

    // Generate new pair of tokens and new session
    const tokens = await this.generateTokens({
      userId,
      email,
      role,
    })

    await this.updateRtSession({
      rtSessionId,
      newRt: tokens.refresh_token,
    })

    return { ...tokens, rt_session_id: rtSessionId, user_id: userId }
  }

  async updateRtSession({
    rtSessionId,
    newRt,
  }: {
    rtSessionId: number
    newRt: string
  }): Promise<void> {
    const rtSession = await this.findRtSessionById(rtSessionId)

    if (!rtSession) throw new ForbiddenException('There is not user session for your RT')

    const newHashedRt = bcrypt.hashSync(newRt, HASH_SALT)
    const { exp } = this.jwtService.decode(newRt) as JwtPayload

    await this.prisma.rTSession.update({
      where: {
        id: rtSession.id,
      },
      data: {
        hashedRt: newHashedRt,
        rtExpDate: new Date(exp * 1000),
      },
    })
  }

  async createRtSession(userId: number, refreshToken: string): Promise<RTSession> {
    const hashedRt = bcrypt.hashSync(refreshToken, HASH_SALT)

    const { exp } = this.jwtService.decode(refreshToken) as JwtPayload

    const newRtSession = await this.prisma.rTSession.create({
      data: {
        userId,
        hashedRt,
        rtExpDate: new Date(exp * 1000),
      },
    })

    return newRtSession
  }

  async generateTokens({
    userId,
    email,
    username,
    role,
  }: {
    userId: number
    email?: string
    username?: string
    role: RoleEnum
  }): Promise<Tokens> {
    const jwtPayload = {
      sub: userId,
      email,
      username,
      role,
    } as JwtPayload

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

  async findRtSessionById(id: number): Promise<RTSession | null> {
    const userSession = await this.prisma.rTSession.findUnique({
      where: {
        id,
      },
    })

    return userSession
  }

  async validRefreshToken({
    userId,
    rtSessionId,
    refreshToken,
  }: {
    userId: number
    rtSessionId: number
    refreshToken: string
  }) {
    const user = await this.usersService.findUser({ id: userId })

    // 1. Check if user with such RT exists
    if (!user) throw new ForbiddenException(`User with id ${userId} is not exist`)

    const rtSession = await this.findRtSessionById(rtSessionId)

    // 2. Check if rt session with such rtSessionId exists
    if (!rtSession) throw new ForbiddenException('There is not RT in user session DB')

    const isEqual = bcrypt.compareSync(refreshToken, rtSession.hashedRt)

    // 3. Check if getted from client RT has the same hash as "hashed version" of this RT in DB
    if (!isEqual) throw new ForbiddenException('Your RT is malformed')

    return isEqual
  }

  addTokensToCookies(
    @Res({ passthrough: true }) res: Response,
    {
      access_token,
      refresh_token,
      rt_session_id,
      user_id,
    }: {
      access_token: string
      refresh_token: string
      rt_session_id: number
      user_id: number
    },
  ): void {
    res.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * EXPIRES_IN_AT_MIN),
    })

    res.cookie('Refresh', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * EXPIRES_IN_RT_MIN),
    })

    res.cookie('RtSessionId', rt_session_id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * EXPIRES_IN_RT_MIN),
    })

    res.cookie('UserId', user_id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * EXPIRES_IN_RT_MIN),
    })
  }

  clearCookies(res: Response) {
    res.clearCookie('Authentication')
    res.clearCookie('Refresh')
    res.clearCookie('RtSessionId')
    res.clearCookie('UserId')
  }
}
