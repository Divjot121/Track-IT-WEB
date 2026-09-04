import { getDb } from './dexie';
import {
  ChapterUserData,
  StudySessionLog,
  MockTestLog,
  TimetableSlot,
  AppSettings,
  ChapterStatus,
} from '../types';
import { SEED_SUBJECTS } from '@/data/subjects';

const LS_PREFIX = 'trackit_v1_';

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'user-settings',
  examDate: '2027-02-15',
  targetPercentage: 95,
  selectedSubjectIds: SEED_SUBJECTS.map((s) => s.id),
  theme: 'dark',
  onboardingCompleted: false,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  soundEnabled: true,
};

// Generate default chapter user data from seed
export function generateDefaultChapterMap(): Record<string, ChapterUserData> {
  const map: Record<string, ChapterUserData> = {};
  for (const sub of SEED_SUBJECTS) {
    for (const unit of sub.units) {
      for (const ch of unit.chapters) {
        map[ch.id] = {
          chapterId: ch.id,
          subjectId: sub.id,
          unitId: unit.id,
          status: ch.defaultStatus || 'not-started',
          confidence: 0,
          notes: '',
          lastStudiedAt: null,
          revisionDueDate: null,
          revisionIntervalLevel: 0,
          timeSpentSeconds: 0,
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }
  return map;
}

// Fallback LocalStorage Helpers
function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`LocalStorage read failed for ${key}`, err);
    return fallback;
  }
}

function lsSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage write failed for ${key}`, err);
  }
}

export class Repository {
  /**
   * Loads all chapter user data
   */
  static async getAllChapterUserData(): Promise<Record<string, ChapterUserData>> {
    const db = getDb();
    if (db) {
      try {
        const records = await db.chapters.toArray();
        if (records.length > 0) {
          const map: Record<string, ChapterUserData> = {};
          for (const r of records) {
            map[r.chapterId] = r;
          }
          return map;
        }
      } catch (e) {
        console.warn('Dexie read failed, trying localStorage fallback', e);
      }
    }

    // LocalStorage fallback or generate initial
    const lsData = lsGet<Record<string, ChapterUserData> | null>('chapters', null);
    if (lsData && Object.keys(lsData).length > 0) {
      return lsData;
    }

    const defaultMap = generateDefaultChapterMap();
    await this.saveAllChapterUserData(defaultMap);
    return defaultMap;
  }

  /**
   * Saves a single chapter record
   */
  static async saveChapterUserData(data: ChapterUserData): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.chapters.put(data);
      } catch (e) {
        console.warn('Dexie save failed, falling back to localStorage', e);
      }
    }

    const all = lsGet<Record<string, ChapterUserData>>('chapters', {});
    all[data.chapterId] = data;
    lsSet('chapters', all);
  }

  /**
   * Bulk save chapters
   */
  static async saveAllChapterUserData(map: Record<string, ChapterUserData>): Promise<void> {
    const list = Object.values(map);
    const db = getDb();
    if (db) {
      try {
        await db.chapters.bulkPut(list);
      } catch (e) {
        console.warn('Dexie bulkPut failed, falling back to localStorage', e);
      }
    }
    lsSet('chapters', map);
  }

  /**
   * Study Sessions
   */
  static async getStudySessions(): Promise<StudySessionLog[]> {
    const db = getDb();
    if (db) {
      try {
        return await db.studySessions.orderBy('timestamp').reverse().toArray();
      } catch (e) {
        console.warn('Dexie studySessions failed', e);
      }
    }
    return lsGet<StudySessionLog[]>('studySessions', []);
  }

  static async addStudySession(session: StudySessionLog): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.studySessions.add(session);
      } catch (e) {
        console.warn('Dexie add studySession failed', e);
      }
    }
    const current = lsGet<StudySessionLog[]>('studySessions', []);
    current.unshift(session);
    lsSet('studySessions', current);
  }

  /**
   * Mock Tests
   */
  static async getMockTests(): Promise<MockTestLog[]> {
    const db = getDb();
    if (db) {
      try {
        return await db.mockTests.orderBy('date').reverse().toArray();
      } catch (e) {
        console.warn('Dexie mockTests failed', e);
      }
    }
    return lsGet<MockTestLog[]>('mockTests', []);
  }

  static async addMockTest(test: MockTestLog): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.mockTests.add(test);
      } catch (e) {
        console.warn('Dexie add mockTest failed', e);
      }
    }
    const current = lsGet<MockTestLog[]>('mockTests', []);
    current.unshift(test);
    lsSet('mockTests', current);
  }

  static async deleteMockTest(id: number): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.mockTests.delete(id);
      } catch (e) {
        console.warn('Dexie delete mockTest failed', e);
      }
    }
    const current = lsGet<MockTestLog[]>('mockTests', []);
    const filtered = current.filter((t) => t.id !== id);
    lsSet('mockTests', filtered);
  }

  /**
   * Timetable
   */
  static async getTimetableSlots(): Promise<TimetableSlot[]> {
    const db = getDb();
    if (db) {
      try {
        return await db.timetable.toArray();
      } catch (e) {
        console.warn('Dexie timetable failed', e);
      }
    }
    return lsGet<TimetableSlot[]>('timetable', [
      { id: 't-1', dayOfWeek: 1, timeSlot: '17:00 - 18:30', subjectId: 'maths-standard', notes: 'Algebra practice' },
      { id: 't-2', dayOfWeek: 1, timeSlot: '19:00 - 20:30', subjectId: 'science', notes: 'Chemical reactions' },
      { id: 't-3', dayOfWeek: 2, timeSlot: '17:00 - 18:30', subjectId: 'social-science', notes: 'History chapter review' },
      { id: 't-4', dayOfWeek: 3, timeSlot: '17:00 - 18:30', subjectId: 'maths-standard', notes: 'Geometry theorems' },
      { id: 't-5', dayOfWeek: 4, timeSlot: '18:00 - 19:30', subjectId: 'english', notes: 'Prose & Writing skills' },
      { id: 't-6', dayOfWeek: 5, timeSlot: '17:00 - 19:00', subjectId: 'science', notes: 'Physics numericals' },
      { id: 't-7', dayOfWeek: 6, timeSlot: '10:00 - 12:30', subjectId: 'maths-standard', notes: 'Full sample paper' },
    ]);
  }

  static async saveTimetableSlot(slot: TimetableSlot): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.timetable.put(slot);
      } catch (e) {
        console.warn('Dexie timetable save failed', e);
      }
    }
    const list = lsGet<TimetableSlot[]>('timetable', []);
    const idx = list.findIndex((s) => s.id === slot.id);
    if (idx >= 0) {
      list[idx] = slot;
    } else {
      list.push(slot);
    }
    lsSet('timetable', list);
  }

  static async deleteTimetableSlot(id: string): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.timetable.delete(id);
      } catch (e) {
        console.warn('Dexie timetable delete failed', e);
      }
    }
    const list = lsGet<TimetableSlot[]>('timetable', []);
    lsSet('timetable', list.filter((s) => s.id !== id));
  }

  /**
   * App Settings
   */
  static async getSettings(): Promise<AppSettings> {
    const db = getDb();
    if (db) {
      try {
        const saved = await db.settings.get('user-settings');
        if (saved) return saved;
      } catch (e) {
        console.warn('Dexie settings failed', e);
      }
    }
    return lsGet<AppSettings>('settings', DEFAULT_SETTINGS);
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.settings.put({ ...settings, id: 'user-settings' });
      } catch (e) {
        console.warn('Dexie settings save failed', e);
      }
    }
    lsSet('settings', settings);
  }

  /**
   * Export all data as JSON
   */
  static async exportAllData(): Promise<string> {
    const [chapters, studySessions, mockTests, timetable, settings] = await Promise.all([
      this.getAllChapterUserData(),
      this.getStudySessions(),
      this.getMockTests(),
      this.getTimetableSlots(),
      this.getSettings(),
    ]);

    const payload = {
      app: 'TrackIT Web',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        chapters,
        studySessions,
        mockTests,
        timetable,
        settings,
      },
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Import data from JSON
   */
  static async importAllData(rawJson: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed.data) throw new Error('Invalid backup schema');

      const { chapters, studySessions, mockTests, timetable, settings } = parsed.data;

      if (chapters) await this.saveAllChapterUserData(chapters);
      if (settings) await this.saveSettings(settings);

      const db = getDb();
      if (studySessions && Array.isArray(studySessions)) {
        if (db) {
          await db.studySessions.clear();
          await db.studySessions.bulkPut(studySessions);
        }
        lsSet('studySessions', studySessions);
      }

      if (mockTests && Array.isArray(mockTests)) {
        if (db) {
          await db.mockTests.clear();
          await db.mockTests.bulkPut(mockTests);
        }
        lsSet('mockTests', mockTests);
      }

      if (timetable && Array.isArray(timetable)) {
        if (db) {
          await db.timetable.clear();
          await db.timetable.bulkPut(timetable);
        }
        lsSet('timetable', timetable);
      }

      return true;
    } catch (e) {
      console.error('Data import failed:', e);
      return false;
    }
  }

  /**
   * Reset all data to clean default seed
   */
  static async resetAllData(): Promise<void> {
    const db = getDb();
    if (db) {
      try {
        await db.chapters.clear();
        await db.studySessions.clear();
        await db.mockTests.clear();
        await db.timetable.clear();
        await db.settings.clear();
      } catch (e) {
        console.warn('Dexie clear failed', e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LS_PREFIX + 'chapters');
      localStorage.removeItem(LS_PREFIX + 'studySessions');
      localStorage.removeItem(LS_PREFIX + 'mockTests');
      localStorage.removeItem(LS_PREFIX + 'timetable');
      localStorage.removeItem(LS_PREFIX + 'settings');
    }
  }
}
