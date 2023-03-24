import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
  UseFilters,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateSeatDto } from './dto/create-seat.dto'
import { UpdateSeatDto } from './dto/update-seat.dto'
import { FindSeatDto } from './dto/find-seat.dto'
import { SeatService } from './seat.service'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { Seat } from '@prisma/client'

@Controller('/')
@ApiTags('Seat')
@UseFilters(PrismaClientExceptionFilter)
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post('seat')
  @ApiOperation({ description: 'Create a new seat' })
  @ApiCreatedResponse({ type: FindSeatDto })
  async createSeat(@Body() dto: CreateSeatDto): Promise<Seat> {
    const newSeat = await this.seatService.createSeat(dto)

    return newSeat
  }

  @Get('seats')
  @ApiOperation({ description: 'Get all seasts' })
  @ApiOkResponse({ type: FindSeatDto, isArray: true })
  async findAllSeats(): Promise<Seat[]> {
    const seats = await this.seatService.findAllSeats()

    return seats
  }

  @Get('seats/:seatId')
  @ApiOperation({ description: 'Get one seat by seatId' })
  @ApiOkResponse({ type: FindSeatDto })
  async findOneSeat(@Param('seatId', ParseIntPipe) seatId: number): Promise<Seat> {
    const seat = await this.seatService.findOneSeat(seatId)

    if (!seat) {
      throw new NotFoundException(`Could not find seat with ${seatId}.`)
    }

    return seat
  }

  @Patch('seats/:seatId')
  @ApiOperation({ description: 'Update seat by seatId' })
  @ApiOkResponse({ type: FindSeatDto })
  async updateSeat(@Param('seatId', ParseIntPipe) seatId: number, @Body() dto: UpdateSeatDto): Promise<Seat> {
    const updadedSeat = await this.seatService.updateSeat(seatId, dto)

    return updadedSeat
  }

  @Delete('seats/:seatId')
  @ApiOperation({ description: 'Delete seat by seatId' })
  @ApiOkResponse({ type: FindSeatDto })
  async deleteSeat(@Param('seatId', ParseIntPipe) seatId: number): Promise<Seat> {
    const deletedSeat = await this.seatService.deleteSeat(seatId)

    return deletedSeat
  }
}
