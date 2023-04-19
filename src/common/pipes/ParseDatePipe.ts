import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

@Injectable()
export class ParseDatePipe implements PipeTransform<string, string> {
  transform(maybeDate: string, metadata: ArgumentMetadata): string {
    function isDateOnly(dateString: string) {
      const date = new Date(maybeDate)
      return (
        date instanceof Date &&
        !isNaN(date.getTime()) &&
        dateString.length === 10 &&
        !dateString.split('').some((el) => el === ':') &&
        !dateString.split('').some((el) => el === 'T')
      )
    }
    const date = isDateOnly(maybeDate)

    if (!date) {
      throw new BadRequestException('Validation failed (`yyyy-mm-dd` pattern is expected)')
    }

    return maybeDate
  }
}
