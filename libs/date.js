/**
 * Calculate age in years and months
 * @param birthDate
 * @returns
 */
const getAgeYearMonth = (birthDate) => {
  /** VALIDATE */
  if (birthDate === null) {
    birthDate = '1900-01-01'
  }

  let dateValues = birthDate.split('-')
  let birthDateDay = Number(dateValues[2])
  let birthDateMonth = Number(dateValues[1])
  let birthDateYear = Number(dateValues[0])

  /** GET DATE NOW */
  let dateNow = new Date()
  let dateNowYear = dateNow.getFullYear()
  let dateNowMonth = dateNow.getMonth() + 1
  let dateNowDay = dateNow.getDate()

  /** AGE IS CALCULATED IN YEARS, MONTH AND DAY */
  let ageFull = dateNowYear - birthDateYear
  if (dateNowMonth < birthDateMonth) {
    ageFull--
  }
  if (birthDateMonth == dateNowMonth && dateNowDay < birthDateDay) {
    ageFull--
  }

  /** CALCULATE THE MOUNTAINS */
  let monthes = 0

  if (dateNowMonth > birthDateMonth && birthDateDay > dateNowDay)
    monthes = dateNowMonth - birthDateMonth - 1
  else if (dateNowMonth > birthDateMonth)
    monthes = dateNowMonth - birthDateMonth
  if (dateNowMonth < birthDateMonth && birthDateDay < dateNowDay)
    monthes = 12 - (birthDateMonth - dateNowMonth)
  else if (dateNowMonth < birthDateMonth)
    monthes = 12 - (birthDateMonth - dateNowMonth + 1)
  if (dateNowMonth == birthDateMonth && birthDateDay > dateNowDay) monthes = 11

  /** CALCULATE THE DAYS */
  let days = 0
  if (dateNowDay > birthDateDay) days = dateNowDay - birthDateDay
  if (dateNowDay < birthDateDay) {
    let ultimodaymonth = new Date(dateNowYear, dateNowMonth - 1, 0)
    days = ultimodaymonth.getDate() - (birthDateDay - dateNowDay)
  }

  // return `${ageFull} año(s), ${monthes} mes(es), ${days} dia(s),`
  return ageFull
}

module.exports = {getAgeYearMonth};