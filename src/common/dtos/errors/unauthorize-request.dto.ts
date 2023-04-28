import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'
import { HttpError } from '../../constants/error.constants'

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
