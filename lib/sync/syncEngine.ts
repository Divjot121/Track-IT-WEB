import { getSupabase } from '../supabase/client';
import { useSyncStore } from '../stores/useSyncStore';
import { useAppStore } from '../stores/useAppStore';
import { Repository } from '../db/repository';
import {
  ChapterUserData,
  StudySessionLog,
  TimetableSlot,
  MockTestLog,
} from '../types';

interface QueueItem {
  id: string;
  type: 'chapter_progress' | 'study_session' | 'planner_block' | 'mock_score' | 'chapter_note';
  data: any;
  timestamp: string;
}

const QUEUE_KEY = 'trackit_sync_offline_queue';

function getQueue(): QueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to read sync queue:', e);
    return [];
  }
}

function saveQueue(queue: QueueItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('Failed to save sync queue:', e);
  }
}

export class SyncEngine {
  private static isFlushing = false;
  private static initialized = false;

  /**
   * Initializes sync engine, hooks auth state and network events
   */
  static init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    const syncStore = useSyncStore.getState();

    // Check initial online status
    syncStore.setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      syncStore.setSyncStatus('offline');
    }

    // Window network listeners
    window.addEventListener('online', () => {
      syncStore.setIsOnline(true);
      syncStore.setReconnectToast('Back online, syncing changes…');
      this.flushQueue();
      setTimeout(() => {
        useSyncStore.getState().setReconnectToast(null);
      }, 3000);
    });

    window.addEventListener('offline', () => {
      syncStore.setIsOnline(false);
      syncStore.setSyncStatus('offline');
    });

    // Supabase auth change listener
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        syncStore.setUser(session?.user || null);
        if (session?.user) {
          this.pullAndReconcile();
        }
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        syncStore.setUser(session?.user || null);
        if (session?.user) {
          this.pullAndReconcile();
        }
      });
    }
  }

  /**
   * Enqueue a local write to be synced to Supabase
   */
  static enqueue(type: QueueItem['type'], data: any): void {
    const queue = getQueue();
    const item: QueueItem = {
      id: `${type}_${data.chapterId || data.id || Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    // Deduplicate existing entry for same unique id
    const existingIndex = queue.findIndex((q) => q.id === item.id);
    if (existingIndex >= 0) {
      queue[existingIndex] = item;
    } else {
      queue.push(item);
    }
    saveQueue(queue);

    // If online and authenticated, trigger sync immediately in background
    if (navigator.onLine && useSyncStore.getState().user) {
      this.flushQueue();
    }
  }

  /**
   * Flushes the offline queue to Supabase
   */
  static async flushQueue(): Promise<void> {
    const user = useSyncStore.getState().user;
    const supabase = getSupabase();

    if (!user || !supabase || !navigator.onLine) {
      if (!navigator.onLine) useSyncStore.getState().setSyncStatus('offline');
      return;
    }

    if (this.isFlushing) return;
    this.isFlushing = true;
    useSyncStore.getState().setSyncStatus('syncing');

    try {
      const queue = getQueue();
      if (queue.length === 0) {
        useSyncStore.getState().setSyncStatus('synced');
        useSyncStore.getState().setLastSyncedAt(new Date());
        this.isFlushing = false;
        return;
      }

      const remaining: QueueItem[] = [];

      for (const item of queue) {
        try {
          switch (item.type) {
            case 'chapter_progress': {
              const ch = item.data as ChapterUserData;
              await supabase.from('chapter_progress').upsert(
                {
                  user_id: user.id,
                  subject_id: ch.subjectId,
                  chapter_id: ch.chapterId,
                  status: ch.status,
                  confidence: ch.confidence,
                  last_studied_at: ch.lastStudiedAt,
                  revision_due_date: ch.revisionDueDate,
                  revision_interval_level: ch.revisionIntervalLevel,
                  updated_at: ch.updatedAt || new Date().toISOString(),
                },
                { onConflict: 'user_id,chapter_id' }
              );
              break;
            }

            case 'study_session': {
              const s = item.data as StudySessionLog;
              await supabase.from('study_sessions').insert({
                user_id: user.id,
                subject_id: s.subjectId,
                chapter_id: s.chapterId || null,
                chapter_title: s.chapterTitle || null,
                mode: s.mode,
                duration_seconds: s.durationSeconds,
                started_at: s.timestamp || new Date().toISOString(),
              });
              break;
            }

            case 'planner_block': {
              const p = item.data as TimetableSlot;
              await supabase.from('planner_blocks').upsert(
                {
                  id: p.id,
                  user_id: user.id,
                  date: new Date().toISOString().slice(0, 10),
                  day_of_week: p.dayOfWeek,
                  subject_id: p.subjectId,
                  start_time: p.timeSlot?.split('-')?.[0]?.trim() || '',
                  end_time: p.timeSlot?.split('-')?.[1]?.trim() || '',
                  notes: p.notes || '',
                  completed: p.completed || false,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              );
              break;
            }

            case 'mock_score': {
              const m = item.data as MockTestLog;
              await supabase.from('mock_scores').insert({
                user_id: user.id,
                subject_id: m.subjectId,
                label: m.title,
                score: m.marksScored,
                max_score: m.maxMarks,
                date: m.date,
                notes: m.notes || null,
                created_at: new Date().toISOString(),
              });
              break;
            }

            case 'chapter_note': {
              const n = item.data as { chapterId: string; content: string; updatedAt: string };
              await supabase.from('chapter_notes').upsert(
                {
                  user_id: user.id,
                  chapter_id: n.chapterId,
                  content: n.content,
                  updated_at: n.updatedAt || new Date().toISOString(),
                },
                { onConflict: 'user_id,chapter_id' }
              );
              break;
            }
          }
        } catch (itemErr) {
          console.warn(`Failed to sync item ${item.id}:`, itemErr);
          remaining.push(item);
        }
      }

      saveQueue(remaining);

      if (remaining.length === 0) {
        useSyncStore.getState().setSyncStatus('synced');
        useSyncStore.getState().setLastSyncedAt(new Date());
        useSyncStore.getState().setErrorMessage(null);
      } else {
        useSyncStore.getState().setSyncStatus('error');
        useSyncStore.getState().setErrorMessage(`${remaining.length} items waiting to sync`);
      }
    } catch (e: any) {
      console.error('Sync flush error:', e);
      useSyncStore.getState().setSyncStatus('error');
      useSyncStore.getState().setErrorMessage(e?.message || 'Sync failed');
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Pulls latest cross-device data from Supabase and reconciles with local IndexedDB (last-write-wins)
   */
  static async pullAndReconcile(): Promise<void> {
    const user = useSyncStore.getState().user;
    const supabase = getSupabase();

    if (!user || !supabase || !navigator.onLine) return;

    useSyncStore.getState().setIsInitialDataPulling(true);
    useSyncStore.getState().setSyncStatus('syncing');

    try {
      // 1. Pull chapter progress
      const { data: remoteProgress } = await supabase
        .from('chapter_progress')
        .select('*')
        .eq('user_id', user.id);

      // 2. Pull chapter notes
      const { data: remoteNotes } = await supabase
        .from('chapter_notes')
        .select('*')
        .eq('user_id', user.id);

      // 3. Pull mock scores
      const { data: remoteMocks } = await supabase
        .from('mock_scores')
        .select('*')
        .eq('user_id', user.id);

      // 4. Pull planner blocks
      const { data: remotePlanner } = await supabase
        .from('planner_blocks')
        .select('*')
        .eq('user_id', user.id);

      const localChapters = await Repository.getAllChapterUserData();
      let hasLocalChanges = false;

      // Reconcile Chapter Progress (last-write-wins)
      if (remoteProgress && remoteProgress.length > 0) {
        for (const rem of remoteProgress) {
          const loc = localChapters[rem.chapter_id];
          const remTime = new Date(rem.updated_at).getTime();
          const locTime = loc?.updatedAt ? new Date(loc.updatedAt).getTime() : 0;

          if (!loc || remTime > locTime) {
            localChapters[rem.chapter_id] = {
              chapterId: rem.chapter_id,
              subjectId: rem.subject_id,
              unitId: loc?.unitId || '',
              status: rem.status as any,
              confidence: rem.confidence || 0,
              notes: loc?.notes || '',
              lastStudiedAt: rem.last_studied_at,
              revisionDueDate: rem.revision_due_date,
              revisionIntervalLevel: rem.revision_interval_level || 0,
              timeSpentSeconds: loc?.timeSpentSeconds || 0,
              updatedAt: rem.updated_at,
            };
            hasLocalChanges = true;
          }
        }
      }

      // Reconcile Chapter Notes
      if (remoteNotes && remoteNotes.length > 0) {
        for (const n of remoteNotes) {
          const loc = localChapters[n.chapter_id];
          const remTime = new Date(n.updated_at).getTime();
          const locTime = loc?.updatedAt ? new Date(loc.updatedAt).getTime() : 0;

          if (loc && remTime > locTime) {
            loc.notes = n.content;
            loc.updatedAt = n.updated_at;
            hasLocalChanges = true;
          }
        }
      }

      if (hasLocalChanges) {
        await Repository.saveAllChapterUserData(localChapters);
      }

      // Reconcile Mock Tests
      if (remoteMocks && remoteMocks.length > 0) {
        const localMocks = await Repository.getMockTests();
        const existingTitles = new Set(localMocks.map((m) => `${m.title}_${m.date}_${m.marksScored}`));
        let addedMock = false;

        for (const rem of remoteMocks) {
          const key = `${rem.label}_${rem.date}_${rem.score}`;
          if (!existingTitles.has(key)) {
            await Repository.addMockTest({
              subjectId: rem.subject_id,
              title: rem.label,
              marksScored: Number(rem.score),
              maxMarks: Number(rem.max_score),
              date: rem.date,
              notes: rem.notes || undefined,
            });
            addedMock = true;
          }
        }
      }

      // Reconcile Planner Blocks
      if (remotePlanner && remotePlanner.length > 0) {
        const localSlots = await Repository.getTimetableSlots();
        const localMap = new Map(localSlots.map((s) => [s.id, s]));

        for (const rem of remotePlanner) {
          const slot: TimetableSlot = {
            id: rem.id,
            dayOfWeek: rem.day_of_week ?? 1,
            timeSlot: `${rem.start_time} - ${rem.end_time}`,
            subjectId: rem.subject_id,
            notes: rem.notes || '',
            completed: rem.completed || false,
          };
          await Repository.saveTimetableSlot(slot);
        }
      }

      // Refresh Zustand app store so UI reflects newly synchronized data
      await useAppStore.getState().refreshData();

      // Flush any queued local writes that were pending
      await this.flushQueue();

      useSyncStore.getState().setSyncStatus('synced');
      useSyncStore.getState().setLastSyncedAt(new Date());
      useSyncStore.getState().setErrorMessage(null);
    } catch (e: any) {
      console.error('Cross-device pull failed:', e);
      useSyncStore.getState().setSyncStatus('error');
      useSyncStore.getState().setErrorMessage('Failed to pull remote data');
    } finally {
      useSyncStore.getState().setIsInitialDataPulling(false);
    }
  }

  /**
   * Manual retry triggered by user click on Error indicator
   */
  static async retrySync(): Promise<void> {
    if (useSyncStore.getState().user) {
      await this.pullAndReconcile();
    } else {
      useSyncStore.getState().setAuthModalOpen(true);
    }
  }
}
