export const getDaysGapRelatevilyNow = (startDate: Date) => {
  const millisecondsPerDay = 86400000 // Number of milliseconds in a day (24 hours * 60 minutes * 60 seconds * 1000)

  // Calculate the difference in milliseconds between the two dates
  const differenceInMilliseconds = startDate.getTime() - new Date().getTime()

  // Calculate the number of full days between the two dates by dividing the difference in milliseconds by the number of milliseconds per day
  const daysBetweenDates = Math.floor(differenceInMilliseconds / millisecondsPerDay)

  return daysBetweenDates
}
