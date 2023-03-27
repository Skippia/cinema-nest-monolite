import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class UnauthorizeRequestDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 401 })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Unauthorized' })
  error: string
}
