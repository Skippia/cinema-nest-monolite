import { PartialType } from '@nestjs/swagger'
import { CreateSeatDto } from './create-seat.dto'

export class UpdateSeatDto extends PartialType(CreateSeatDto) {}
