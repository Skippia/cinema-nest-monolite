import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class ConflictRequestDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 409 })
  statusCode: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Invalid `this.prisma.model.create()`' })
  message: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Unique violation for foreign key' })
  error: string
}
