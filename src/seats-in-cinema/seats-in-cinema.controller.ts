import { Controller, UseFilters, Post, Body, Param, ParseIntPipe, Delete, Get } from '@nestjs/common'
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { CreateCinemaSeatingSchemaDto } from './dto/create-cinema-seating-plan.dto'
import { SeatsInCinemaService } from './seats-in-cinema.service'
import { Prisma } from '@prisma/client'
import { BadRequestDto } from '../utils/commonDtos/errors/bad-request.dto'
import { ConflictRequestDto } from '../utils/commonDtos/errors/conflict-request.dto'
import { NotFoundResponseDto } from '../utils/commonDtos/errors/not-found-response.dto'
import { SeatWithTypeEntity } from './entity/SeatWithTypeEntity'
import { Serialize } from '../interceptors/serialize.interceptor'

@Controller('/seats-in-cinema')
@ApiTags('Seats in cinema')
@UseFilters(PrismaClientExceptionFilter)
export class SeatsInCinemaController {
  constructor(private readonly seatsInCinemaService: SeatsInCinemaService) {}

  @Post(':cinemaId')
  @ApiOperation({ description: 'Create cinema seating schema for cinema by cinemaId' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: SeatWithTypeEntity, isArray: true })
  @Serialize(SeatWithTypeEntity)
  async createCinemaSeatingSchema(
    @Body() dto: CreateCinemaSeatingSchemaDto,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<SeatWithTypeEntity[]> {
    const newCinemaSeatingSchema = await this.seatsInCinemaService.createCinemaSeatingSchema(cinemaId, dto)

    return newCinemaSeatingSchema
  }

  @Delete(':cinemaId')
  @ApiOperation({ description: 'Delete cinema seating schema for cinema by cinemaId' })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetCinemaSeatingSchema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Prisma.BatchPayload> {
    const countDeletedSeatsInSeatingSchema = await this.seatsInCinemaService.resetCinemaSeatingSchema(cinemaId)

    return countDeletedSeatsInSeatingSchema
  }

  @Get(':cinemaId')
  @ApiOperation({ description: 'Get cinema seating schema for cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: SeatWithTypeEntity, isArray: true })
  @Serialize(SeatWithTypeEntity)
  async findCinemaSeatingSchema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<SeatWithTypeEntity[]> {
    const cinemaSeatinsSchema = await this.seatsInCinemaService.findCinemaSeatingSchema(cinemaId)

    return cinemaSeatinsSchema
  }
}
