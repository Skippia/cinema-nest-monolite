import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { jwtPayloadWithRtAndRtSessionId } from '../types'

export const GetCurrentUser = createParamDecorator(
  (data: keyof jwtPayloadWithRtAndRtSessionId | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    if (!data) return request.user

    return request.user[data]
  },
)
