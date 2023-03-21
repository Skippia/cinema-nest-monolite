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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { CreateSeatDto } from './dto/create-seat.dto'
import { UpdateSeatDto } from './dto/update-seat.dto'
import { FindSeatDto } from './dto/find-seat.dto'
import { SeatService } from './seat.service'
import { PrismaClientExceptionFilter } from 'src/prisma/prisma-client-exception'

@Controller('/')
@ApiTags('Seat')
@UseFilters(PrismaClientExceptionFilter)
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post('seat')
  @ApiCreatedResponse({ type: FindSeatDto })
  createSeat(@Body() dto: CreateSeatDto) {
    return this.seatService.createSeat(dto)
  }

  @Get('seats')
  @ApiOkResponse({ type: FindSeatDto, isArray: true })
  findAllSeats() {
    return this.seatService.findAllSeats()
  }

  @Get('seats/:seatId')
  @ApiOkResponse({ type: FindSeatDto })
  async findOneSeat(@Param('seatId', ParseIntPipe) seatId: number) {
    const seat = await this.seatService.findOneSeat(seatId)

    if (!seat) {
      throw new NotFoundException(`Could not find seat with ${seatId}.`)
    }

    return seat
  }

  @Patch('seats/:seatId')
  @ApiOkResponse({ type: FindSeatDto })
  updateSeat(@Param('seatId', ParseIntPipe) seatId: number, @Body() dto: UpdateSeatDto) {
    return this.seatService.updateSeat(seatId, dto)
  }

  @Delete('seats/:seatId')
  @ApiOkResponse({ type: FindSeatDto })
  removeSeat(@Param('seatId', ParseIntPipe) seatId: number) {
    return this.seatService.removeSeat(seatId)
  }
}
