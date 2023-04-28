import { Injectable, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { AuthJwtService } from '../auth-jwt.service'
import { JwtPayload, jwtPayloadWithRtAndRtSessionId } from '../types'
import { Request } from 'express'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private config: ConfigService, private authJwtService: AuthJwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh
        },
      ]),
      secretOrKey: config.get<string>('RT_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtPayload): Promise<jwtPayloadWithRtAndRtSessionId> {
    // As far as i see, these exceptions will be boiled down to 401 by Passport.js lib

    const refreshToken = req.cookies?.Refresh
    const rtSessionId = +req.cookies?.RtSessionId

    if (!refreshToken) throw new ForbiddenException('RT is mailformed')
    if (!rtSessionId) throw new ForbiddenException('Not found rtSessionId')

    // If token is not valid - will be trown an error
    await this.authJwtService.validRefreshToken({
      userId: payload.sub,
      rtSessionId,
      refreshToken,
    })

    return {
      ...payload,
      refreshToken,
      rtSessionId,
    }
  }
}
