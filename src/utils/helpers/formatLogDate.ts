export function formatLogDate(date: Date) {
  const options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    separator: '/',
  } as Intl.DateTimeFormatOptions

  const formatter = new Intl.DateTimeFormat('en-US', options)

  return formatter.format(date)
}
