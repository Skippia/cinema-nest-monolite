import { IsOptional, IsBoolean } from 'class-validator'
import { Movie } from '../types'

export type MovieField = keyof Movie

export class MovieQueryDto implements Partial<Record<MovieField, boolean>> {
  constructor(query: Partial<Record<MovieField, boolean>>) {
    ;(Object.keys(query) as MovieField[]).forEach((queryField) => {
      this[queryField] = query[queryField]
    })
  }

  @IsOptional()
  @IsBoolean()
  title?: boolean

  @IsOptional()
  @IsBoolean()
  rating?: boolean

  @IsOptional()
  @IsBoolean()
  releaseYear?: boolean

  @IsOptional()
  @IsBoolean()
  image?: boolean

  @IsOptional()
  @IsBoolean()
  thumbnailPreviewImageFromTrailer?: boolean

  @IsOptional()
  @IsBoolean()
  description?: boolean

  @IsOptional()
  @IsBoolean()
  trailer?: boolean

  @IsOptional()
  @IsBoolean()
  genres?: boolean

  @IsOptional()
  @IsBoolean()
  authors?: boolean

  @IsOptional()
  @IsBoolean()
  writers?: boolean

  @IsOptional()
  @IsBoolean()
  id?: boolean

  @IsOptional()
  @IsBoolean()
  imdbId?: boolean

  @IsOptional()
  @IsBoolean()
  actors?: boolean

  @IsOptional()
  @IsBoolean()
  duration?: boolean

  @IsOptional()
  @IsBoolean()
  countries?: boolean
}
