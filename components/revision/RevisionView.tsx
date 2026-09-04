'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { isRevisionDue } from '@/lib/utils';
import { SubjectIcon } from '../ui/subject-icon';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RevisionViewProps {
  onNavigateTab: (tab: string) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ onNavigateTab }) => {
  const {
    subjects,
    chapterDataMap,
    markChapterRevised,
    setSelectedSubject,
    setSelectedChapter,
  } = useAppStore();

  const { bindChapter, start: startTimer } = useTimerStore();

  // Find all mastered chapters
  const allMastered: Array<{
    chapterId: string;
    title: string;
    subjectId: string;
    subjectName: string;
    subjectColor: string;
    unitTitle: string;
    intervalLevel: number;
    dueDate: string | null;
    lastStudiedAt: string | null;
    isDue: boolean;
  }> = [];

  for (const sub of subjects) {
    for (const unit of sub.units) {
      for (const ch of unit.chapters) {
        const uData = chapterDataMap[ch.id];
        if (uData?.status === 'mastered') {
          allMastered.push({
            chapterId: ch.id,
            title: ch.title,
            subjectId: sub.id,
            subjectName: sub.name,
            subjectColor: sub.color,
            unitTitle: unit.title,
            intervalLevel: uData.revisionIntervalLevel || 1,
            dueDate: uData.revisionDueDate,
            lastStudiedAt: uData.lastStudiedAt,
            isDue: isRevisionDue(uData.revisionDueDate),
          });
        }
      }
    }
  }

  const dueChapters = allMastered.filter((c) => c.isDue);
  const upcomingChapters = allMastered
    .filter((c) => !c.isDue)
    .sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    });

  const handleLaunchTimer = (item: (typeof allMastered)[0]) => {
    bindChapter(item.subjectId, item.chapterId, item.title);
    startTimer();
    onNavigateTab('timer');
  };

  const handleOpenNotes = (item: (typeof allMastered)[0]) => {
    setSelectedSubject(item.subjectId);
    setSelectedChapter(item.chapterId);
    onNavigateTab('tracker');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Explainer Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Ebbinghaus Spaced Repetition Engine
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Long-Term Board Exam Memory Retention
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            When you master a chapter, TrackIT automatically queues reviews at scientifically calibrated
            intervals: <strong>3 days</strong> → <strong>7 days</strong> → <strong>14 days</strong> →{' '}
            <strong>30 days</strong>. Completing scheduled revisions guarantees 95%+ recall on exam day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-2xl font-black font-mono text-amber-500">
              {dueChapters.length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Due Today
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-2xl font-black font-mono text-emerald-500">
              {allMastered.length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              In Spaced Loop
            </div>
          </div>
        </div>
      </div>

      {/* Due Today Queue */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Revisions Due for Immediate Review ({dueChapters.length})
          </h3>
        </div>

        {dueChapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueChapters.map((item) => (
              <motion.div
                layout
                key={item.chapterId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-surface border-2 border-amber-500/40 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.subjectColor }}
                      />
                      <span className="text-xs font-semibold text-foreground">
                        {item.subjectName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                      Interval {item.intervalLevel}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-foreground tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.unitTitle}</p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenNotes(item)}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Notes
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchTimer(item)}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      title="Timed Revision"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => markChapterRevised(item.chapterId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface border border-surface-border text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-foreground">All caught up!</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No revisions are overdue right now. As you master more chapters in the Syllabus Tracker,
              they will surface here when due.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Revisions Queue */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Upcoming Scheduled Revisions ({upcomingChapters.length})
          </h3>
        </div>

        {upcomingChapters.length > 0 ? (
          <div className="p-4 rounded-3xl bg-surface border border-surface-border shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Chapter</th>
                  <th className="py-2.5 px-3">Interval Stage</th>
                  <th className="py-2.5 px-3">Scheduled Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {upcomingChapters.map((item) => (
                  <tr key={item.chapterId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.subjectColor }}
                      />
                      {item.subjectName}
                    </td>
                    <td className="py-2.5 px-3 text-foreground font-medium">{item.title}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      Level {item.intervalLevel}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Pending'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => markChapterRevised(item.chapterId)}
                        className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-xs transition-colors"
                      >
                        Advance Interval
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No future spaced revisions scheduled. Mark chapters as &ldquo;Mastered&rdquo; in the syllabus tracker to populate this timeline.
          </div>
        )}
      </div>
    </div>
  );
};
