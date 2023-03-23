import { Injectable } from '@nestjs/common'
import { MovieSession, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMovieSessionDto } from './dto/create-movie-session.dto'
import { UpdateMovieSessionDto } from './dto/update-movie-session.dto'

@Injectable()
export class MovieSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createMovieSession(createMovieSessionDto: CreateMovieSessionDto): Promise<MovieSession> {
    return await this.prisma.movieSession.create({
      data: createMovieSessionDto,
    })
  }

  async findAllMovieSessions(): Promise<MovieSession[]> {
    return await this.prisma.movieSession.findMany()
  }

  async findOneMovieSession(id: number): Promise<MovieSession | null> {
    return await this.prisma.movieSession.findUnique({ where: { id } })
  }

  async updateMovieSession(id: number, updateMovieSessionDto: UpdateMovieSessionDto): Promise<MovieSession> {
    return await this.prisma.movieSession.update({ where: { id }, data: updateMovieSessionDto })
  }

  async removeMovieSession(id: number): Promise<MovieSession> {
    return await this.prisma.movieSession.delete({ where: { id } })
  }

  async resetMoviesSessions(cinemaId: number): Promise<Prisma.BatchPayload> {
    return await this.prisma.movieSession.deleteMany({ where: { cinemaId } })
  }
}
