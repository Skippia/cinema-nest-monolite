import { SeatPosWithType } from 'src/common/types'

export type TFnOverride = (input: SeatPosWithType[]) => SeatPosWithType[]

export class ChainSeatsOverrider {
  source: SeatPosWithType[]
  mappers: TFnOverride[]

  constructor({ source, mappers }: { source: SeatPosWithType[]; mappers: TFnOverride[] }) {
    this.source = source
    this.mappers = mappers
  }

  run() {
    this.mappers.forEach((mapper) => {
      this.source = mapper(this.source)
    })

    return this.source
  }
}
