'use client';

import React from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';
import { calculateExamCountdown, calculateOverallReadiness } from '@/lib/utils';
import {
  Search,
  Calendar,
  Flame,
  Printer,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import { SyncStatusIndicator } from '../sync/SyncStatusIndicator';

interface TopBarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenExportModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onNavigateTab,
  onOpenExportModal,
}) => {
  const {
    subjects,
    chapterDataMap,
    settings,
    setCommandPaletteOpen,
  } = useAppStore();

  const countdown = calculateExamCountdown(settings.examDate || '2027-02-15');
  const readiness = calculateOverallReadiness(subjects, chapterDataMap);

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'CBSE 2026-27 Board Preparation Overview' },
    tracker: { title: 'Syllabus Tracker', subtitle: 'Split-view chapter workbench with weighted mark coverage' },
    timer: { title: 'Study Focus Timer', subtitle: 'Dual-mode Pomodoro and continuous Stopwatch' },
    planner: { title: 'Study Timetable', subtitle: 'Weekly schedule & balanced subject workload' },
    revision: { title: 'Spaced Revision Hub', subtitle: 'Automated 3-7-14-30 day review intervals' },
    analytics: { title: 'Analytics & Heatmap', subtitle: 'Study velocity, subject distribution & unit breakdown' },
    'mock-tests': { title: 'Mock Test Log', subtitle: 'Sample papers & pre-board performance tracking' },
    report: { title: 'Printable Study Summary', subtitle: 'Official CBSE board prep status report' },
  };

  const currentMeta = titleMap[activeTab] || { title: 'TrackIT Web', subtitle: 'Preparation Hub' };

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 print-hide pt-[env(safe-area-inset-top)]">
      {/* Title & Subtitle + Mobile Logo */}
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-xs">
            T
          </div>
        </div>

        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-muted-foreground hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Header Badges and Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search / Command Palette Button (44px touch target on mobile) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          title="Search / Command Palette"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-w-0 sm:min-h-0 sm:px-3 sm:py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium border border-border/60 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline ml-2">Quick Jump</span>
          <kbd className="hidden md:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Board Exam Countdown Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-foreground">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-primary font-mono">{countdown.days}d</span>
          <span className="text-muted-foreground hidden xl:inline">to Board Exam</span>
        </div>

        {/* Readiness Score Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-mono">{readiness.overallPercentage}%</span>
          <span className="hidden xl:inline text-muted-foreground font-normal">Ready</span>
        </div>

        {/* Supabase Sync Status Indicator */}
        <SyncStatusIndicator />

        {/* Backup / Export Button */}
        <button
          onClick={onOpenExportModal}
          title="Backup / Export Data (JSON & PDF)"
          className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
