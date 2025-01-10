import { CalendarDate, parseDate } from "@internationalized/date";

export type StreakEntry = {
  date: CalendarDate;
  completed: boolean;
  note: string;
};

export interface Scrip {
  id?: number;
  name: string;
  description: string;
  type: string[];
  timeSpan: CalendarDate[];
  streak: StreakEntry[];
  createdAt: CalendarDate;
}

// Type for the raw database row
export interface ScripRow {
  id: number;
  name: string;
  description: string;
  type: string;
  time_span: string;
  streak: string;
  created_at: string;
}

export const scripSerializer = {
  /**
   * Converts a Scrip object to a format suitable for database storage
   */
  toRow(scrip: Scrip): Omit<ScripRow, 'id'> {
    return {
      name: scrip.name,
      description: scrip.description,
      type: JSON.stringify(scrip.type),
      time_span: JSON.stringify(scrip.timeSpan.map(date => date.toString())),
      streak: JSON.stringify(scrip.streak.map(entry => ({
        ...entry,
        date: entry.date.toString()
      }))),
      created_at: scrip.createdAt.toString()
    };
  },

  /**
   * Converts a database row back to a Scrip object
   */
  fromRow(row: ScripRow): Scrip {
    let timeSpanDates: CalendarDate[] = [];
    try {
      const timeSpanStr = row.time_span || '[]';
      const parsedDates = JSON.parse(timeSpanStr);
      if (Array.isArray(parsedDates)) {
        timeSpanDates = parsedDates.map(dateStr => parseDate(dateStr));
      }
    } catch (error) {
      console.error('Error parsing timeSpan:', error);
      timeSpanDates = [];
    }

    let streakEntries: StreakEntry[] = [];
    try {
      const streakStr = row.streak || '[]';
      streakEntries = JSON.parse(streakStr).map((entry: any) => ({
        ...entry,
        date: parseDate(entry.date)
      }));
    } catch (error) {
      console.error('Error parsing streak:', error);
      streakEntries = [];
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: JSON.parse(row.type || '[]'),
      timeSpan: timeSpanDates,
      streak: streakEntries,
      createdAt: parseDate(row.created_at)
    };
  }
};

// Helper function to create a new Scrip
export function createScrip(
  name: string,
  description: string,
  type: string[] = [],
  startDate: CalendarDate,
  endDate: CalendarDate,
  createdAt: CalendarDate
): Scrip {
  return {
    name,
    description,
    type,
    timeSpan: [startDate, endDate],
    streak: [],
    createdAt
  };
}
