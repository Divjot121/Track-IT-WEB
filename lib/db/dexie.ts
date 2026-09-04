import Dexie, { Table } from 'dexie';
import { ChapterUserData, StudySessionLog, MockTestLog, TimetableSlot, AppSettings } from '../types';

export class TrackITDatabase extends Dexie {
  chapters!: Table<ChapterUserData, string>;
  studySessions!: Table<StudySessionLog, number>;
  mockTests!: Table<MockTestLog, number>;
  timetable!: Table<TimetableSlot, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('TrackIT_Web_DB');
    this.version(1).stores({
      chapters: 'chapterId, subjectId, unitId, status, confidence, revisionDueDate, lastStudiedAt, updatedAt',
      studySessions: '++id, subjectId, chapterId, mode, timestamp',
      mockTests: '++id, subjectId, date, marksScored',
      timetable: 'id, dayOfWeek, subjectId',
      settings: 'id',
    });
  }
}

// Singleton database instance
let dbInstance: TrackITDatabase | null = null;

export function getDb(): TrackITDatabase | null {
  if (typeof window === 'undefined') return null;
  if (!dbInstance) {
    dbInstance = new TrackITDatabase();
  }
  return dbInstance;
}
