import { SignupDto } from './dto/Signup.dto'
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Tokens } from './utils/types/tokens.type'
import { TokensDto } from './dto/Tokens.dto'
import { SigninDto } from './dto/Signin.dto'
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator'
import { GetCurrentUser } from './decorators/get-current-user.decorator'
import { Public } from './decorators/public.decorator'
import { RtGuard } from './guards/rt.guard'

@Controller('auth')
@ApiTags('Authorization')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Signup locally' })
  @ApiOkResponse({ type: TokensDto })
  async signupLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignupDto,
  ): Promise<Pick<Tokens, 'access_token'>> {
    const { access_token, refresh_token } = await this.authService.signupLocal(dto)

    this.authService.setRefreshTokenInCookies(res, refresh_token)

    return { access_token }
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Signin locally' })
  @ApiOkResponse({ type: TokensDto })
  async signinLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SigninDto,
  ): Promise<Pick<Tokens, 'access_token'>> {
    const { access_token, refresh_token } = await this.authService.signinLocal(dto)

    this.authService.setRefreshTokenInCookies(res, refresh_token)

    return { access_token }
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('local/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Refresh tokens' })
  @ApiOkResponse({ type: TokensDto })
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    const { access_token, refresh_token } = await this.authService.refreshTokens(userId, refreshToken)

    // this.authService.setRefreshTokenInCookies(res, refresh_token)

    return { access_token, refresh_token }
  }

  @Post('local/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Logout' })
  @ApiOkResponse()
  async logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    const isLogout = await this.authService.logout(userId)

    return isLogout
  }
}
