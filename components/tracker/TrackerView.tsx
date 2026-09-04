'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { ChapterStatus, Chapter, Unit } from '@/lib/types';
import { calculateSubjectReadiness, formatTime } from '@/lib/utils';
import { StatusBadge, STATUS_CONFIG } from '../ui/status-badge';
import { SubjectIcon } from '../ui/subject-icon';
import {
  Search,
  Filter,
  Plus,
  Play,
  Star,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Bold,
  Italic,
  List,
  Code,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

interface TrackerViewProps {
  onNavigateTab: (tab: string) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({ onNavigateTab }) => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubject,
    selectedChapterId,
    setSelectedChapter,
    chapterDataMap,
    updateChapterStatus,
    updateChapterNotes,
    updateChapterConfidence,
    markChapterRevised,
  } = useAppStore();

  const { bindChapter, start: startTimer } = useTimerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ChapterStatus>('all');
  const [activeNotesTab, setActiveNotesTab] = useState<'edit' | 'preview'>('edit');
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [selectedUnitForNewChapter, setSelectedUnitForNewChapter] = useState('');
  const [savedNotesToast, setSavedNotesToast] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Active Subject
  const currentSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Find active chapter
  let activeChapter: Chapter | null = null;
  let activeUnit: Unit | null = null;

  for (const u of currentSubject.units) {
    const ch = u.chapters.find((c) => c.id === selectedChapterId);
    if (ch) {
      activeChapter = ch;
      activeUnit = u;
      break;
    }
  }

  // Fallback to first chapter if active chapter not found in this subject
  useEffect(() => {
    if (!activeChapter && currentSubject.units[0]?.chapters[0]) {
      setSelectedChapter(currentSubject.units[0].chapters[0].id);
    }
  }, [activeChapter, currentSubject, setSelectedChapter]);

  // Keyboard shortcut listener for 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea or input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (!activeChapter) return;

      if (e.key === '1') {
        e.preventDefault();
        updateChapterStatus(activeChapter.id, 'not-started');
      } else if (e.key === '2') {
        e.preventDefault();
        updateChapterStatus(activeChapter.id, 'in-progress');
      } else if (e.key === '3') {
        e.preventDefault();
        updateChapterStatus(activeChapter.id, 'revision');
      } else if (e.key === '4') {
        e.preventDefault();
        updateChapterStatus(activeChapter.id, 'mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeChapter, updateChapterStatus]);

  const activeChapterData = activeChapter ? chapterDataMap[activeChapter.id] : null;
  const currentStatus: ChapterStatus = activeChapterData?.status || 'not-started';
  const confidence = activeChapterData?.confidence || 0;
  const notes = activeChapterData?.notes || '';

  const readiness = calculateSubjectReadiness(currentSubject, chapterDataMap);

  const handleNotesChange = (val: string) => {
    if (!activeChapter) return;
    updateChapterNotes(activeChapter.id, val);
    setSavedNotesToast(true);
    setTimeout(() => setSavedNotesToast(false), 1500);
  };

  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    if (!activeChapter) return;
    const currentNotes = notes;
    const updated = currentNotes + `\n${prefix}sample text${suffix}\n`;
    handleNotesChange(updated);
  };

  const handleLaunchTimer = () => {
    if (!activeChapter) return;
    bindChapter(currentSubject.id, activeChapter.id, activeChapter.title);
    startTimer();
    onNavigateTab('timer');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Subject Switcher Tabs Bar */}
      <div className="px-6 py-2.5 border-b border-border bg-surface/50 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          {subjects.map((sub) => {
            const isSelected = sub.id === currentSubject.id;
            const subRes = calculateSubjectReadiness(sub, chapterDataMap);
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub.id);
                  setMobileView('list');
                }}
                className={`flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 min-h-[44px] sm:min-h-0 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <SubjectIcon name={sub.iconName} className="w-3.5 h-3.5" />
                <span>{sub.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {subRes.readinessPercentage}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Marks & Stats Quick Summary */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0">
          <span>
            Coverage:{' '}
            <strong className="text-foreground">{readiness.marksCovered}</strong> /{' '}
            {currentSubject.totalMarks} Marks
          </span>
          <span>•</span>
          <span>
            Mastered:{' '}
            <strong className="text-emerald-500">{readiness.masteredCount}</strong> /{' '}
            {readiness.totalChapters}
          </span>
        </div>
      </div>

      {/* Split View Content Workbench */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Unit & Chapter Tree */}
        <div
          className={`border-r border-border bg-surface flex flex-col shrink-0 overflow-hidden ${
            mobileView === 'detail' ? 'hidden md:flex md:w-80 lg:w-96' : 'w-full md:w-80 lg:w-96'
          }`}
        >
          {/* Filter & Search Header */}
          <div className="p-3 border-b border-border/80 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter chapters in this subject..."
                className="w-full bg-muted/40 border border-border text-foreground text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] no-scrollbar">
              {(['all', 'not-started', 'in-progress', 'revision', 'mastered'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    statusFilter === filter
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {filter === 'all' ? 'All' : STATUS_CONFIG[filter].label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit / Chapter Accordion Tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {currentSubject.units.map((unit) => {
              // Filter chapters
              const filteredChapters = unit.chapters.filter((ch) => {
                const uData = chapterDataMap[ch.id];
                const status = uData?.status || 'not-started';
                const matchesFilter = statusFilter === 'all' || status === statusFilter;
                const matchesSearch =
                  !searchQuery ||
                  ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  unit.title.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesFilter && matchesSearch;
              });

              if (filteredChapters.length === 0 && (searchQuery || statusFilter !== 'all')) {
                return null;
              }

              return (
                <div key={unit.id} className="space-y-1">
                  {/* Unit Title Header */}
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground">
                    <span className="truncate pr-2">{unit.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                      {unit.marksWeightage} Marks
                    </span>
                  </div>

                  {/* Chapter List */}
                  <div className="space-y-1">
                    {filteredChapters.map((ch) => {
                      const isSelected = ch.id === selectedChapterId;
                      const uData = chapterDataMap[ch.id];
                      const chStatus: ChapterStatus = uData?.status || 'not-started';
                      const config = STATUS_CONFIG[chStatus];
                      const Icon = config.icon;

                      return (
                        <div
                          key={ch.id}
                          onClick={() => {
                            setSelectedChapter(ch.id);
                            setMobileView('detail');
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary/40 text-foreground font-semibold shadow-2xs'
                              : 'bg-surface hover:bg-muted/40 border-border/50 text-foreground/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${config.dotClass}`}
                            />
                            <span className="truncate">{ch.title}</span>
                            {ch.isStub && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                                Stub
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass}`}
                            >
                              {config.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Chapter Detail Workbench */}
        <div
          className={`overflow-y-auto bg-surface-muted/30 p-4 sm:p-6 lg:p-8 ${
            mobileView === 'list' ? 'hidden md:block flex-1' : 'w-full md:flex-1'
          }`}
        >
          {activeChapter && activeUnit ? (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {/* Mobile Back Button */}
              <div className="md:hidden flex items-center justify-between pb-1">
                <button
                  onClick={() => setMobileView('list')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-semibold shadow-xs hover:bg-muted/60 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4 text-primary" />
                  <span>← Back to Chapters</span>
                </button>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {currentSubject.name}
                </span>
              </div>

              {/* Header Card */}
              <motion.div
                key={activeChapter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-6 rounded-2xl bg-surface border border-surface-border shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <span>{currentSubject.name}</span>
                      <span>›</span>
                      <span>{activeUnit.title}</span>
                      <span>•</span>
                      <span className="font-mono text-primary font-semibold">
                        {activeUnit.marksWeightage} Marks Unit
                      </span>
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
                      {activeChapter.title}
                    </h2>
                  </div>

                  <button
                    onClick={handleLaunchTimer}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-xs shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Focus Session</span>
                  </button>
                </div>

                {/* Status Selector Bar (Interactive 4-state buttons) */}
                <div className="pt-2 border-t border-border/60">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Preparation Status</span>
                    <span className="text-[10px] font-mono lowercase">
                      Keyboard shortcuts: [1] [2] [3] [4]
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['not-started', 'in-progress', 'revision', 'mastered'] as const).map(
                      (st) => {
                        const cfg = STATUS_CONFIG[st];
                        const isCurrent = currentStatus === st;
                        const Icon = cfg.icon;

                        return (
                          <button
                            key={st}
                            onClick={() => updateChapterStatus(activeChapter!.id, st)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              isCurrent
                                ? `${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} ring-2 ring-primary/20 shadow-xs scale-[1.02]`
                                : 'bg-surface hover:bg-muted/40 border-border text-muted-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{cfg.label}</span>
                            </div>
                            <kbd className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border">
                              {cfg.keyNum}
                            </kbd>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Confidence & Spaced Repetition Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/60">
                  {/* Confidence Rating */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Understanding Confidence
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateChapterConfidence(activeChapter!.id, star)}
                          className={`p-1 rounded-md transition-colors ${
                            star <= confidence
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-muted-foreground/30 hover:text-muted-foreground'
                          }`}
                          title={`Confidence: ${star}/5`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-mono text-muted-foreground ml-2">
                        {confidence}/5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Spaced Repetition Status */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Spaced Revision Status
                    </label>
                    {currentStatus === 'mastered' ? (
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Interval Level {activeChapterData?.revisionIntervalLevel || 1}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Due:{' '}
                            {activeChapterData?.revisionDueDate
                              ? new Date(activeChapterData.revisionDueDate).toLocaleDateString()
                              : 'Scheduled'}
                          </div>
                        </div>
                        <button
                          onClick={() => markChapterRevised(activeChapter!.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                        >
                          Mark Revised
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Marks as &ldquo;Mastered&rdquo; to begin automated 3-7-14-30 day spaced repetition reminders.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Per-Chapter Markdown Notes Workspace */}
              <div className="p-6 rounded-2xl bg-surface border border-surface-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground tracking-tight">
                      Chapter Study Notes & Key Formulas
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {savedNotesToast && (
                      <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}

                    {/* Format tools */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
                      <button
                        onClick={() => handleInsertMarkdown('**', '**')}
                        title="Bold"
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleInsertMarkdown('*', '*')}
                        title="Italic"
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleInsertMarkdown('- ')}
                        title="Bullet List"
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleInsertMarkdown('```\n', '\n```')}
                        title="Formula / Code Block"
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit / Preview tab */}
                    <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-medium">
                      <button
                        onClick={() => setActiveNotesTab('edit')}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          activeNotesTab === 'edit'
                            ? 'bg-surface text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setActiveNotesTab('preview')}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          activeNotesTab === 'preview'
                            ? 'bg-surface text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Input Area */}
                {activeNotesTab === 'edit' ? (
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder={`Write your revision notes, theorem proofs, and important NCERT formulas for "${activeChapter.title}"...`}
                    rows={12}
                    className="w-full p-4 rounded-xl bg-muted/20 border border-border text-foreground text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y placeholder:text-muted-foreground/60"
                  />
                ) : (
                  <div className="min-h-[16rem] p-4 rounded-xl bg-muted/20 border border-border text-foreground text-sm whitespace-pre-wrap leading-relaxed">
                    {notes ? (
                      notes
                    ) : (
                      <span className="text-muted-foreground italic">
                        No notes written yet. Switch to &ldquo;Edit&rdquo; to add formulas, NCERT key points, and definitions.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="max-w-sm space-y-2">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">Select a Chapter</h3>
                <p className="text-xs text-muted-foreground">
                  Pick any chapter from the tree on the left to set its status, add notes, or start a
                  focused study timer session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
