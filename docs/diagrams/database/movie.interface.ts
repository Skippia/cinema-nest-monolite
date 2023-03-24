type Minutes = number
type ImdbId = string

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Movie {
  title: string
  rating: number
  releaseYear: number
  image: string
  description: string
  trailer: string
  genres: string[]
  authors: string[]
  writers: string[]
  id: ImdbId // equal imdbId in `MovieRecord` table
  actors: string[]
  duration: Minutes
  countries: string[]
}
