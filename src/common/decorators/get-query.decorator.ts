import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common'
import { validateQuery } from '../helpers/validateQuery'

export const GetQueryDecorator = (classDto: Class) =>
  createParamDecorator(async (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    const queryString = request.query[data] as string

    if (!queryString) return undefined

    const query = queryString
      .split(',')
      .reduce((acc, curQuery) => ({ ...acc, [curQuery]: true }), {} as Record<string, boolean>)

    const { isValidMovieQuery, errors } = await validateQuery(query, classDto)

    if (!isValidMovieQuery) {
      throw new BadRequestException(
        JSON.stringify(errors[0].constraints?.whitelistValidation || errors[0].constraints),
      )
    }

    return query
  })
