import { create } from 'zustand';
import {
  ChapterUserData,
  ChapterStatus,
  AppSettings,
  MockTestLog,
  TimetableSlot,
  StudySessionLog,
  Subject,
} from '../types';
import { Repository, DEFAULT_SETTINGS } from '../db/repository';
import { SEED_SUBJECTS } from '@/data/subjects';
import { getNextRevisionDate } from '../utils';
import { SyncEngine } from '../sync/syncEngine';
import confetti from 'canvas-confetti';

interface AppState {
  isInitialized: boolean;
  subjects: Subject[];
  selectedSubjectId: string;
  selectedChapterId: string | null;
  chapterDataMap: Record<string, ChapterUserData>;
  settings: AppSettings;
  mockTests: MockTestLog[];
  studySessions: StudySessionLog[];
  timetableSlots: TimetableSlot[];
  
  // UI states
  isCommandPaletteOpen: boolean;
  isOnboardingOpen: boolean;
  isManualSessionModalOpen: boolean;
  searchQuery: string;
  statusFilter: 'all' | ChapterStatus;
  
  // Actions
  initialize: () => Promise<void>;
  setSelectedSubject: (id: string) => void;
  setSelectedChapter: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: 'all' | ChapterStatus) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setOnboardingOpen: (open: boolean) => void;
  setManualSessionModalOpen: (open: boolean) => void;
  
  // Data updates
  updateChapterStatus: (chapterId: string, status: ChapterStatus) => Promise<void>;
  updateChapterNotes: (chapterId: string, notes: string) => Promise<void>;
  updateChapterConfidence: (chapterId: string, confidence: number) => Promise<void>;
  markChapterRevised: (chapterId: string) => Promise<void>;
  
  // Mock tests
  addMockTest: (test: Omit<MockTestLog, 'id'>) => Promise<void>;
  deleteMockTest: (id: number) => Promise<void>;
  
  // Timetable
  addTimetableSlot: (slot: TimetableSlot) => Promise<void>;
  updateTimetableSlot: (slot: TimetableSlot) => Promise<void>;
  deleteTimetableSlot: (id: string) => Promise<void>;
  
  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  subjects: SEED_SUBJECTS,
  selectedSubjectId: 'maths-standard',
  selectedChapterId: 'maths-real-numbers',
  chapterDataMap: {},
  settings: DEFAULT_SETTINGS,
  mockTests: [],
  studySessions: [],
  timetableSlots: [],

  isCommandPaletteOpen: false,
  isOnboardingOpen: false,
  isManualSessionModalOpen: false,
  searchQuery: '',
  statusFilter: 'all',

  setManualSessionModalOpen: (open: boolean) => set({ isManualSessionModalOpen: open }),

  initialize: async () => {
    try {
      const [chapterDataMap, settings, mockTests, studySessions, timetableSlots] = await Promise.all([
        Repository.getAllChapterUserData(),
        Repository.getSettings(),
        Repository.getMockTests(),
        Repository.getStudySessions(),
        Repository.getTimetableSlots(),
      ]);

      const shouldShowOnboarding = !settings.onboardingCompleted;

      set({
        isInitialized: true,
        chapterDataMap,
        settings,
        mockTests,
        studySessions,
        timetableSlots,
        isOnboardingOpen: shouldShowOnboarding,
      });
    } catch (e) {
      console.error('Failed to initialize App Store:', e);
      set({ isInitialized: true });
    }
  },

  refreshData: async () => {
    const [chapterDataMap, settings, mockTests, studySessions, timetableSlots] = await Promise.all([
      Repository.getAllChapterUserData(),
      Repository.getSettings(),
      Repository.getMockTests(),
      Repository.getStudySessions(),
      Repository.getTimetableSlots(),
    ]);

    set({
      chapterDataMap,
      settings,
      mockTests,
      studySessions,
      timetableSlots,
    });
  },

  setSelectedSubject: (id) => {
    const currentSubject = get().subjects.find((s) => s.id === id);
    const firstChapterId = currentSubject?.units[0]?.chapters[0]?.id || null;
    set({ selectedSubjectId: id, selectedChapterId: firstChapterId });
  },

  setSelectedChapter: (id) => set({ selectedChapterId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setOnboardingOpen: (isOnboardingOpen) => set({ isOnboardingOpen }),

  updateChapterStatus: async (chapterId, status) => {
    const { chapterDataMap, subjects } = get();
    const existing = chapterDataMap[chapterId];
    
    // Find subject and unit id
    let subjectId = existing?.subjectId || '';
    let unitId = existing?.unitId || '';
    if (!subjectId) {
      for (const s of subjects) {
        for (const u of s.units) {
          if (u.chapters.some((c) => c.id === chapterId)) {
            subjectId = s.id;
            unitId = u.id;
            break;
          }
        }
      }
    }

    let revisionDueDate = existing?.revisionDueDate || null;
    let revisionIntervalLevel = existing?.revisionIntervalLevel || 0;

    // If newly marked mastered, schedule first spaced repetition review in 3 days!
    if (status === 'mastered') {
      const rev = getNextRevisionDate(0);
      revisionDueDate = rev.dueDate;
      revisionIntervalLevel = rev.nextLevel;

      // Celebrate milestone with light confetti
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366F1', '#10B981', '#3B82F6', '#F59E0B'],
        });
      }
    }

    const updated: ChapterUserData = {
      chapterId,
      subjectId,
      unitId,
      status,
      confidence: existing?.confidence || (status === 'mastered' ? 5 : status === 'revision' ? 4 : status === 'in-progress' ? 3 : 0),
      notes: existing?.notes || '',
      lastStudiedAt: new Date().toISOString(),
      revisionDueDate,
      revisionIntervalLevel,
      timeSpentSeconds: existing?.timeSpentSeconds || 0,
      updatedAt: new Date().toISOString(),
    };

    const newMap = { ...chapterDataMap, [chapterId]: updated };
    set({ chapterDataMap: newMap });
    await Repository.saveChapterUserData(updated);
    SyncEngine.enqueue('chapter_progress', updated);
  },

  updateChapterNotes: async (chapterId, notes) => {
    const { chapterDataMap } = get();
    const existing = chapterDataMap[chapterId];
    if (!existing) return;

    const updated: ChapterUserData = {
      ...existing,
      notes,
      updatedAt: new Date().toISOString(),
    };

    set({ chapterDataMap: { ...chapterDataMap, [chapterId]: updated } });
    await Repository.saveChapterUserData(updated);
    SyncEngine.enqueue('chapter_note', { chapterId, content: notes, updatedAt: updated.updatedAt });
  },

  updateChapterConfidence: async (chapterId, confidence) => {
    const { chapterDataMap } = get();
    const existing = chapterDataMap[chapterId];
    if (!existing) return;

    const updated: ChapterUserData = {
      ...existing,
      confidence,
      updatedAt: new Date().toISOString(),
    };

    set({ chapterDataMap: { ...chapterDataMap, [chapterId]: updated } });
    await Repository.saveChapterUserData(updated);
    SyncEngine.enqueue('chapter_progress', updated);
  },

  markChapterRevised: async (chapterId) => {
    const { chapterDataMap } = get();
    const existing = chapterDataMap[chapterId];
    if (!existing) return;

    const currentLevel = existing.revisionIntervalLevel || 1;
    const rev = getNextRevisionDate(currentLevel);

    const updated: ChapterUserData = {
      ...existing,
      status: 'mastered',
      lastStudiedAt: new Date().toISOString(),
      revisionDueDate: rev.dueDate,
      revisionIntervalLevel: rev.nextLevel,
      updatedAt: new Date().toISOString(),
    };

    set({ chapterDataMap: { ...chapterDataMap, [chapterId]: updated } });
    await Repository.saveChapterUserData(updated);
    SyncEngine.enqueue('chapter_progress', updated);

    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#10B981', '#6366F1'],
      });
    }
  },

  addMockTest: async (test) => {
    await Repository.addMockTest(test);
    const mockTests = await Repository.getMockTests();
    set({ mockTests });
    SyncEngine.enqueue('mock_score', test);
  },

  deleteMockTest: async (id) => {
    await Repository.deleteMockTest(id);
    const mockTests = await Repository.getMockTests();
    set({ mockTests });
  },

  addTimetableSlot: async (slot) => {
    await Repository.saveTimetableSlot(slot);
    const timetableSlots = await Repository.getTimetableSlots();
    set({ timetableSlots });
    SyncEngine.enqueue('planner_block', slot);
  },

  updateTimetableSlot: async (slot) => {
    await Repository.saveTimetableSlot(slot);
    const timetableSlots = await Repository.getTimetableSlots();
    set({ timetableSlots });
    SyncEngine.enqueue('planner_block', slot);
  },

  deleteTimetableSlot: async (id) => {
    await Repository.deleteTimetableSlot(id);
    const timetableSlots = await Repository.getTimetableSlots();
    set({ timetableSlots });
  },

  updateSettings: async (newSettings) => {
    const current = get().settings;
    const merged: AppSettings = { ...current, ...newSettings };
    set({ settings: merged });
    await Repository.saveSettings(merged);
  },
}));
