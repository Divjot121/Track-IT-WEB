'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStore, SyncStatus } from '@/lib/stores/useSyncStore';
import { SyncEngine } from '@/lib/sync/syncEngine';
import {
  Check,
  Cloud,
  CloudOff,
  AlertTriangle,
  RotateCw,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const SyncStatusIndicator: React.FC = () => {
  const {
    syncStatus,
    user,
    lastSyncedAt,
    isOnline,
    setAuthModalOpen,
    errorMessage,
  } = useSyncStore();

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const formatLastSynced = () => {
    if (!lastSyncedAt) return 'Never synced';
    const diffSecs = Math.floor((Date.now() - new Date(lastSyncedAt).getTime()) / 1000);
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    await SyncEngine.retrySync();
    setTimeout(() => setIsRetrying(false), 800);
  };

  const handleClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setIsTooltipOpen(!isTooltipOpen);
    }
  };

  // If user is not signed in, show clean "Cloud Sync" sign-in trigger
  if (!user) {
    return (
      <button
        onClick={() => setAuthModalOpen(true)}
        title="Sign in to sync across devices"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border/80 hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground transition-all group"
      >
        <Cloud className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="hidden sm:inline text-[11px] font-medium">Sync</span>
      </button>
    );
  }

  // 4 States: 'synced' | 'syncing' | 'offline' | 'error'
  return (
    <div className="relative">
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border/80 hover:bg-muted/40 cursor-pointer text-xs transition-colors select-none"
      >
        {syncStatus === 'synced' && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
            <span className="text-[11px] hidden md:inline font-mono">Synced</span>
          </div>
        )}

        {syncStatus === 'syncing' && (
          <div className="flex items-center gap-1.5 text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px] hidden md:inline font-mono">Syncing…</span>
          </div>
        )}

        {syncStatus === 'offline' && (
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <CloudOff className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden md:inline font-mono">Offline</span>
          </div>
        )}

        {syncStatus === 'error' && (
          <motion.div
            animate={{ x: [0, -2, 2, -1, 1, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.5 }}
            className="flex items-center gap-1.5 text-amber-500"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden md:inline font-medium">Sync error</span>
            <button
              onClick={handleRetry}
              className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <RotateCw className={`w-2.5 h-2.5 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </motion.div>
        )}
      </div>

      {/* Tiny Tooltip */}
      <AnimatePresence>
        {isTooltipOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-30 px-3 py-2 rounded-xl bg-surface elevated border border-border shadow-xl text-xs whitespace-nowrap glass-panel space-y-1"
          >
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Cloud className="w-3.5 h-3.5 text-primary" />
              <span>{user.email}</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {syncStatus === 'synced' && `Last synced ${formatLastSynced()}`}
              {syncStatus === 'syncing' && 'Pushing local updates to cloud…'}
              {syncStatus === 'offline' && 'Offline — changes queued locally'}
              {syncStatus === 'error' && (errorMessage || 'Connection issue')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
