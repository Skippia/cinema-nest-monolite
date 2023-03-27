import { HttpStatus } from '@nestjs/common'
import { HttpError } from './../../../app.constants'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class NotFoundResponseDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Custom error' })
  message: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: HttpError.NOT_FOUND })
  error: string
}
