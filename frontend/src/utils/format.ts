import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * Common date formatting patterns used in the app
 */
export const formatDate = (date: string | Date | null | undefined, pattern: string = 'YYYY-MM-DD HH:mm') => {
  if (!date) return '-'
  return dayjs(date).format(pattern)
}

export const formatShortDate = (date: string | Date | null | undefined) => {
  return formatDate(date, 'MM-DD HH:mm')
}

export const formatDay = (date: string | Date | null | undefined) => {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * Relative time display (e.g. "3 hours ago")
 * Note: Requires dayjs relativeTime plugin if needed, but for now simple format is enough
 */
export const fromNow = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  return dayjs(date).fromNow()
}
