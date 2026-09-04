export type ChapterStatus = 'not-started' | 'in-progress' | 'revision' | 'mastered';

export interface Chapter {
  id: string;
  title: string;
  defaultStatus?: ChapterStatus;
  isStub?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  marksWeightage: number;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  iconName: string;
  color: string;
  totalMarks: number;
  units: Unit[];
}

export interface ChapterUserData {
  chapterId: string;
  subjectId: string;
  unitId: string;
  status: ChapterStatus;
  confidence: number; // 1 to 5
  notes: string;
  lastStudiedAt: string | null; // ISO string
  revisionDueDate: string | null; // ISO string
  revisionIntervalLevel: number; // 0, 1 (3d), 2 (7d), 3 (14d), 4 (30d)
  timeSpentSeconds: number;
  updatedAt: string;
}

export interface StudySessionLog {
  id?: number;
  subjectId: string;
  chapterId?: string;
  chapterTitle?: string;
  durationSeconds: number;
  mode: 'pomodoro' | 'stopwatch';
  timestamp: string; // ISO string
  notes?: string;
}

export interface MockTestLog {
  id?: number;
  subjectId: string;
  title: string;
  marksScored: number;
  maxMarks: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  timeSlot: string; // e.g. "17:00 - 18:30"
  subjectId: string;
  unitId?: string;
  chapterId?: string;
  notes?: string;
  completed?: boolean;
}

export interface AppSettings {
  id?: string;
  examDate: string; // e.g. "2027-02-15"
  targetPercentage: number; // e.g. 95
  selectedSubjectIds: string[];
  theme: 'dark' | 'light' | 'system';
  onboardingCompleted: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  soundEnabled: boolean;
}
