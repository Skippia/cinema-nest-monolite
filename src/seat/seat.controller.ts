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
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger'
import { CreateSeatDto } from './dto/create-seat.dto'
import { UpdateSeatDto } from './dto/update-seat.dto'
import { SeatService } from './seat.service'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { NotFoundResponseDto } from '../utils/commonDtos/errors/not-found-response.dto'
import { ConflictRequestDto } from '../utils/commonDtos/errors/conflict-request.dto'
import { BadRequestDto } from '../utils/commonDtos/errors/bad-request.dto'
import { SeatEntity } from './entity/SeatEntity'
import { Serialize } from '../interceptors/serialize.interceptor'

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
    const seat = await this.seatService.findOneSeat(seatId)

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
  async updateSeat(@Param('seatId', ParseIntPipe) seatId: number, @Body() dto: UpdateSeatDto): Promise<SeatEntity> {
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
