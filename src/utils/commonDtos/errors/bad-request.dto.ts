import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class BadRequestDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 400 })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ isArray: true, example: ['row must be an integer number'] })
  message: string[]

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Bad Request' })
  error: string
}
