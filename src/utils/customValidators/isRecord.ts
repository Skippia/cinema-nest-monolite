import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  isObject,
} from 'class-validator'

export function IsRecord(
  object_needed: Record<string, unknown>,
  value_validator: (value: unknown) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isRecord',
      target: (object as any).constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: Record<string, unknown>, args: ValidationArguments) {
          if (!isObject(value)) return false

          const isRecordCorresponds = Object.keys(object_needed).every(
            (x) => Object.keys(value).includes(x) && value_validator(value[x]),
          )

          return isRecordCorresponds
        },
      },
    })
  }
}
