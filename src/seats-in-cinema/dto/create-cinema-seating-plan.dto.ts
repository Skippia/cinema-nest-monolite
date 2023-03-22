import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { IMatrixSeatPos, ISeatPos } from '../../utils/seatsInCinema/types'

class SeatPosition implements ISeatPos {
  @IsInt()
  @ApiProperty()
  row: number

  @IsInt()
  @ApiProperty()
  col: number
}

class MatrixSeatPositions implements IMatrixSeatPos {
  @IsInt()
  @ApiProperty()
  colStart: number

  @IsInt()
  @ApiProperty()
  colEnd: number

  @IsInt()
  @ApiProperty()
  rowStart: number

  @IsInt()
  @ApiProperty()
  rowEnd: number
}

export class CreateCinemaSeatingSchemaDto {
  @IsInt()
  @ApiProperty()
  colLength: number

  @IsInt()
  @ApiProperty()
  rowLength: number

  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => SeatPosition)
  @IsOptional()
  @ApiPropertyOptional({ isArray: true, type: SeatPosition })
  positionsExclude?: SeatPosition[]

  @ValidateNested({ each: true })
  @Type(() => MatrixSeatPositions)
  @IsOptional()
  @ApiPropertyOptional({ isArray: true, type: MatrixSeatPositions })
  areasExclude?: MatrixSeatPositions[]
}
