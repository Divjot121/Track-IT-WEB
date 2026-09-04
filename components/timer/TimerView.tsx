'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { useAppStore } from '@/lib/stores/useAppStore';
import { ProgressRing } from '../ui/progress-ring';
import { SubjectIcon } from '../ui/subject-icon';
import { formatTime, formatHours } from '@/lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Timer as TimerIcon,
  Clock,
  Coffee,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const TimerView: React.FC = () => {
  const {
    mode,
    status,
    timeLeft,
    elapsed,
    targetMinutes,
    isBreak,
    subjectId,
    chapterId,
    chapterTitle,
    isZenMode,
    setMode,
    setTargetMinutes,
    bindChapter,
    start,
    pause,
    reset,
    tick,
    toggleZenMode,
    finishSession,
  } = useTimerStore();

  const { subjects, studySessions, setManualSessionModalOpen } = useAppStore();

  // Timer interval hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, tick]);

  const currentSubject = subjects.find((s) => s.id === subjectId) || subjects[0];

  // Calculate percentage
  const totalDuration = isBreak ? 5 * 60 : targetMinutes * 60;
  const progressPercent =
    mode === 'pomodoro'
      ? Math.min(Math.max(((totalDuration - timeLeft) / (totalDuration || 1)) * 100, 0), 100)
      : Math.min((elapsed / 3600) * 100, 100);

  const displayTime = formatTime(mode === 'pomodoro' ? timeLeft : elapsed);

  // Zen mode full screen render
  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8 select-none">
        <button
          onClick={toggleZenMode}
          className="absolute top-6 right-6 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <Minimize2 className="w-4 h-4" /> Exit Zen Focus
        </button>

        <div className="text-center space-y-3 mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-mono">
            {isBreak ? '☕ Rest & Re-hydrate' : 'Deep Study Zen Mode'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {chapterTitle || currentSubject?.name || 'Board Preparation'}
          </h2>
        </div>

        <ProgressRing
          percentage={progressPercent}
          size={340}
          strokeWidth={14}
          color={isBreak ? '#10B981' : currentSubject?.color || '#6366F1'}
        >
          <div className="space-y-2">
            <div className="text-6xl font-extrabold font-mono tracking-tight text-foreground">
              {displayTime}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {mode === 'pomodoro' ? `${targetMinutes}m target` : 'continuous stopwatch'}
            </div>
          </div>
        </ProgressRing>

        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={status === 'running' ? pause : start}
            className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
          >
            {status === 'running' ? (
              <>
                <Pause className="w-5 h-5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Resume
              </>
            )}
          </button>
          <button
            onClick={reset}
            className="p-3.5 rounded-2xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={finishSession}
            className="px-4 py-3.5 rounded-2xl bg-surface border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Log Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Main Focus Control Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left 7 Cols: Interactive Timer Dial */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-surface border border-surface-border shadow-xs flex flex-col items-center justify-between min-h-[480px]">
          {/* Mode Switcher & Zen Mode Trigger */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center bg-muted/60 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMode('pomodoro')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === 'pomodoro'
                    ? 'bg-surface text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TimerIcon className="w-3.5 h-3.5" /> Pomodoro
              </button>
              <button
                onClick={() => setMode('stopwatch')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === 'stopwatch'
                    ? 'bg-surface text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Stopwatch
              </button>
            </div>

            <button
              onClick={toggleZenMode}
              title="Fullscreen Zen Mode"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Central Circular Progress */}
          <div className="my-6 relative">
            <ProgressRing
              percentage={progressPercent}
              size={280}
              strokeWidth={12}
              color={isBreak ? '#10B981' : currentSubject?.color || '#6366F1'}
            >
              <div className="space-y-1">
                <div className="text-5xl font-extrabold font-mono tracking-tight text-foreground">
                  {displayTime}
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isBreak ? (
                    <span className="text-emerald-500 font-bold flex items-center justify-center gap-1">
                      <Coffee className="w-3.5 h-3.5" /> Break Time
                    </span>
                  ) : (
                    <span>{status === 'running' ? 'Focusing' : status}</span>
                  )}
                </div>
              </div>
            </ProgressRing>
          </div>

          {/* Duration Presets (Pomodoro) */}
          {mode === 'pomodoro' && (
            <div className="flex items-center gap-2 mb-6">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTargetMinutes(mins)}
                  disabled={status === 'running'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    targetMinutes === mins
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="p-3 rounded-2xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={status === 'running' ? pause : start}
              className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              {status === 'running' ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Focus
                </>
              )}
            </button>

            <button
              onClick={finishSession}
              title="Log & Complete Session"
              className="p-3 rounded-2xl bg-surface border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Subject & Chapter Binding & Quick Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Binding Card */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-primary" />
              Bound Subject & Chapter
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-medium">
                  Select Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    const newSub = subjects.find((s) => s.id === e.target.value);
                    const firstCh = newSub?.units[0]?.chapters[0];
                    bindChapter(e.target.value, firstCh?.id || null, firstCh?.title || null);
                  }}
                  className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-medium">
                  Select Chapter (Optional)
                </label>
                <select
                  value={chapterId || ''}
                  onChange={(e) => {
                    const chId = e.target.value;
                    let title = null;
                    for (const u of currentSubject.units) {
                      const found = u.chapters.find((c) => c.id === chId);
                      if (found) {
                        title = found.title;
                        break;
                      }
                    }
                    bindChapter(subjectId, chId || null, title);
                  }}
                  className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">General Subject Study</option>
                  {currentSubject.units.map((unit) => (
                    <optgroup key={unit.id} label={`${unit.title} (${unit.marksWeightage}M)`}>
                      {unit.chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
              Sessions are automatically saved into your offline IndexedDB database, sync to Supabase when connected, and count towards your daily streak.
            </div>

            <button
              onClick={() => setManualSessionModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs min-h-[44px]"
            >
              <Clock className="w-4 h-4" />
              <span>+ Log Study Counted on Normal Clock</span>
            </button>
          </div>

          {/* Quick Focus Stats */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Study Velocity
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase block font-mono">
                  Today Logged
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {Math.round(
                    studySessions
                      .filter((s) => s.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10))
                      .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
                  )}{' '}
                  mins
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase block font-mono">
                  Total Sessions
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {studySessions.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Focus Sessions Log Table */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Study Session History
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {studySessions.length} total logged sessions
            </span>
          </div>

          <button
            onClick={() => setManualSessionModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs min-h-[36px] shrink-0"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>+ Manual Entry (Normal Clock)</span>
          </button>
        </div>

        {studySessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Chapter / Topic</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {studySessions.slice(0, 8).map((s, idx) => {
                  const sub = subjects.find((sb) => sb.id === s.subjectId);
                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sub?.color || '#6366F1' }}
                        />
                        {sub?.name || s.subjectId}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {s.chapterTitle || 'Self Study'}
                      </td>
                      <td className="py-2.5 px-3 uppercase font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-muted">
                          {s.mode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                        {Math.round(s.durationSeconds / 60)} mins
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                        {new Date(s.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No study sessions logged yet. Hit &ldquo;Start Focus&rdquo; above to begin recording!
          </div>
        )}
      </div>
    </div>
  );
};
