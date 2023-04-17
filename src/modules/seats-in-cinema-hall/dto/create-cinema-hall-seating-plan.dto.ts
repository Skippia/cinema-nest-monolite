import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { MatrixSeatPos, SeatPos } from '../utils/types'

class SeatPosition implements SeatPos {
  @IsInt()
  @ApiProperty()
  row: number

  @IsInt()
  @ApiProperty()
  col: number
}

class MatrixSeatPositions implements MatrixSeatPos {
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

export class CreateCinemaHallSeatingSchemaDto {
  @IsInt()
  @ApiProperty({ example: 4 })
  colLength: number

  @IsInt()
  @ApiProperty({ example: 3 })
  rowLength: number

  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => SeatPosition)
  @IsOptional()
  @ApiPropertyOptional({
    isArray: true,
    type: SeatPosition,
    example: [
      { row: 1, col: 1 },
      { row: 1, col: 4 },
      { row: 3, col: 1 },
      { row: 3, col: 4 },
    ],
  })
  positionsExclude?: SeatPosition[]

  @ValidateNested({ each: true })
  @Type(() => MatrixSeatPositions)
  @IsOptional()
  @ApiPropertyOptional({
    isArray: true,
    type: MatrixSeatPositions,
    example: [
      {
        colStart: 2,
        colEnd: 3,
        rowStart: 2,
        rowEnd: 2,
      },
    ],
  })
  areasExclude?: MatrixSeatPositions[]

  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => SeatPosition)
  @IsOptional()
  @ApiPropertyOptional({
    isArray: true,
    type: SeatPosition,
    example: [{ row: 2, col: 1 }],
  })
  vipSeats?: SeatPosition[]

  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => SeatPosition)
  @IsOptional()
  @ApiPropertyOptional({
    isArray: true,
    type: SeatPosition,
    example: [
      { row: 3, col: 2 },
      { row: 3, col: 3 },
    ],
  })
  loveSeats?: SeatPosition[]
}
