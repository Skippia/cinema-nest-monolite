import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMovieSessionDto } from './dto/create-movie-session.dto'
import { UpdateMovieSessionDto } from './dto/update-movie-session.dto'

@Injectable()
export class MovieSessionService {
  constructor(private prisma: PrismaService) {}

  async createMovieSession(createMovieSessionDto: CreateMovieSessionDto) {
    return await this.prisma.movieSession.create({
      data: createMovieSessionDto,
    })
  }

  async findAllMovieSessions() {
    return await this.prisma.movieSession.findMany()
  }

  async findOneMovieSession(id: number) {
    return await this.prisma.movieSession.findUnique({ where: { id } })
  }

  async updateMovieSession(id: number, updateMovieSessionDto: UpdateMovieSessionDto) {
    return await this.prisma.movieSession.update({ where: { id }, data: updateMovieSessionDto })
  }

  async removeMovieSession(id: number) {
    return await this.prisma.movieSession.delete({ where: { id } })
  }

  async resetMoviesSessions(cinemaId: number) {
    return await this.prisma.movieSession.deleteMany({ where: { cinemaId } })
  }
}
