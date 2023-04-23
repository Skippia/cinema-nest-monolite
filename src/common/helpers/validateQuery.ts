import { ValidationError, validate } from 'class-validator'

export async function validateQuery(
  query: Record<string, boolean>,
  QueryDtoClass: Class,
): Promise<{
  isValidMovieQuery: boolean
  errors: ValidationError[] | []
}> {
  const movieQuery = new QueryDtoClass(query)
  const errors = await validate(movieQuery, { whitelist: true, forbidNonWhitelisted: true })

  return {
    isValidMovieQuery: errors.length > 0 ? false : true,
    errors,
  }
}
