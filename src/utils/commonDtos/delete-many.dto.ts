import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty } from 'class-validator'

export class DeleteManyDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  count: number
}
