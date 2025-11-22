/**
 * 合并时间：将相邻的小时片段合并
 * @param {string} shareTime 时间段字符串，逗号分隔
 * @example '06:00-07:00,07:00-08:00,10:00-11:00,11:00-12:00'
 * @returns '06:00-08:00,10:00-12:00'
 */
export function convertToTimeRanges(shareTime: string): string {
  if (!shareTime) {
    return '未设置'
  }
  const hourlyData = shareTime.split(',')
  const hourRanges = hourlyData.map((range) => {
    const [startHour, endHour] = range.split('-').map((time) => parseInt(time))
    return [startHour, endHour]
  })
  hourRanges.sort((a, b) => a[0] - b[0])
  const timeRanges: string[] = []
  let startHour = hourRanges[0][0]
  let endHour = hourRanges[0][1]

  for (let i = 1; i < hourRanges.length; i++) {
    if (hourRanges[i][0] === endHour) {
      // 连续的小时，更新结束时间
      endHour = hourRanges[i][1]
    } else {
      // 非连续的小时，添加区间并重新设置起始时间
      timeRanges.push(`${startHour}:00-${endHour}:00`)
      startHour = hourRanges[i][0]
      endHour = hourRanges[i][1]
    }
  }
  // 添加最后一个区间
  timeRanges.push(`${startHour}:00-${endHour}:00`)
  return timeRanges.join(',')
}
/**
 * 根据周的起始日期，算出这一周的日期范围
 * @param startDate
 */
export function getFormattedDateRange(startDateStr: Date): string[] {
  const startDate = new Date(startDateStr)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)
  const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  return [formatDateTime(startDate), formatDateTime(endDate)]
}
