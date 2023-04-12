import {
  Controller,
  UseFilters,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Get,
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
import { Prisma } from '@prisma/client'
import { DeleteManyDto } from 'src/common/dtos/common'
import { BadRequestDto, ConflictRequestDto, NotFoundResponseDto } from 'src/common/dtos/errors'
import { Serialize } from 'src/common/interceptors'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { CreateCinemaSeatingSchemaDto } from './dto'
import { SeatWithTypeEntity } from './entity'
import { SeatsInCinemaService } from './seats-in-cinema.service'

@Controller('/seats-in-cinema')
@ApiTags('Seats in cinema')
@UseFilters(PrismaClientExceptionFilter)
export class SeatsInCinemaController {
  constructor(private readonly seatsInCinemaService: SeatsInCinemaService) {}

  @Post(':cinemaId')
  @ApiOperation({
    description: 'Create cinema seating schema for cinema by cinemaId',
  })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: SeatWithTypeEntity, isArray: true })
  @Serialize(SeatWithTypeEntity)
  async createCinemaSeatingSchema(
    @Body() dto: CreateCinemaSeatingSchemaDto,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<SeatWithTypeEntity[]> {
    const newCinemaSeatingSchema = await this.seatsInCinemaService.createCinemaSeatingSchema(
      cinemaId,
      dto,
    )

    return newCinemaSeatingSchema
  }

  @Delete(':cinemaId')
  @ApiOperation({
    description: 'Delete cinema seating schema for cinema by cinemaId',
  })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetCinemaSeatingSchema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<Prisma.BatchPayload> {
    const countDeletedSeatsInSeatingSchema =
      await this.seatsInCinemaService.resetCinemaSeatingSchema(cinemaId)

    return countDeletedSeatsInSeatingSchema
  }

  @Get(':cinemaId')
  @ApiOperation({
    description: 'Get cinema seating schema for cinema by cinemaId',
  })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: SeatWithTypeEntity, isArray: true })
  @Serialize(SeatWithTypeEntity)
  async findCinemaSeatingSchema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<SeatWithTypeEntity[]> {
    const cinemaSeatinsSchema = await this.seatsInCinemaService.findCinemaSeatingSchema(cinemaId)

    return cinemaSeatinsSchema
  }
}
