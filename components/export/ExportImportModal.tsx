'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repository } from '@/lib/db/repository';
import { useAppStore } from '@/lib/stores/useAppStore';
import {
  Download,
  Upload,
  RefreshCw,
  Printer,
  X,
  FileJson,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReport: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onNavigateToReport,
}) => {
  const { refreshData } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = async () => {
    try {
      const json = await Repository.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TrackIT_CBSE_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ text: 'Data exported successfully as JSON!' });
    } catch (err) {
      setMessage({ text: 'Export failed: ' + String(err), isError: true });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await Repository.importAllData(text);
      if (success) {
        await refreshData();
        setMessage({ text: 'Data successfully restored from backup!' });
      } else {
        setMessage({ text: 'Invalid backup file format.', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Failed to read file: ' + String(err), isError: true });
    }
  };

  const handleReset = async () => {
    await Repository.resetAllData();
    await refreshData();
    setIsResetConfirm(false);
    setMessage({ text: 'Database reset to default seed syllabus.' });
  };

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
              <FileJson className="w-5 h-5 text-primary" />
              Data Management & Reports
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {message && (
            <div
              className={`my-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                message.isError
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}
            >
              {message.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="space-y-4 py-4">
            {/* Export */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Export All Data (JSON)</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Download syllabus progress, notes, timer logs, timetable, and mock test scores.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>

            {/* Import */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Import Backup (JSON)</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Restore your preparation progress from a previously saved JSON file.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground hover:bg-muted text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" /> Import
              </button>
            </div>

            {/* Printable Report */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Printable Study Summary</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Generate an official-formatted CBSE Board progress report formatted for print or PDF.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToReport();
                }}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground hover:bg-muted text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-3.5 h-3.5" /> View Report
              </button>
            </div>

            {/* Reset */}
            <div className="pt-2 border-t border-border/60">
              {!isResetConfirm ? (
                <button
                  onClick={() => setIsResetConfirm(true)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Database to Seed State
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                  <p className="text-rose-600 font-medium mb-2">
                    Are you sure? This will reset all chapter progress, notes, and study logs!
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1 rounded bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      onClick={() => setIsResetConfirm(false)}
                      className="px-3 py-1 rounded bg-surface border border-border text-foreground text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
