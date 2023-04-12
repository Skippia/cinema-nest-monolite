import { Review } from './Review.type'

type ImdbId = string

export interface MovieReviews {
  id: ImdbId
  reviews: Review[]
}
