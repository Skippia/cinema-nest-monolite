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
  Logger,
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
  createCinema(@Body() dto: CreateCinemaDto) {
    return this.cinemaService.createCinema(dto)
  }

  @Get('cinemas')
  @ApiOkResponse({ type: FindCinemaDto, isArray: true })
  findAllCinemas() {
    return this.cinemaService.findAllCinemas()
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
  updateCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number, @Body() dto: UpdateCinemaDto) {
    return this.cinemaService.updateCinema(cinemaId, dto)
  }

  @Delete('cinemas/:cinemaId')
  @ApiOkResponse({ type: FindCinemaDto })
  removeCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    return this.cinemaService.removeCinema(cinemaId)
  }
}
