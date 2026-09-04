'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ + K', desc: 'Open Command Palette' },
    { key: '1', desc: 'Set selected chapter to "Not Started"' },
    { key: '2', desc: 'Set selected chapter to "In Progress"' },
    { key: '3', desc: 'Set selected chapter to "Revision"' },
    { key: '4', desc: 'Set selected chapter to "Mastered"' },
    { key: 'T', desc: 'Open Study Timer / Focus mode' },
    { key: 'D', desc: 'Go to Dashboard' },
    { key: 'S', desc: 'Go to Syllabus Tracker' },
    { key: 'P', desc: 'Go to Timetable Planner' },
    { key: 'R', desc: 'Go to Spaced Revision Hub' },
    { key: 'A', desc: 'Go to Analytics & Heatmap' },
    { key: 'M', desc: 'Go to Mock Tests Log' },
    { key: '?', desc: 'Show Keyboard Shortcuts' },
    { key: 'Esc', desc: 'Close open modal / palette' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-surface border border-surface-border rounded-xl shadow-2xl p-6 z-10 glass-modal overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-foreground font-semibold text-base">
              <Keyboard className="w-5 h-5 text-primary" />
              Keyboard Shortcuts
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {shortcuts.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40 text-xs"
              >
                <span className="text-muted-foreground">{item.desc}</span>
                <kbd className="px-2 py-0.5 rounded bg-surface border border-border font-mono font-semibold text-foreground text-[11px] shadow-2xs">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/60 text-right">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
