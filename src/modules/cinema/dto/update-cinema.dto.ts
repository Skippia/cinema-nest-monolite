import { PartialType } from '@nestjs/swagger'
import { CreateCinemaDto } from './create-cinema.dto'

export class UpdateCinemaDto extends PartialType(CreateCinemaDto) {}
