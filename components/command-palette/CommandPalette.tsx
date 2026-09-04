'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { useTheme } from 'next-themes';
import {
  Search,
  BookOpen,
  Timer,
  Calendar,
  RotateCcw,
  BarChart3,
  FileSpreadsheet,
  Moon,
  Sun,
  X,
  ArrowRight,
} from 'lucide-react';
import { SubjectIcon } from '../ui/subject-icon';

interface CommandPaletteProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigateTab }) => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    subjects,
    setSelectedSubject,
    setSelectedChapter,
  } = useAppStore();

  const { bindChapter, start: startTimer } = useTimerStore();
  const { theme, setTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape, open on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Build items list
  const actions = [
    {
      id: 'action-timer',
      title: 'Open Study Timer (Pomodoro)',
      category: 'Actions',
      icon: Timer,
      action: () => {
        onNavigateTab('timer');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-planner',
      title: 'Open Weekly Timetable Planner',
      category: 'Actions',
      icon: Calendar,
      action: () => {
        onNavigateTab('planner');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-revision',
      title: 'Check Spaced Repetition Due Queue',
      category: 'Actions',
      icon: RotateCcw,
      action: () => {
        onNavigateTab('revision');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-analytics',
      title: 'View Study Analytics & Heatmap',
      category: 'Actions',
      icon: BarChart3,
      action: () => {
        onNavigateTab('analytics');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-mock',
      title: 'Open Mock Test Scores Log',
      category: 'Actions',
      icon: FileSpreadsheet,
      action: () => {
        onNavigateTab('mock-tests');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setCommandPaletteOpen(false);
      },
    },
  ];

  // Subject items
  const subjectItems = subjects.map((sub) => ({
    id: `subject-${sub.id}`,
    title: sub.name,
    subtitle: `Code ${sub.code} • ${sub.units.length} units`,
    category: 'Subjects',
    icon: () => <SubjectIcon name={sub.iconName} className="w-4 h-4" style={{ color: sub.color }} />,
    action: () => {
      setSelectedSubject(sub.id);
      onNavigateTab('tracker');
      setCommandPaletteOpen(false);
    },
  }));

  // Chapter items
  const chapterItems: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
  }> = [];

  for (const sub of subjects) {
    for (const unit of sub.units) {
      for (const ch of unit.chapters) {
        chapterItems.push({
          id: `ch-${ch.id}`,
          title: ch.title,
          subtitle: `${sub.name} • ${unit.title}`,
          category: 'Chapters',
          icon: BookOpen,
          action: () => {
            setSelectedSubject(sub.id);
            setSelectedChapter(ch.id);
            onNavigateTab('tracker');
            setCommandPaletteOpen(false);
          },
        });
      }
    }
  }

  // Filter items based on query
  const q = query.trim().toLowerCase();
  const filteredActions = q ? actions.filter((a) => a.title.toLowerCase().includes(q)) : actions;
  const filteredSubjects = q
    ? subjectItems.filter((s) => s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q))
    : subjectItems;
  const filteredChapters = q
    ? chapterItems.filter((c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q))
    : [];

  const combinedItems = [...filteredActions, ...filteredSubjects, ...filteredChapters].slice(0, 20);

  // Keyboard navigation through list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (combinedItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % (combinedItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = combinedItems[selectedIndex];
      if (current) current.action();
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCommandPaletteOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-surface elevated rounded-xl border border-surface-border shadow-2xl overflow-hidden z-10 glass-modal flex flex-col"
        >
          {/* Header Search Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-border/70">
            <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search subjects, chapters, or actions... (e.g. Triangles, Timer, Science)"
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted text-muted-foreground border border-border">
                ESC
              </kbd>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border/20">
            {combinedItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              combinedItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="truncate font-medium">{item.title}</div>
                        {'subtitle' in item && item.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-background border border-border mr-1">↑↓</kbd>
                navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-background border border-border mr-1">↵</kbd>
                select
              </span>
            </div>
            <span>Press Cmd+K anytime</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
