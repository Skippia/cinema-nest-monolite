import { Public } from './../auth-jwt/decorators/public.decorator'
import {
  Controller,
  UseFilters,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Get,
  NotFoundException,
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
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { SeatsInCinemaHallService } from '../seats-in-cinema-hall/seats-in-cinema-hall.service'
import { HallTypeEnum } from '../seats-in-cinema-hall/utils/types'
import { CinemaHallService } from './cinema-hall.service'
import { CinemaHallEntity, CinemaHallWithSchemaEntity } from './entity'
import { CreateCinemaHallDto } from './dto'
import { BadRequestDto, ConflictRequestDto, NotFoundResponseDto } from '../../common/dtos/errors'
import { Serialize } from '../../common/interceptors'

@Controller('/cinema-hall')
@ApiTags('Cinema hall')
@UseFilters(PrismaClientExceptionFilter)
export class CinemaHallController {
  constructor(
    private readonly seatsInCinemaHallService: SeatsInCinemaHallService,
    private readonly cinemaHallService: CinemaHallService,
  ) {}

  @Public()
  @Post(':cinemaId')
  @ApiOperation({
    description: 'Create cinema hall with seating schema',
  })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: CinemaHallWithSchemaEntity })
  @Serialize(CinemaHallWithSchemaEntity)
  async createCinemaHallWithSeatingSchema(
    @Body() dto: CreateCinemaHallDto,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<CinemaHallWithSchemaEntity> {
    const newCinemaHall = await this.cinemaHallService.createCinemaHall({
      name: dto.name,
      hallType: dto.hallType,
      cinemaId,
    })

    const seatsSchemaData = {
      colLength: dto.colLength,
      rowLength: dto.rowLength,
      positionsExclude: dto.positionsExclude,
      areasExclude: dto.areasExclude,
      vipSeats: dto.vipSeats,
      loveSeats: dto.loveSeats,
    }

    const newCinemaSeatingSchema =
      await this.seatsInCinemaHallService.createCinemaHallSeatingSchema(
        newCinemaHall.id,
        seatsSchemaData,
      )

    const cinemaHallWithSchema: CinemaHallWithSchemaEntity = {
      schema: newCinemaSeatingSchema,
      id: newCinemaHall.id,
      name: newCinemaHall.name,
      cinemaId: newCinemaHall.cinemaId,
      hallType: newCinemaHall.hallType as HallTypeEnum,
    }

    return cinemaHallWithSchema
  }

  @Get(':cinemaHallId')
  @ApiOperation({
    description: 'Get (full info) cinema hall by cinemaHallId',
  })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: CinemaHallWithSchemaEntity })
  @Serialize(CinemaHallWithSchemaEntity)
  async findCinemaHallWithSeatingSchema(
    @Param('cinemaHallId', ParseIntPipe) cinemaHallId: number,
  ): Promise<CinemaHallWithSchemaEntity> {
    const cinemaHallSeatinsSchema = await this.seatsInCinemaHallService.findCinemaHallSeatingSchema(
      cinemaHallId,
    )

    const cinemaHall = await this.cinemaHallService.findOneCinemaHall({ id: cinemaHallId })

    if (!cinemaHall) {
      throw new NotFoundException(`Could not find cinema hall with ${cinemaHallId}.`)
    }

    const cinemaHallWithSchema: CinemaHallWithSchemaEntity = {
      schema: cinemaHallSeatinsSchema,
      id: cinemaHall.id,
      name: cinemaHall.name,
      cinemaId: cinemaHall.cinemaId,
      hallType: cinemaHall.hallType as HallTypeEnum,
    }

    return cinemaHallWithSchema
  }

  @Delete(':cinemaHallId')
  @ApiOperation({
    description: 'Delete cinema hall by cinemaHallId',
  })
  @ApiOkResponse({ type: CinemaHallEntity })
  async resetCinemaSeatingSchema(
    @Param('cinemaHallId', ParseIntPipe) cinemaHallId: number,
  ): Promise<CinemaHallEntity> {
    await this.seatsInCinemaHallService.resetCinemaHallSeatingSchema(cinemaHallId)

    const deletedCinemaHall = await this.cinemaHallService.deleteCinemaHallById(cinemaHallId)

    const deletedCinemaHallWithHallType: CinemaHallEntity = {
      ...deletedCinemaHall,
      hallType: deletedCinemaHall.hallType as HallTypeEnum,
    }

    return deletedCinemaHallWithHallType
  }
}
