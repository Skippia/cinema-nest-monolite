import {
  Controller,
  UseFilters,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Body,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { AuthJwtService } from './auth-jwt.service'
import { GetCurrentUser, GetCurrentUserId } from './decorators'
import { AtGuard, RtGuard } from './guards'
import { Response } from 'express'
import { SigninDto } from './dto'
import { User } from '@prisma/client'
import { UserEntity } from '../users/entity'
import { Serialize } from '../../common/interceptors'
import { logoutFromSystem } from './helpers'
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule'

@Controller('auth')
@ApiTags('Authorization JWT')
@UseFilters(PrismaClientExceptionFilter)
export class AuthJwtController {
  constructor(
    private authJwtService: AuthJwtService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Signup locally' })
  @ApiOkResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async signupLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateUserDto,
  ): Promise<User> {
    const { access_token, refresh_token, rt_session_id, user_id, newUser } =
      await this.authJwtService.signupLocal(dto)

    this.authJwtService.addTokensToCookies(res, {
      access_token,
      refresh_token,
      rt_session_id,
      user_id,
    })

    return newUser
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ description: 'Signin locally' })
  @ApiNoContentResponse()
  async signinLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SigninDto,
  ): Promise<void> {
    const { access_token, refresh_token, rt_session_id, user_id } =
      await this.authJwtService.signinLocal(dto)

    this.authJwtService.addTokensToCookies(res, {
      access_token,
      refresh_token,
      rt_session_id,
      user_id,
    })
  }

  @UseGuards(RtGuard)
  @Post('local/refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ description: 'Refresh tokens' })
  @ApiNoContentResponse()
  async refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUser('rtSessionId') rtSessionId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { access_token, refresh_token, rt_session_id, user_id } =
      await this.authJwtService.refreshTokens({
        rtSessionId,
        refreshToken,
      })

    this.authJwtService.addTokensToCookies(res, {
      access_token,
      refresh_token,
      rt_session_id,
      user_id,
    })
  }

  @UseGuards(AtGuard)
  @Post('local/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Logout' })
  @ApiOkResponse()
  async logout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    const isLogout = await this.authJwtService.logout(userId)

    logoutFromSystem(res)

    return isLogout
  }
}
