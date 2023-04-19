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
import { CinemaService } from './cinema.service'
import { FindCinemaDto, CreateCinemaDto, UpdateCinemaDto } from './dto'
import { CinemaEntity } from './entity'

@Controller('/')
@ApiTags('Cinema')
@UseFilters(PrismaClientExceptionFilter)
@Serialize(CinemaEntity)
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  @Post('cinema')
  @ApiOperation({ description: 'Create a cinema ' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: FindCinemaDto })
  async createCinema(@Body() dto: CreateCinemaDto): Promise<CinemaEntity> {
    const newCinema = await this.cinemaService.createCinema(dto)

    return newCinema
  }

  @Get('cinemas')
  @ApiOperation({ description: 'Get all cinemas' })
  @ApiOkResponse({ type: FindCinemaDto, isArray: true })
  async findAllCinemas(): Promise<CinemaEntity[]> {
    const cinemas = await this.cinemaService.findAllCinemas()

    return cinemas
  }

  @Get('cinemas/:cinemaId')
  @ApiOperation({ description: 'Get one cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindCinemaDto })
  async findOneCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<CinemaEntity> {
    const cinema = await this.cinemaService.findOneCinema({ id: cinemaId })

    if (!cinema) {
      throw new NotFoundException(`Could not find cinema with ${cinemaId}.`)
    }

    return cinema
  }

  @Patch('cinemas/:cinemaId')
  @ApiOperation({ description: 'Update cinema by cinemaId' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindCinemaDto })
  async updateCinema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
    @Body() dto: UpdateCinemaDto,
  ): Promise<CinemaEntity> {
    const updadedCinema = await this.cinemaService.updateCinema(cinemaId, dto)

    return updadedCinema
  }

  @Delete('cinemas/:cinemaId')
  @ApiOperation({ description: 'Delete cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindCinemaDto })
  async deleteCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<CinemaEntity> {
    const deletedCinema = await this.cinemaService.deleteCinema(cinemaId)

    return deletedCinema
  }
}
