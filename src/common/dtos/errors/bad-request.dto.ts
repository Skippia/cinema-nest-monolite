import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'
import { HttpStatus } from '@nestjs/common'
import { HttpError } from '../../../app.constants'

export class BadRequestDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ isArray: true, example: ['field must be an integer number'] })
  message: string[]

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: HttpError.BAD_REQUEST })
  error: string
}
