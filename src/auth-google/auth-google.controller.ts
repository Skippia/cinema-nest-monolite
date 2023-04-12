import { GooglePayload } from './types/googlePayload'
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Public } from '../auth-jwt/decorators'
import { AuthGoogleService } from './auth-google.service'
import { GetCurrentUserGooglePayload } from './decorators'
import { GoogleOauthGuard } from './guards/google.guard'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'

@Controller('auth/google')
@ApiTags('Authorization Google')
@UseFilters(PrismaClientExceptionFilter)
export class AuthGoogleController {
  constructor(
    private readonly authGoogleService: AuthGoogleService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  @ApiOperation({ description: 'Authorize through Google' })
  @ApiOkResponse()
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Req() req: Request) {}

  @Public()
  @ApiOperation({ description: 'Redirected here after Google authorization' })
  @ApiOkResponse()
  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @GetCurrentUserGooglePayload() googlePayload: GooglePayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, rt_session_id } =
      await this.authGoogleService.signinGoogle(googlePayload)

    this.authJwtService.addTokensToCookies(res, { access_token, refresh_token, rt_session_id })

    return { refresh_token, access_token, rt_session_id }
  }
}
