import { SeatPosWithType, TypeSeatEnumFull } from '../../../../common/types'
import { SeatsSchemaInput } from '../types'
import { generateSeatsOnRectangle } from './generate-seats-on-rectangle'
import { excludeAreaSeatsPositions } from './seat-postition-helpers'

export function generateBaseSeatSchema(seatsSchemaData: SeatsSchemaInput): SeatPosWithType[] {
  const { colLength, rowLength, areasExclude, positionsExclude } = seatsSchemaData

  /**
   * Generate all seats for these col * row
   */
  const rectangePositions = generateSeatsOnRectangle(colLength, rowLength)

  /**
   * Exclude positions accord to the input schema
   * and return seats without empties
   */
  const schema = excludeAreaSeatsPositions(
    rectangePositions,
    areasExclude || [],
    positionsExclude || [],
  )

  return schema.map((e) => ({ ...e, type: TypeSeatEnumFull.SEAT }))
}
