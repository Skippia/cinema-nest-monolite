import { HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Response } from 'express'
import { extractUsefulInformationFromError } from '../extract-useful-information-from-error'
import { formatMessageString } from '../format-message-string'
import { generateErrorResponse } from '../generate-error-response'

/**
 * P2003
 */
export function fkFailedErrorHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const statusCode = HttpStatus.BAD_REQUEST

  const messageError = 'Operation with not existing foreign key'
  const messageDetails =
    (exception.meta?.['field_name'] as string) ||
    extractUsefulInformationFromError(exception.message)

  return generateErrorResponse(
    response,
    statusCode,
    formatMessageString(messageError),
    formatMessageString(messageDetails),
  )
}
