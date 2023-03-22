import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

const generateResponse = (response: Response<any, Record<string, any>>, status: HttpStatus, message: string) =>
  response.status(status).json({
    statusCode: status,
    message: message,
  })

const formatMessageString = (message: string) => message.replace(/\n/g, '')

function conflictErrorHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const status = HttpStatus.CONFLICT
  const message = exception.message
  return generateResponse(response, status, formatMessageString(message))
}

function throwNotFoundHandler(
  response: Response<any, Record<string, any>>,
  exception: Prisma.PrismaClientKnownRequestError,
) {
  const status = HttpStatus.NOT_FOUND
  const message = (exception.meta?.cause as string) || exception.message
  return generateResponse(response, status, formatMessageString(message))
}

const mapErrorHandlers = {
  P2002: conflictErrorHandler,
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
