import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'
import {
  extractUsefulInformationFromError,
  generateErrorResponse,
  formatMessageString,
} from './prisma-client-exception-utils'

/**
 * P2002
 */
function conflictErrorHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const statusCode = HttpStatus.CONFLICT

  const messageError = 'Unique violation for foreign key'
  const messageDetails =
    (exception.meta?.cause as string) || extractUsefulInformationFromError(exception.message)

  return generateErrorResponse(
    response,
    statusCode,
    formatMessageString(messageError),
    formatMessageString(messageDetails),
  )
}

/**
 * P2003
 */
function fkFailedErrorHandler(
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

/**
 * P2025
 */
function throwNotFoundHandler(
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

const mapErrorHandlers = {
  P2002: conflictErrorHandler,
  P2003: fkFailedErrorHandler,
  P2025: throwNotFoundHandler,
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (Object.keys(mapErrorHandlers).includes(exception.code)) {
      const errorHandler = mapErrorHandlers[exception.code as keyof typeof mapErrorHandlers]
      errorHandler(response, exception)
    } else {
      super.catch(exception, host)
    }
  }
}
