import { ISeatPosWithType } from '../../../utils/types'

export type TFnOverride = (input: ISeatPosWithType[]) => ISeatPosWithType[]

export class ChainSeatsOverrider {
  source: ISeatPosWithType[]
  mappers: TFnOverride[]

  constructor({ source, mappers }: { source: ISeatPosWithType[]; mappers: TFnOverride[] }) {
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
