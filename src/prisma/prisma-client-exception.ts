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
  const status = HttpStatus.CONFLICT

  const customMessage = 'Unique violation for foreign key'
  const detailedErrorMessage = (exception.meta?.cause as string) || extractUsefulInformationFromError(exception.message)

  return generateErrorResponse(response, status, formatMessageString(customMessage), {
    details: formatMessageString(detailedErrorMessage),
  })
}

/**
 * P2003
 */
function fkFailedErrorHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const status = HttpStatus.BAD_REQUEST

  const customMessage = 'Operation with not existing foreign key'
  const detailedErrorMessage =
    (exception.meta?.['field_name'] as string) || extractUsefulInformationFromError(exception.message)

  return generateErrorResponse(response, status, formatMessageString(customMessage), {
    details: formatMessageString(detailedErrorMessage),
  })
}

/**
 * P2025
 */
function throwNotFoundHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const status = HttpStatus.NOT_FOUND

  const customMessage = 'Resource not found'
  const detailedErrorMessage = (exception.meta?.cause as string) || extractUsefulInformationFromError(exception.message)

  return generateErrorResponse(response, status, formatMessageString(customMessage), {
    details: formatMessageString(detailedErrorMessage),
  })
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
