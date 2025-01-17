export type StreakEntry = {
  date: Date;
  note: string;
};

export interface Scrip {
  id?: number;
  name: string;
  description: string;
  type: string[];
  timeSpan: Date[];
  streak: StreakEntry[];
  createdAt: Date;
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
      time_span: JSON.stringify(scrip.timeSpan.map(date => date.toISOString())),
      streak: JSON.stringify(scrip.streak.map(entry => ({
        date: entry.date.toISOString(),
        note: entry.note
      }))),
      created_at: scrip.createdAt.toISOString()
    };
  },

  /**
   * Converts a database row back to a Scrip object
   */
  fromRow(row: ScripRow): Scrip {
    let timeSpanDates: Date[] = [];
    try {
      const timeSpanStr = row.time_span || '[]';
      const parsedDates = JSON.parse(timeSpanStr);
      if (Array.isArray(parsedDates)) {
        timeSpanDates = parsedDates.map(dateStr => new Date(dateStr));
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
        date: new Date(entry.date)
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
      createdAt: new Date(row.created_at)
    };
  }
};

// Helper function to create a new Scrip
export function createScrip(
  name: string,
  description: string,
  type: string[] = [],
  startDate: Date,
  endDate: Date,
  createdAt: Date
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
