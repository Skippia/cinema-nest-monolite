import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayloadWithRt } from '../utils/types/jwtPayloadWithRt.type'

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    console.log('get current user decorator')

    const request = context.switchToHttp().getRequest()
    if (!data) return request.user
    return request.user[data]
  },
)
