'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { useTheme } from 'next-themes';
import { formatTime, isRevisionDue } from '@/lib/utils';
import {
  Timer,
  RotateCcw,
  FileCheck2,
  Printer,
  Moon,
  Sun,
  Settings2,
  Cloud,
  Download,
  Clock,
  X,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onOpenManualSession: () => void;
  onOpenExportModal: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenManualSession,
  onOpenExportModal,
}) => {
  const { status: timerStatus, timeLeft, elapsed, mode: timerMode, start, pause } = useTimerStore();
  const { chapterDataMap, setOnboardingOpen } = useAppStore();
  const { user, setAuthModalOpen } = useSyncStore();
  const { theme, setTheme } = useTheme();

  const dueRevisionCount = Object.values(chapterDataMap).filter(
    (c) => c.status === 'mastered' && isRevisionDue(c.revisionDueDate)
  ).length;

  if (!isOpen) return null;

  const handleNavigate = (tab: string) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Slide-Up Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-h-[85vh] overflow-y-auto bg-surface border-t border-border rounded-t-3xl shadow-2xl p-6 pb-12 z-10 glass-modal space-y-6"
        >
          {/* Grab Handle */}
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto -mt-2 mb-4" />

          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <h3 className="text-sm font-bold text-foreground">Preparation Tools & Utilities</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Timer Mini Card (if running) */}
          {timerStatus !== 'idle' && (
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-primary font-bold block">
                  Active Study Timer
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {formatTime(timerMode === 'pomodoro' ? timeLeft : elapsed)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={timerStatus === 'running' ? pause : start}
                  className="p-2 rounded-xl bg-surface border border-border text-foreground"
                >
                  {timerStatus === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleNavigate('timer')}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                >
                  View Dial
                </button>
              </div>
            </div>
          )}

          {/* Tool Navigation Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleNavigate('timer')}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/60 text-left space-y-1 transition-colors min-h-[44px]"
            >
              <Timer className="w-5 h-5 text-primary" />
              <div className="text-xs font-bold text-foreground">Study Timer</div>
              <div className="text-[10px] text-muted-foreground">Pomodoro & Stopwatch</div>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenManualSession();
              }}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/60 text-left space-y-1 transition-colors min-h-[44px]"
            >
              <Clock className="w-5 h-5 text-emerald-500" />
              <div className="text-xs font-bold text-foreground">+ Log Past Study</div>
              <div className="text-[10px] text-muted-foreground">Normal clock session</div>
            </button>

            <button
              onClick={() => handleNavigate('revision')}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/60 text-left space-y-1 transition-colors min-h-[44px] relative"
            >
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <div className="text-xs font-bold text-foreground">Spaced Revision</div>
              <div className="text-[10px] text-muted-foreground">
                {dueRevisionCount > 0 ? `${dueRevisionCount} due today` : 'Retention loop'}
              </div>
              {dueRevisionCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => handleNavigate('mock-tests')}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/60 text-left space-y-1 transition-colors min-h-[44px]"
            >
              <FileCheck2 className="w-5 h-5 text-indigo-500" />
              <div className="text-xs font-bold text-foreground">Mock Tests Log</div>
              <div className="text-[10px] text-muted-foreground">Sample paper scores</div>
            </button>

            <button
              onClick={() => handleNavigate('report')}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/60 text-left space-y-1 transition-colors min-h-[44px]"
            >
              <Printer className="w-5 h-5 text-blue-500" />
              <div className="text-xs font-bold text-foreground">Printable Report</div>
              <div className="text-[10px] text-muted-foreground">Official study record</div>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenExportModal();
              }}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/60 text-left space-y-1 transition-colors min-h-[44px]"
            >
              <Download className="w-5 h-5 text-purple-500" />
              <div className="text-xs font-bold text-foreground">Backup & Export</div>
              <div className="text-[10px] text-muted-foreground">JSON data export</div>
            </button>
          </div>

          {/* Account & Settings Row */}
          <div className="pt-2 border-t border-border/70 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-medium text-foreground py-2 px-3 rounded-xl bg-muted/30 border border-border min-h-[44px]"
            >
              <Cloud className="w-4 h-4 text-primary" />
              <span>{user ? user.email : 'Sign in to Sync'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  setOnboardingOpen(true);
                }}
                className="p-2.5 rounded-xl bg-muted/30 border border-border text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Board Goal Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl bg-muted/30 border border-border text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
