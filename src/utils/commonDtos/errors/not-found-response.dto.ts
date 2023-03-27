import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class NotFoundResponseDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 404 })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Not Found' })
  error: string
}
