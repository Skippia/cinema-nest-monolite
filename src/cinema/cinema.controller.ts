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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { CinemaService } from './cinema.service'
import { CreateCinemaDto } from './dto/create-cinema.dto'
import { UpdateCinemaDto } from './dto/update-cinema.dto'
import { FindCinemaDto } from './dto/find-cinema.dto'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { Cinema } from '@prisma/client'
import { BadRequestDto } from '../utils/commonDtos/errors/bad-request.dto'
import { ConflictRequestDto } from '../utils/commonDtos/errors/conflict-request.dto'
import { NotFoundResponseDto } from '../utils/commonDtos/errors/not-found-response.dto'

@Controller('/')
@ApiTags('Cinema')
@UseFilters(PrismaClientExceptionFilter)
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  @Post('cinema')
  @ApiOperation({ description: 'Create a cinema ' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
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
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
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
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindCinemaDto })
  async updateCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number, @Body() dto: UpdateCinemaDto): Promise<Cinema> {
    const updadedCinema = await this.cinemaService.updateCinema(cinemaId, dto)

    return updadedCinema
  }

  @Delete('cinemas/:cinemaId')
  @ApiOperation({ description: 'Delete cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindCinemaDto })
  async deleteCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Cinema> {
    const deletedCinema = await this.cinemaService.deleteCinema(cinemaId)

    return deletedCinema
  }
}
