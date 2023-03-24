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
import { CinemaService } from './cinema.service'
import { CreateCinemaDto } from './dto/create-cinema.dto'
import { UpdateCinemaDto } from './dto/update-cinema.dto'
import { FindCinemaDto } from './dto/find-cinema.dto'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { Cinema } from '@prisma/client'

@Controller('/')
@ApiTags('Cinema')
@UseFilters(PrismaClientExceptionFilter)
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  /**
   * Cinema operations
   */

  @Post('cinema')
  @ApiOperation({ description: 'Create a cinema ' })
  @ApiCreatedResponse({ type: FindCinemaDto })
  async createCinema(@Body() dto: CreateCinemaDto): Promise<Cinema> {
    const newCinema = await this.cinemaService.createCinema(dto)

    return newCinema
  }

  @Get('cinemas')
  @ApiOperation({ description: 'Get all cinemas' })
  @ApiOkResponse({ type: FindCinemaDto, isArray: true })
  async findAllCinemas(): Promise<Cinema[]> {
    const cinemas = await this.cinemaService.findAllCinemas()

    return cinemas
  }

  @Get('cinemas/:cinemaId')
  @ApiOperation({ description: 'Get one cinema by cinemaId' })
  @ApiOkResponse({ type: FindCinemaDto })
  async findOneCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Cinema> {
    const cinema = await this.cinemaService.findOneCinema(cinemaId)

    if (!cinema) {
      throw new NotFoundException(`Could not find cinema with ${cinemaId}.`)
    }

    return cinema
  }

  @Patch('cinemas/:cinemaId')
  @ApiOperation({ description: 'Update cinema by cinemaId' })
  @ApiOkResponse({ type: FindCinemaDto })
  async updateCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number, @Body() dto: UpdateCinemaDto): Promise<Cinema> {
    const updadedCinema = await this.cinemaService.updateCinema(cinemaId, dto)

    return updadedCinema
  }

  @Delete('cinemas/:cinemaId')
  @ApiOperation({ description: 'Remove cinema by cinemaId' })
  @ApiOkResponse({ type: FindCinemaDto })
  async removeCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Cinema> {
    const removedCinema = await this.cinemaService.removeCinema(cinemaId)

    return removedCinema
  }
}
