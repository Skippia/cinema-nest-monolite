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
import { CinemaService } from './cinema.service'
import { CreateCinemaDto } from './dto/CinemaDtos/create-cinema.dto'
import { UpdateCinemaDto } from './dto/CinemaDtos/update-cinema.dto'
import { FindCinemaDto } from './dto/CinemaDtos/find-cinema.dto'
import { PrismaClientExceptionFilter } from 'src/prisma/prisma-client-exception'

@Controller('/')
@ApiTags('Cinema')
@UseFilters(PrismaClientExceptionFilter)
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  /**
   * Cinema operations
   */

  @Post('cinema')
  @ApiCreatedResponse({ type: FindCinemaDto })
  async createCinema(@Body() dto: CreateCinemaDto) {
    const newCinema = await this.cinemaService.createCinema(dto)
    return newCinema
  }

  @Get('cinemas')
  @ApiOkResponse({ type: FindCinemaDto, isArray: true })
  async findAllCinemas() {
    const cinemas = await this.cinemaService.findAllCinemas()
    return cinemas
  }

  @Get('cinemas/:cinemaId')
  @ApiOkResponse({ type: FindCinemaDto })
  async findOneCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    const cinema = await this.cinemaService.findOneCinema(cinemaId)

    if (!cinema) {
      throw new NotFoundException(`Could not find cinema with ${cinemaId}.`)
    }

    return cinema
  }

  @Patch('cinemas/:cinemaId')
  @ApiOkResponse({ type: FindCinemaDto })
  async updateCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number, @Body() dto: UpdateCinemaDto) {
    const updadedCinema = await this.cinemaService.updateCinema(cinemaId, dto)
    return updadedCinema
  }

  @Delete('cinemas/:cinemaId')
  @ApiOkResponse({ type: FindCinemaDto })
  async removeCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    const removedCinema = await this.cinemaService.removeCinema(cinemaId)
    return removedCinema
  }
}
