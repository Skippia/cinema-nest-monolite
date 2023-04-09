import { ISeatPosWithType, TypeSeatEnumFull } from '../../../utils/types'
import { ISeatsSchemaInput } from '../types'
import { generateSeatsOnRectangle } from './generateSeatsOnRectangle'
import { excludeAreaSeatsPositions } from './seat-postition-helpers'

export function generateBaseSeatSchema(seatsSchemaData: ISeatsSchemaInput): ISeatPosWithType[] {
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
