type ImdbId = string

type TInterestingVotes = {
  down?: number
  up?: number
}

type TAuthor = {
  name: string
  id: string
}

export interface Review {
  author?: TAuthor
  interestingVotes?: TInterestingVotes
  text: string
  title: string
  date: string
}

export interface MovieReviews {
  id: ImdbId
  reviews: Review[]
}
