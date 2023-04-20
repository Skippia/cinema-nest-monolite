type NullToUndefined<T> = T extends null ? undefined : T

export type NullableToUndefinable<T> = {
  [K in keyof T]: NullToUndefined<T[K]>
}
