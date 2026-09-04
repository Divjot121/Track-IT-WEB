'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { Repository } from '@/lib/db/repository';
import { SyncEngine } from '@/lib/sync/syncEngine';
import { Clock, X, CheckCircle2, Calendar, Timer, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ManualSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({ isOpen, onClose }) => {
  const { subjects, refreshData } = useAppStore();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'maths-standard');
  const [chapterId, setChapterId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('stopwatch');
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const currentSubject = subjects.find((s) => s.id === subjectId) || subjects[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;

    let selectedChapterTitle = '';
    if (chapterId) {
      for (const u of currentSubject.units) {
        const found = u.chapters.find((c) => c.id === chapterId);
        if (found) {
          selectedChapterTitle = found.title;
          break;
        }
      }
    }

    const timestamp = new Date(`${dateStr}T${timeStr || '12:00'}:00`).toISOString();

    const sessionObj = {
      subjectId,
      chapterId: chapterId || undefined,
      chapterTitle: selectedChapterTitle || undefined,
      durationSeconds: durationMinutes * 60,
      mode,
      timestamp,
      notes: notes || undefined,
    };

    await Repository.addStudySession(sessionObj);
    SyncEngine.enqueue('study_session', sessionObj);
    await refreshData();

    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#6366F1', '#10B981'],
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-surface border border-surface-border rounded-3xl shadow-2xl p-6 z-10 glass-modal overflow-hidden select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Log Past Study Session</h3>
                <p className="text-[11px] text-muted-foreground">
                  Counted on a normal clock or physical watch
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSaved ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-foreground">Session Logged!</h4>
              <p className="text-xs text-muted-foreground">
                Added {durationMinutes} mins to your study streak and analytics.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Subject Studied
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId('');
                  }}
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Chapter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Chapter / Topic (Optional)
                </label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">General Subject Study / Problem Solving</option>
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

              {/* Duration & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[25, 45, 60, 90].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDurationMinutes(preset)}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                          durationMinutes === preset
                            ? 'bg-primary/10 border-primary text-primary font-bold'
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Study Type
                  </label>
                  <div className="flex bg-muted/40 p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setMode('stopwatch')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        mode === 'stopwatch'
                          ? 'bg-surface text-foreground font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Clock
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('pomodoro')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        mode === 'pomodoro'
                          ? 'bg-surface text-foreground font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Pomodoro
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Notes / Questions Solved (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Solved NCERT exercises 1.1 to 1.3"
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  Log Study Time
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
