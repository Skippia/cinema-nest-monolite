import { Controller, UseFilters, Post, Body, Param, ParseIntPipe, Delete, Get } from '@nestjs/common'
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { CreateCinemaSeatingSchemaDto } from './dto/create-cinema-seating-plan.dto'
import { FindCinemaSeatingSchemaDto } from './dto/find-cinema-seating-plan.dto'
import { SeatsOnCinemaService } from './seats-in-cinema.service'

@Controller('/seats-in-cinema')
@ApiTags('Seats on cinema')
@UseFilters(PrismaClientExceptionFilter)
export class SeatsOnCinemaController {
  constructor(private readonly seatsOnCinemaService: SeatsOnCinemaService) {}

  @Post(':cinemaId')
  @ApiCreatedResponse({ type: FindCinemaSeatingSchemaDto, isArray: true })
  createCinemaSeatingSchema(
    @Body() dto: CreateCinemaSeatingSchemaDto,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ) {
    return this.seatsOnCinemaService.createCinemaSeatingSchema(cinemaId, dto)
  }

  @Delete(':cinemaId')
  @ApiOkResponse({ type: DeleteManyDto })
  resetCinemaSeatingSchema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    return this.seatsOnCinemaService.resetCinemaSeatingSchema(cinemaId)
  }

  @Get(':cinemaId')
  @ApiOkResponse({ type: FindCinemaSeatingSchemaDto, isArray: true })
  findCinemaSeatingSchema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    return this.seatsOnCinemaService.findCinemaSeatingSchema(cinemaId)
  }
}
