import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'
import { HttpStatus } from '@nestjs/common'
import { HttpError } from '../../../app.constants'

export class ConflictRequestDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Invalid `this.prisma.model.create()`' })
  message: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: HttpError.CONFLICT })
  error: string
}
