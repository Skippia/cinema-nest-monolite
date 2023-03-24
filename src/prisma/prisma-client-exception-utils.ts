import { HttpStatus } from '@nestjs/common'
import { Response } from 'express'

// TODO: add error DTO
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

export const formatMessageString = (message: string) => message.replace(/\n/g, '')

export function extractUsefulInformationFromError(messageError: string) {
  const regex = /.*(?= invocation)/
  const message = messageError.match(regex)

  if (Array.isArray(message)) {
    return message[0]
  }

  return messageError
}
