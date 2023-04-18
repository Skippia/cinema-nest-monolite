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
import { AuthGithubService } from '../auth-github/auth-github.service'
import { GithubOauthGuard } from '../auth-github/guards/github.guard'
import { GithubPayload } from '../auth-github/types'
import { AuthJwtService } from '../auth-jwt/auth-jwt.service'
import { Public } from '../auth-jwt/decorators'
import { Response } from 'express'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { GetCurrentUserGithubPayload } from './decorators'

@Controller('auth/github')
@ApiTags('Authorization Github')
@UseFilters(PrismaClientExceptionFilter)
export class AuthGithubController {
  constructor(
    private readonly authGithubService: AuthGithubService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  @ApiOperation({ description: 'Authorize through Github' })
  @ApiOkResponse()
  @UseGuards(GithubOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async githubAuth(@Req() req: Request) {}

  @Public()
  @ApiOperation({ description: 'Redirected here after Github authorization' })
  @ApiOkResponse()
  @Get('redirect')
  @UseGuards(GithubOauthGuard)
  async githubAuthRedirect(
    @GetCurrentUserGithubPayload() githubPayload: GithubPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { access_token, refresh_token, rt_session_id, user_id } =
      await this.authGithubService.signinGithub(githubPayload)

    this.authJwtService.addTokensToCookies(res, {
      access_token,
      refresh_token,
      rt_session_id,
      user_id,
    })
  }
}
