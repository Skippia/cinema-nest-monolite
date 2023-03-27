import { HttpStatus } from '@nestjs/common'
import { HttpError } from './../../../app.constants'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class UnauthorizeRequestDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: HttpError.UNAUTHORIZED })
  error: string
}
