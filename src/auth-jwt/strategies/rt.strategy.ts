import { AuthJwtService } from './../auth-jwt.service'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../types/jwtPayload.type'
import { jwtPayloadWithRtAndRtSessionId } from '../types/jwtPayloadWithRtAndRtSessionId.type'

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

    const isValidRt = await this.authJwtService.validRefreshToken({
      userId: payload.sub,
      rtSessionId,
      refreshToken,
    })

    if (!isValidRt) throw new ForbiddenException('RT is expired')

    return {
      ...payload,
      refreshToken,
      rtSessionId,
    }
  }
}
