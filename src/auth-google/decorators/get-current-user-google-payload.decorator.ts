import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GooglePayload } from '../types'

export const GetCurrentUserGooglePayload = createParamDecorator(
  (_: undefined, context: ExecutionContext): GooglePayload => {
    const request = context.switchToHttp().getRequest()
    const user = request?.user as GooglePayload
    return user
  },
)
