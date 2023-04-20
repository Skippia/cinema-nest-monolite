import {
  Controller,
  UseFilters,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { AuthGoogleService } from './auth-google.service'
import { GetCurrentUserGooglePayload } from './decorators'
import { GoogleOauthGuard } from './guards/google.guard'
import { GooglePayload } from './types'
import { Request, Response } from 'express'

@Controller('auth/google')
@ApiTags('Authorization Google')
@UseFilters(PrismaClientExceptionFilter)
export class AuthGoogleController {
  constructor(
    private readonly authGoogleService: AuthGoogleService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  @ApiOperation({ description: 'Authorize through Google' })
  @ApiOkResponse()
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Req() req: Request) {}

  @ApiOperation({ description: 'Redirected here after Google authorization' })
  @ApiOkResponse()
  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @GetCurrentUserGooglePayload() googlePayload: GooglePayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { access_token, refresh_token, rt_session_id, user_id } =
      await this.authGoogleService.signinGoogle(googlePayload)

    this.authJwtService.addTokensToCookies(res, {
      access_token,
      refresh_token,
      rt_session_id,
      user_id,
    })
  }
}
