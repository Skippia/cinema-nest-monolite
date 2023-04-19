import {
  Controller,
  UseFilters,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { BadRequestDto, ConflictRequestDto, NotFoundResponseDto } from '../../common/dtos/errors'
import { Serialize } from '../../common/interceptors'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { CreateSeatDto, UpdateSeatDto } from './dto'
import { SeatEntity } from './entity'
import { SeatService } from './seat.service'

@Controller('/')
@ApiTags('Seat')
@UseFilters(PrismaClientExceptionFilter)
@Serialize(SeatEntity)
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post('seat')
  @ApiOperation({ description: 'Create a new seat' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: SeatEntity })
  async createSeat(@Body() dto: CreateSeatDto): Promise<SeatEntity> {
    const newSeat = await this.seatService.createSeat(dto)

    return newSeat
  }

  @Get('seats')
  @ApiOperation({ description: 'Get all seasts' })
  @ApiOkResponse({ type: SeatEntity, isArray: true })
  async findAllSeats(): Promise<SeatEntity[]> {
    const seats = await this.seatService.findAllSeats()

    return seats
  }

  @Get('seats/:seatId')
  @ApiOperation({ description: 'Get one seat by seatId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: SeatEntity })
  async findOneSeat(@Param('seatId', ParseIntPipe) seatId: number): Promise<SeatEntity> {
    const seat = await this.seatService.findOneSeat({ id: seatId })

    if (!seat) {
      throw new NotFoundException(`Could not find seat with ${seatId}.`)
    }

    return seat
  }

  @Patch('seats/:seatId')
  @ApiOperation({ description: 'Update seat by seatId' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: SeatEntity })
  async updateSeat(
    @Param('seatId', ParseIntPipe) seatId: number,
    @Body() dto: UpdateSeatDto,
  ): Promise<SeatEntity> {
    const updadedSeat = await this.seatService.updateSeat(seatId, dto)

    return updadedSeat
  }

  @Delete('seats/:seatId')
  @ApiOperation({ description: 'Delete seat by seatId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: SeatEntity })
  async deleteSeat(@Param('seatId', ParseIntPipe) seatId: number): Promise<SeatEntity> {
    const deletedSeat = await this.seatService.deleteSeat(seatId)

    return deletedSeat
  }
}
