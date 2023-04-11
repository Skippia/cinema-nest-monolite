import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayloadWithRt } from '../types/jwtPayloadWithRt.type'
import { JwtPayload } from '../types/jwtPayload.type'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
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

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req.cookies?.Refresh

    if (!refreshToken) {
      throw new ForbiddenException('RT is mailformed')
    }

    return {
      ...payload,
      refreshToken,
    }
  }
}
