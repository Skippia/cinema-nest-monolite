type ImdbId = string

export interface Movie {
  id: number
  title: string
  rating: number
  releaseYear: number
  image: string
  thumbnailPreviewImageFromTrailer?: string
  description: string
  trailer: string
  genres: string[]
  authors: string[]
  writers: string[]
  imdbId: ImdbId
  actors: string[]
  duration: number
  countries: string[]
}
