import {
  excludeAreaSeatsPositions,
  findMaxColRow,
  generateBaseSeatSchema,
  generateSeatsOnRectangle,
  isPositionExcluded,
  recoverySeatSchema,
} from '../utils/seats-in-cinema-helpers'
import {
  seatsSchemaInput2,
  seatsSchemaInput3,
  seatsSchemaOutput1,
  seatsSchemaOutput2,
  seatsSchemaOutput3,
  seatsSchemaOutputFull1,
  seatsSchemaOutputFull2,
  seatsSchemaOutputFull3,
} from '../../../test/mocks/seats-in-cinema.mocks'

describe('helpers for SeatOnCinema service', () => {
  const excludeMatrices = [
    { colStart: 1, colEnd: 3, rowStart: 1, rowEnd: 2 },
    { colStart: 2, colEnd: 4, rowStart: 4, rowEnd: 4 },
    { colStart: 4, colEnd: 5, rowStart: 3, rowEnd: 5 },
  ]

  const excludedTruePositions = [
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 2 },
    { col: 2, row: 2 },
    { col: 3, row: 2 },
    { col: 4, row: 3 },
    { col: 5, row: 3 },
    { col: 2, row: 4 },
    { col: 3, row: 4 },
    { col: 4, row: 4 },
    { col: 5, row: 4 },
    { col: 4, row: 5 },
    { col: 5, row: 5 },
  ]

  const excludedFalsePositions = [
    { col: 4, row: 1 },
    { col: 5, row: 1 },
    { col: 4, row: 2 },
    { col: 5, row: 2 },
    { col: 1, row: 3 },
    { col: 2, row: 3 },
    { col: 3, row: 3 },
    { col: 1, row: 4 },
    { col: 1, row: 5 },
    { col: 2, row: 5 },
    { col: 3, row: 5 },
  ]

  const exludedPointPositions = [
    { col: 5, row: 1 },
    { col: 1, row: 5 },
  ]
  /**
   * generateBaseSeatSchema function
   */
  it('should generate seat schema', () => {
    // const x = generateBaseSeatSchema(seatsSchemaInput1)
    const y = generateBaseSeatSchema(seatsSchemaInput2)
    const z = generateBaseSeatSchema(seatsSchemaInput3)

    // expect(x).toEqual(seatsSchemaOutput1)
    expect(y).toEqual(seatsSchemaOutput2)
    expect(z).toEqual(seatsSchemaOutput3)
  })

  /**
   * findMaxColRow function
   */
  it('should recovery seat schema max dimensions', () => {
    const x = findMaxColRow(seatsSchemaOutput1)
    const y = findMaxColRow(seatsSchemaOutput2)
    const z = findMaxColRow(seatsSchemaOutput3)

    expect(x).toEqual({ maxCol: 4, maxRow: 3 })
    expect(y).toEqual({ maxCol: 4, maxRow: 4 })
    expect(z).toEqual({ maxCol: 6, maxRow: 9 })
  })

  /**
   * recoverySeatSchema function
   */
  it('should recovery seat schema', () => {
    const x = recoverySeatSchema(seatsSchemaOutput1)
    const y = recoverySeatSchema(seatsSchemaOutput2)
    const z = recoverySeatSchema(seatsSchemaOutput3)

    expect(x).toEqual(seatsSchemaOutputFull1)
    expect(y).toEqual(seatsSchemaOutputFull2)
    expect(z).toEqual(seatsSchemaOutputFull3)
  })

  /**
   * generateSeatsOnRectangle function
   */
  it('should generate the correct number of seats', () => {
    const colLength = 4
    const rowLength = 3

    const result = generateSeatsOnRectangle(colLength, rowLength)

    expect(result.length).toBe(colLength * rowLength)
  })

  it('should generate seats with correct col and row values', () => {
    const colLength = 2
    const rowLength = 2

    const result = generateSeatsOnRectangle(colLength, rowLength)

    expect(result).toEqual([
      { col: 1, row: 1 },
      { col: 1, row: 2 },
      { col: 2, row: 1 },
      { col: 2, row: 2 },
    ])
  })

  it('should generate no seats for zero colLength or rowLength', () => {
    const colLength = 0
    const rowLength = 5
    const colLength2 = 3
    const rowLength2 = 0

    const result1 = generateSeatsOnRectangle(colLength, rowLength)
    const result2 = generateSeatsOnRectangle(colLength2, rowLength2)

    expect(result1.length).toBe(0)
    expect(result2.length).toBe(0)
  })

  /**
   * isPositionExcluded function
   */
  it('should return true for excluded positions', () => {
    excludedTruePositions.forEach((position) => {
      expect(isPositionExcluded(excludeMatrices, position)).toBe(true)
    })
  })

  it('should return false for non-excluded positions', () => {
    excludedFalsePositions.forEach((position) => {
      expect(isPositionExcluded(excludeMatrices, position)).toBe(false)
    })
  })

  /**
   * excludeAreaSeatsPositions function
   */
  it('should return filtered positions (deleted excluded matrix coordinates)', () => {
    const allPositions = [...excludedFalsePositions, ...excludedTruePositions]

    expect(excludeAreaSeatsPositions(allPositions, excludeMatrices, [])).toEqual(excludedFalsePositions)
  })

  it('should return filtered positions (deleted excluded matrix coordinates and point coordinates)', () => {
    const correctedExcludedFalsePositions = excludedFalsePositions.filter(
      (pos) => !exludedPointPositions.some((elem) => elem.col === pos.col && elem.row === pos.row),
    )
    const allPositions = [...excludedFalsePositions, ...excludedTruePositions]

    expect(excludeAreaSeatsPositions(allPositions, excludeMatrices, exludedPointPositions)).toEqual(
      correctedExcludedFalsePositions,
    )
  })
})
