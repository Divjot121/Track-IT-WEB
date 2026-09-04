import { create } from 'zustand';
import { Repository } from '../db/repository';
import { SyncEngine } from '../sync/syncEngine';
import { useAppStore } from './useAppStore';

interface TimerState {
  mode: 'pomodoro' | 'stopwatch';
  status: 'idle' | 'running' | 'paused';
  timeLeft: number; // For pomodoro (seconds)
  elapsed: number; // For stopwatch or elapsed in current cycle (seconds)
  targetMinutes: number; // e.g. 25
  isBreak: boolean;
  subjectId: string;
  chapterId: string | null;
  chapterTitle: string | null;
  isZenMode: boolean;
  
  // Actions
  setMode: (mode: 'pomodoro' | 'stopwatch') => void;
  setTargetMinutes: (mins: number) => void;
  bindChapter: (subjectId: string, chapterId: string | null, chapterTitle: string | null) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  toggleZenMode: () => void;
  finishSession: () => void;
}

// Web Audio API gentle bell chime
function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm dual-tone bell
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 1.2); // C5
    playTone(659.25, now + 0.15, 1.2); // E5
    playTone(783.99, now + 0.3, 1.8); // G5
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'pomodoro',
  status: 'idle',
  timeLeft: 25 * 60,
  elapsed: 0,
  targetMinutes: 25,
  isBreak: false,
  subjectId: 'maths-standard',
  chapterId: 'maths-real-numbers',
  chapterTitle: 'Real Numbers',
  isZenMode: false,

  setMode: (mode) =>
    set((state) => ({
      mode,
      status: 'idle',
      timeLeft: state.targetMinutes * 60,
      elapsed: 0,
      isBreak: false,
    })),

  setTargetMinutes: (mins) =>
    set((state) => ({
      targetMinutes: mins,
      timeLeft: state.status === 'idle' ? mins * 60 : state.timeLeft,
    })),

  bindChapter: (subjectId, chapterId, chapterTitle) =>
    set({ subjectId, chapterId, chapterTitle }),

  start: () => set({ status: 'running' }),
  pause: () => set({ status: 'paused' }),

  reset: () =>
    set((state) => ({
      status: 'idle',
      timeLeft: state.targetMinutes * 60,
      elapsed: 0,
      isBreak: false,
    })),

  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),

  finishSession: () => {
    const { mode, elapsed, targetMinutes, subjectId, chapterId, chapterTitle, isBreak } = get();
    const duration = mode === 'pomodoro' ? targetMinutes * 60 : elapsed;

    if (duration >= 10 && !isBreak) {
      // Save session if at least 30 seconds
      const sessionObj = {
        subjectId,
        chapterId: chapterId || undefined,
        chapterTitle: chapterTitle || undefined,
        durationSeconds: duration,
        mode,
        timestamp: new Date().toISOString(),
      };
      Repository.addStudySession(sessionObj).then(() => {
        useAppStore.getState().refreshData();
      });
      SyncEngine.enqueue('study_session', sessionObj);
    }

    playChimeSound();

    if (mode === 'pomodoro' && !isBreak) {
      // Transition to break
      set({
        isBreak: true,
        timeLeft: 5 * 60,
        status: 'paused',
        elapsed: 0,
      });
    } else {
      set({
        status: 'idle',
        timeLeft: targetMinutes * 60,
        elapsed: 0,
        isBreak: false,
      });
    }
  },

  tick: () => {
    const state = get();
    if (state.status !== 'running') return;

    if (state.mode === 'pomodoro') {
      if (state.timeLeft <= 1) {
        state.finishSession();
      } else {
        set({
          timeLeft: state.timeLeft - 1,
          elapsed: state.elapsed + 1,
        });
      }
    } else {
      // Stopwatch
      set({
        elapsed: state.elapsed + 1,
      });
    }
  },
}));
