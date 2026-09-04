'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { TimetableSlot } from '@/lib/types';
import { SubjectIcon } from '../ui/subject-icon';
import {
  CalendarDays,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

interface PlannerViewProps {
  onNavigateTab: (tab: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onNavigateTab }) => {
  const {
    subjects,
    timetableSlots,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
  } = useAppStore();

  const { bindChapter, start: startTimer } = useTimerStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [mobileActiveDay, setMobileActiveDay] = useState(new Date().getDay());
  const [timeSlot, setTimeSlot] = useState('17:00 - 18:30');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'maths-standard');
  const [notes, setNotes] = useState('');
  const [draggedSubjectId, setDraggedSubjectId] = useState<string | null>(null);

  const handleQuickAddSubjectToDay = async (subId: string, dayId: number) => {
    const sub = subjects.find((s) => s.id === subId);
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: dayId,
      timeSlot: '18:00 - 19:30',
      subjectId: subId,
      notes: `Targeted ${sub?.name || ''} study`,
      completed: false,
    };
    await addTimetableSlot(newSlot);
  };

  const handleCreateSlot = async () => {
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: selectedDay,
      timeSlot,
      subjectId,
      notes,
      completed: false,
    };
    await addTimetableSlot(newSlot);
    setIsAddModalOpen(false);
    setNotes('');
  };

  const handleToggleComplete = async (slot: TimetableSlot) => {
    await updateTimetableSlot({
      ...slot,
      completed: !slot.completed,
    });
  };

  const handleDropOnDay = async (dayId: number) => {
    if (!draggedSubjectId) return;
    const sub = subjects.find((s) => s.id === draggedSubjectId);
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: dayId,
      timeSlot: '18:00 - 19:30',
      subjectId: draggedSubjectId,
      notes: `Targeted ${sub?.name || ''} study`,
      completed: false,
    };
    await addTimetableSlot(newSlot);
    setDraggedSubjectId(null);
  };

  const handleSmartAutoSchedule = async () => {
    // Generates a balanced 14-slot weekly timetable prioritizing Maths and Science
    const scheduleTemplate = [
      { day: 1, slot: '17:00 - 18:30', sub: 'maths-standard', note: 'Algebra & Equations' },
      { day: 1, slot: '19:00 - 20:30', sub: 'science', note: 'Chemical Reactions' },
      { day: 2, slot: '17:00 - 18:30', sub: 'social-science', note: 'History / Nationalism' },
      { day: 2, slot: '19:00 - 20:30', sub: 'english', note: 'First Flight Prose' },
      { day: 3, slot: '17:00 - 18:30', sub: 'maths-standard', note: 'Geometry Theorems' },
      { day: 3, slot: '19:00 - 20:30', sub: 'science', note: 'Life Processes Biology' },
      { day: 4, slot: '17:00 - 18:30', sub: 'social-science', note: 'Geography Resources' },
      { day: 4, slot: '19:00 - 20:30', sub: 'maths-standard', note: 'Trigonometry Applications' },
      { day: 5, slot: '17:00 - 18:30', sub: 'science', note: 'Electricity Numericals' },
      { day: 5, slot: '19:00 - 20:30', sub: 'english', note: 'Poetry & Grammar' },
      { day: 6, slot: '10:00 - 12:30', sub: 'maths-standard', note: 'Weekly Sample Paper' },
      { day: 6, slot: '16:00 - 18:00', sub: 'social-science', note: 'Economics & Map Work' },
      { day: 0, slot: '10:00 - 12:30', sub: 'science', note: 'Science Full Mock Paper' },
      { day: 0, slot: '17:00 - 19:00', sub: 'hindi', note: 'Hindi Writing & Revision' },
    ];

    for (const item of scheduleTemplate) {
      await addTimetableSlot({
        id: `auto-${item.day}-${item.sub}-${Date.now()}`,
        dayOfWeek: item.day,
        timeSlot: item.slot,
        subjectId: item.sub,
        notes: item.note,
        completed: false,
      });
    }
  };

  const handleLaunchTimer = (slot: TimetableSlot) => {
    const sub = subjects.find((s) => s.id === slot.subjectId);
    bindChapter(slot.subjectId, slot.chapterId || null, sub?.name || 'Scheduled Study');
    startTimer();
    onNavigateTab('timer');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-surface-border shadow-xs">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Weekly Board Preparation Timetable
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag subjects onto any day column or click &ldquo;+ Add Slot&rdquo; to structure your daily focus blocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSmartAutoSchedule}
            className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Auto-fill recommended weekly study blocks"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Smart Preset
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Study Slot
          </button>
        </div>
      </div>

      {/* Draggable & Tap-to-Assign Subjects Palette Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-surface border border-surface-border shadow-xs flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 overflow-x-auto">
        <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground shrink-0 uppercase tracking-wider">
          <span className="md:hidden">Tap subject to add to selected day:</span>
          <span className="hidden md:inline">Drag to assign:</span>
        </span>
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              draggable
              onDragStart={() => setDraggedSubjectId(sub.id)}
              onDragEnd={() => setDraggedSubjectId(null)}
              onClick={() => handleQuickAddSubjectToDay(sub.id, mobileActiveDay)}
              className="px-3 py-2 sm:py-1.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted cursor-grab active:cursor-grabbing text-xs font-medium flex items-center gap-2 transition-transform active:scale-95 select-none min-h-[40px] sm:min-h-0 shrink-0"
              title={`Add ${sub.name}`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: sub.color }}
              />
              <span className="whitespace-nowrap">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Day Selector Tabs (Shown on <md) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {DAYS.map((day) => {
          const isSelected = mobileActiveDay === day.id;
          const isToday = new Date().getDay() === day.id;
          const count = timetableSlots.filter((s) => s.dayOfWeek === day.id).length;
          return (
            <button
              key={day.id}
              onClick={() => setMobileActiveDay(day.id)}
              className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 transition-all min-h-[44px] ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-[10px] uppercase font-mono">{day.short}</span>
              <span className="text-xs font-bold">
                {count > 0 ? count : '•'}
              </span>
              {isToday && (
                <span className="w-1 h-1 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Single Day View (<md) */}
      <div className="md:hidden">
        {DAYS.filter((d) => d.id === mobileActiveDay).map((day) => {
          const daySlots = timetableSlots.filter((s) => s.dayOfWeek === day.id);
          const isToday = new Date().getDay() === day.id;

          return (
            <div
              key={day.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col min-h-[380px] ${
                isToday
                  ? 'bg-primary/5 border-primary/40 shadow-xs'
                  : 'bg-surface border-surface-border'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{day.name}</span>
                  {isToday && (
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                      Today
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    ({daySlots.length} {daySlots.length === 1 ? 'block' : 'blocks'})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(day.id);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </button>
              </div>

              {/* Day Slots */}
              <div className="space-y-2.5">
                {daySlots.length > 0 ? (
                  daySlots.map((slot) => {
                    const sub = subjects.find((s) => s.id === slot.subjectId);
                    return (
                      <motion.div
                        layout
                        key={slot.id}
                        className={`p-3.5 rounded-xl border text-xs transition-all relative ${
                          slot.completed
                            ? 'bg-muted/40 border-border/40 opacity-70'
                            : 'bg-surface border-border shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: sub?.color || '#6366F1' }}
                            />
                            <span
                              className={`font-bold text-sm truncate ${
                                slot.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {sub?.name || 'Study'}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteTimetableSlot(slot.id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-muted"
                            title="Remove slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs text-muted-foreground font-mono mb-1.5">
                          {slot.timeSlot}
                        </div>

                        {slot.notes && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {slot.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                          <button
                            onClick={() => handleToggleComplete(slot)}
                            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                              slot.completed
                                ? 'text-emerald-500 bg-emerald-500/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{slot.completed ? 'Completed' : 'Mark Done'}</span>
                          </button>

                          <button
                            onClick={() => handleLaunchTimer(slot)}
                            className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 text-xs font-semibold min-h-[36px]"
                            title="Start Timer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start Focus</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl text-center p-4 text-xs text-muted-foreground/60 space-y-3">
                    <span>No study blocks scheduled for this day</span>
                    <button
                      onClick={() => {
                        setSelectedDay(day.id);
                        setIsAddModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 min-h-[40px] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Weekly Columns Grid (Hidden on <md, visible on md and lg) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const daySlots = timetableSlots.filter((s) => s.dayOfWeek === day.id);
          const isToday = new Date().getDay() === day.id;

          return (
            <div
              key={day.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOnDay(day.id)}
              className={`p-3 rounded-2xl border transition-all flex flex-col min-h-[420px] ${
                isToday
                  ? 'bg-primary/5 border-primary/40 shadow-xs'
                  : 'bg-surface border-surface-border'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{day.name}</span>
                  {isToday && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-semibold">
                      Today
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(day.id);
                    setIsAddModalOpen(true);
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Add slot for this day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Slots */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {daySlots.length > 0 ? (
                  daySlots.map((slot) => {
                    const sub = subjects.find((s) => s.id === slot.subjectId);
                    return (
                      <motion.div
                        layout
                        key={slot.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all relative group ${
                          slot.completed
                            ? 'bg-muted/40 border-border/40 opacity-70'
                            : 'bg-surface border-border hover:border-primary/40 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: sub?.color || '#6366F1' }}
                            />
                            <span
                              className={`font-semibold truncate ${
                                slot.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {sub?.name || 'Study'}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteTimetableSlot(slot.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-rose-500 transition-opacity"
                            title="Remove slot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-[10px] text-muted-foreground font-mono mb-1.5">
                          {slot.timeSlot}
                        </div>

                        {slot.notes && (
                          <div className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                            {slot.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <button
                            onClick={() => handleToggleComplete(slot)}
                            className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
                              slot.completed ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{slot.completed ? 'Done' : 'Mark Done'}</span>
                          </button>

                          <button
                            onClick={() => handleLaunchTimer(slot)}
                            className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Start Timer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-36 flex items-center justify-center border border-dashed border-border/60 rounded-xl text-center p-2 text-[11px] text-muted-foreground/60 select-none">
                    Drop subject here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-bold text-sm text-foreground">Schedule Study Block</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Day of Week
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs"
                  >
                    {DAYS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Time Slot (e.g. 17:00 - 18:30)
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="17:00 - 18:30"
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Focus Notes / Target Chapters
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. NCERT Exemplar questions"
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSlot}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Save Study Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
