import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GithubPayload } from '../types'

export const GetCurrentUserGithubPayload = createParamDecorator(
  (_: undefined, context: ExecutionContext): GithubPayload => {
    const request = context.switchToHttp().getRequest()
    const user = request?.user as GithubPayload

    return user
  },
)
