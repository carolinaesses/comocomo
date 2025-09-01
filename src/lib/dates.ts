import { startOfDay } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export function getAppTimeZone(): string {
  return process.env.APP_TZ || "UTC";
}

export function normalizeDateToUTC(dateStr: string, tz: string = getAppTimeZone()): Date {
  // dateStr: YYYY-MM-DD in user tz -> convert midnight to UTC Date
  const naive = new Date(`${dateStr}T00:00:00`);
  const utc = fromZonedTime(naive, tz);
  return utc;
}

export function formatDateInTZ(date: Date, tz: string = getAppTimeZone()): string {
  return formatInTimeZone(date, tz, "yyyy-MM-dd");
}

export function eachDayStrings(from: string, to: string): string[] {
  const tz = getAppTimeZone();
  const fromDate = normalizeDateToUTC(from, tz);
  const toDate = normalizeDateToUTC(to, tz);
  const days: string[] = [];
  let cursor = startOfDay(fromDate);
  while (cursor <= toDate) {
    days.push(formatDateInTZ(cursor, tz));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return days;
}


