import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '../utils/types/jwtPayload.type'

export const GetCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext): number => {
  console.log('get current user id decorator')

  const request = context.switchToHttp().getRequest()
  const user = request.user as JwtPayload
  return user.sub
})
