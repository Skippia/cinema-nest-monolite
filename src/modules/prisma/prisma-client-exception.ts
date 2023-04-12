import { ArgumentsHost, Catch } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'
import { conflictErrorHandler } from './helpers/error-handler/conflict-error-handler'
import { fkFailedErrorHandler } from './helpers/error-handler/fk-failed-error-handler'
import { throwNotFoundHandler } from './helpers/error-handler/throw-not-found-handler'

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
