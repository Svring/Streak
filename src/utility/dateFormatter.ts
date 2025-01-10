import { CalendarDate, parseDate } from "@internationalized/date";

export function dateToCalendarDate(date: Date): CalendarDate {
  return parseDate(date.toISOString().split('T')[0]);
}

export function calendarDateToDate(calendarDate: CalendarDate): Date {
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
}
