'use client';

import React from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  BookOpenCheck,
  Timer,
  CalendarDays,
  RotateCcw,
  BarChart2,
  FileCheck2,
  Printer,
  Moon,
  Sun,
  Keyboard,
  Settings2,
  Play,
  Pause,
  ChevronRight,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { SubjectIcon } from '../ui/subject-icon';
import { calculateSubjectReadiness, formatTime, isRevisionDue } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenShortcuts: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenShortcuts,
}) => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubject,
    chapterDataMap,
    setOnboardingOpen,
    settings,
  } = useAppStore();

  const { status: timerStatus, timeLeft, elapsed, mode: timerMode, start, pause } = useTimerStore();
  const { theme, setTheme } = useTheme();

  // Calculate count of chapters due for revision
  const dueRevisionCount = Object.values(chapterDataMap).filter(
    (c) => c.status === 'mastered' && isRevisionDue(c.revisionDueDate)
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'D' },
    { id: 'tracker', label: 'Syllabus Tracker', icon: BookOpenCheck, shortcut: 'S' },
    { id: 'timer', label: 'Study Timer', icon: Timer, shortcut: 'T' },
    { id: 'planner', label: 'Study Timetable', icon: CalendarDays, shortcut: 'P' },
    {
      id: 'revision',
      label: 'Spaced Revision',
      icon: RotateCcw,
      shortcut: 'R',
      badge: dueRevisionCount > 0 ? dueRevisionCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, shortcut: 'A' },
    { id: 'mock-tests', label: 'Mock Tests Log', icon: FileCheck2, shortcut: 'M' },
    { id: 'report', label: 'Printable Report', icon: Printer },
  ];

  // Filter subjects based on user settings
  const activeSubjects = subjects.filter((s) =>
    settings.selectedSubjectIds ? settings.selectedSubjectIds.includes(s.id) : true
  );

  return (
    <aside className="hidden lg:flex w-64 h-screen border-r border-border bg-surface flex-col shrink-0 select-none overflow-hidden print-hide">
      {/* Brand Header */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground">TrackIT</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                Web
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <span>CBSE Class 10</span>
              <span>•</span>
              <span>2026-27</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setOnboardingOpen(true)}
          title="Board Setup & Goals"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1.5">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-foreground' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full font-bold ${
                          item.badgeColor || 'bg-primary/20 text-primary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && !isActive && (
                      <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground/70 border border-border">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Subjects Quick Jump */}
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
            <span>Enrolled Subjects</span>
            <span className="text-[10px] font-mono text-muted-foreground">{activeSubjects.length}</span>
          </div>
          <div className="space-y-0.5">
            {activeSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id && activeTab === 'tracker';
              const readiness = calculateSubjectReadiness(sub, chapterDataMap);
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    onSelectTab('tracker');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="truncate">{sub.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground shrink-0">
                    {readiness.readinessPercentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mini Timer Dock (if timer active or paused) */}
      {timerStatus !== 'idle' && (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between text-xs font-semibold text-primary mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {timerMode === 'pomodoro' ? 'Pomodoro Focus' : 'Stopwatch'}
            </span>
            <span className="font-mono text-sm">
              {formatTime(timerMode === 'pomodoro' ? timeLeft : elapsed)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onSelectTab('timer')}
              className="flex-1 py-1 text-[11px] font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
            >
              Open Timer <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={timerStatus === 'running' ? pause : start}
              className="p-1.5 rounded-md bg-surface border border-border text-foreground hover:bg-muted transition-colors"
            >
              {timerStatus === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}

      {/* Footer Utilities */}
      <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme (smooth crossfade)"
            className="p-1.5 rounded-md hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="p-1.5 rounded-md hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => useSyncStore.getState().setAuthModalOpen(true)}
            title="Cloud Sync & Account"
            className="p-1.5 rounded-md hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Cloud className="w-4 h-4 text-primary" />
          </button>
        </div>

        <button
          onClick={() => useSyncStore.getState().setAuthModalOpen(true)}
          className="text-[10px] font-mono text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          {useSyncStore.getState().user ? 'Cloud Synced' : 'Offline DB'}
        </button>
      </div>
    </aside>
  );
};
