import { HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Response } from 'express'
import { extractUsefulInformationFromError } from '../extract-useful-information-from-error'
import { formatMessageString } from '../format-message-string'
import { generateErrorResponse } from '../generate-error-response'

/**
 * P2025
 */
export function throwNotFoundHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const statusCode = HttpStatus.NOT_FOUND

  const messageError = 'Not found'
  const messageDetails =
    (exception.meta?.cause as string) || extractUsefulInformationFromError(exception.message)

  return generateErrorResponse(
    response,
    statusCode,
    formatMessageString(messageError),
    formatMessageString(messageDetails),
  )
}
