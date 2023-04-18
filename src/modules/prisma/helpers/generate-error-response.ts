import { HttpStatus } from '@nestjs/common'
import { Response } from 'express'

export const generateErrorResponse = (
  response: Response<any, Record<string, any>>,
  statusCode: HttpStatus,
  messageError: string,
  messageDetails: string,
  additional?: Record<string, unknown>,
) =>
  response.status(statusCode).json({
    statusCode,
    error: messageError,
    message: messageDetails,
    ...additional,
  })
