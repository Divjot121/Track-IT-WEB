'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import {
  calculateExamCountdown,
  calculateOverallReadiness,
  calculateSubjectReadiness,
  formatTime,
  formatHours,
} from '@/lib/utils';
import { ProgressRing } from '../ui/progress-ring';
import { SubjectIcon } from '../ui/subject-icon';
import {
  Flame,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubject,
    setSelectedChapter,
    chapterDataMap,
    settings,
    studySessions,
    timetableSlots,
    mockTests,
    setManualSessionModalOpen,
  } = useAppStore();

  const { bindChapter, start: startTimer } = useTimerStore();

  const countdown = calculateExamCountdown(settings.examDate || '2027-02-15');
  const overall = calculateOverallReadiness(subjects, chapterDataMap);

  // Today's day of week (0 = Sunday, 1 = Monday, etc.)
  const todayDay = new Date().getDay();
  const todaySlots = timetableSlots.filter((s) => s.dayOfWeek === todayDay);

  // Calculate streak
  const sessionDates = Array.from(
    new Set(studySessions.map((s) => s.timestamp.slice(0, 10)))
  ).sort().reverse();

  let currentStreak = 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (sessionDates.includes(todayStr) || sessionDates.includes(yesterdayStr)) {
    let checkDate = sessionDates.includes(todayStr) ? new Date() : yesterday;
    while (true) {
      const dateKey = checkDate.toISOString().slice(0, 10);
      if (sessionDates.includes(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Total study hours
  const totalStudySeconds = studySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalHours = Math.round((totalStudySeconds / 3600) * 10) / 10;

  // Weakest subject priority chapters
  const weakestSubject = overall.weakestSubject?.subject;
  const weakestChapters = weakestSubject
    ? weakestSubject.units
        .flatMap((u) => u.chapters.map((c) => ({ ...c, unitTitle: u.title, marks: u.marksWeightage })))
        .filter((c) => {
          const st = chapterDataMap[c.id]?.status || 'not-started';
          return st === 'not-started' || st === 'in-progress';
        })
        .slice(0, 3)
    : [];

  const handleStartChapterTimer = (subId: string, chId: string, chTitle: string) => {
    bindChapter(subId, chId, chTitle);
    startTimer();
    onNavigateTab('timer');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento 1: Exam Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Board Countdown</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight font-mono text-foreground">
                {countdown.days}
              </span>
              <span className="text-sm font-semibold text-muted-foreground uppercase">Days</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-2">
              <span>{countdown.hours}h {countdown.minutes}m remaining</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Single Annual Exam</span>
            <span className="font-mono text-primary font-semibold">Feb 15, 2027</span>
          </div>
        </motion.div>

        {/* Bento 2: Overall Weighted Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Readiness Score</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2 flex items-center gap-4">
            <ProgressRing
              percentage={overall.overallPercentage}
              size={68}
              strokeWidth={7}
              color="#10B981"
            >
              <span className="text-xs font-bold font-mono text-foreground">
                {overall.overallPercentage}%
              </span>
            </ProgressRing>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {overall.overallPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">
                Target: <span className="font-mono font-medium text-foreground">{settings.targetPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{overall.masteredChapters} of {overall.totalChapters} Mastered</span>
            <button
              onClick={() => onNavigateTab('tracker')}
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Tracker <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Bento 3: Streak Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Study Streak</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500/20" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight font-mono text-amber-500 flex items-center gap-1">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-muted-foreground uppercase">Days</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentStreak > 0 ? 'Consistency is key for 95%+' : 'Start a session to ignite streak!'}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Total Study: {totalHours} hrs</span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Heatmap <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Bento 4: Mock Test Benchmark */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Mock Average</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            {mockTests.length > 0 ? (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight font-mono text-foreground">
                    {Math.round(
                      (mockTests.reduce((acc, m) => acc + (m.marksScored / m.maxMarks) * 100, 0) /
                        mockTests.length)
                    )}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {mockTests.length} practice papers logged
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-mono text-foreground">--</div>
                <div className="text-xs text-muted-foreground mt-1">
                  No sample papers logged yet
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Pre-board calibration</span>
            <button
              onClick={() => onNavigateTab('mock-tests')}
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Log Score <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Row: Subject Progress Overview & Weakest Subject Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enrolled Subjects Readiness Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-surface-border shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Subject Preparation Readiness
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weighted by CBSE board marks weightage per unit
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('tracker')}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Open Workbench <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {subjects.map((sub) => {
              const res = calculateSubjectReadiness(sub, chapterDataMap);
              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    onNavigateTab('tracker');
                  }}
                  className="p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                      >
                        <SubjectIcon name={sub.iconName} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {res.masteredCount}/{res.totalChapters} Chapters • {sub.totalMarks} Marks
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-foreground">
                      {res.readinessPercentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${res.readinessPercentage}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{res.marksCovered} of {sub.totalMarks} Marks Ready</span>
                    <span>{res.inProgressCount} in progress</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right 1 Col: Weakest Subject & High Yield Topics Alert */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-semibold text-xs mb-1">
              <AlertCircle className="w-4 h-4" />
              High Yield Syllabus Callout
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              {weakestSubject ? weakestSubject.name : 'Focus Recommended'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              This subject has the lowest readiness score. Prioritizing these chapters will boost your
              overall percentage fastest.
            </p>

            <div className="mt-4 space-y-2.5">
              {weakestChapters.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {ch.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {ch.unitTitle} ({ch.marks}M)
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleStartChapterTimer(weakestSubject!.id, ch.id, ch.title)
                    }
                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
                    title="Start Pomodoro Focus"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/60">
            <button
              onClick={() => {
                if (weakestSubject) setSelectedSubject(weakestSubject.id);
                onNavigateTab('tracker');
              }}
              className="w-full py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              Focus on {weakestSubject ? weakestSubject.name : 'Weakest Subject'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Today's Timetable Plan & Quick Study Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Today&apos;s Study Schedule
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Full Timetable <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySlots.length > 0 ? (
            <div className="space-y-2.5">
              {todaySlots.map((slot) => {
                const sub = subjects.find((s) => s.id === slot.subjectId);
                return (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub?.color || '#6366F1' }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {sub?.name || 'Study Block'}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {slot.timeSlot} {slot.notes ? `• ${slot.notes}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        bindChapter(slot.subjectId, null, sub?.name || 'Study Block');
                        startTimer();
                        onNavigateTab('timer');
                      }}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" /> Start
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <p>No study slots scheduled for today.</p>
              <button
                onClick={() => onNavigateTab('planner')}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                Plan Today&apos;s Schedule
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Study History */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Recent Study Focus Sessions
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setManualSessionModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors flex items-center gap-1 min-h-[32px]"
                title="Log study session timed on a normal clock or watch"
              >
                <Clock className="w-3 h-3" />
                <span>+ Log Past Study</span>
              </button>
              <button
                onClick={() => onNavigateTab('timer')}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 min-h-[32px]"
              >
                Open Timer <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {studySessions.length > 0 ? (
            <div className="space-y-2">
              {studySessions.slice(0, 4).map((s, idx) => {
                const sub = subjects.find((sb) => sb.id === s.subjectId);
                const timeAgo = new Date(s.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sub?.color || '#6366F1' }}
                      />
                      <div className="truncate">
                        <span className="font-semibold text-foreground">
                          {s.chapterTitle || sub?.name || 'Self Study'}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                          {timeAgo}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground shrink-0 ml-2">
                      {Math.round(s.durationSeconds / 60)} mins
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <p>No study sessions recorded yet.</p>
              <button
                onClick={() => onNavigateTab('timer')}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Launch First Pomodoro Session
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
