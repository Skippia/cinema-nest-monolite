import { formatLogDate } from './formatLogDate'

export const formatLogSessionTime = ({ startDate, duration }: { startDate: Date; duration: number }) =>
  `[${formatLogDate(startDate)} - ${formatLogDate(new Date(startDate.getTime() + duration * 60000))}]`
