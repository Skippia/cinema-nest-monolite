import { SeatPosWithType } from './SeatPosWithType.type'

export type BookingSchema = (SeatPosWithType & { isBooked: boolean })[]
