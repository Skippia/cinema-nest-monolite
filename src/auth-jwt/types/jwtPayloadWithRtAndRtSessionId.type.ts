import { JwtPayload } from './jwtPayload.type'

export type jwtPayloadWithRtAndRtSessionId = JwtPayload & { refreshToken: string } & {
  rtSessionId: number
}
