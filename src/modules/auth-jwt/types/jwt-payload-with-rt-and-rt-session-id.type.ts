import { JwtPayload } from './jwt-payload.type'

export type jwtPayloadWithRtAndRtSessionId = JwtPayload & { refreshToken: string } & {
  rtSessionId: number
}
