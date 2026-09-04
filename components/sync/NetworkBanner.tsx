'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { CloudOff, Wifi, RefreshCw } from 'lucide-react';

export const NetworkBanner: React.FC = () => {
  const { isOnline, reconnectToast, syncStatus } = useSyncStore();

  return (
    <>
      {/* 1. Thin non-blocking sliding banner when connection drops */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-zinc-900/90 dark:bg-zinc-800/90 border-b border-zinc-700/60 text-zinc-200 text-xs px-4 py-1.5 flex items-center justify-center gap-2 z-40 select-none backdrop-blur-xs"
          >
            <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              You&apos;re offline — TrackIT continues working locally and will sync your changes
              when you&apos;re back online.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Reconnect Toast sliding in and auto-fading */}
      <AnimatePresence>
        {reconnectToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-surface border border-border shadow-xl glass-modal flex items-center gap-2 text-xs font-medium text-foreground select-none"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>{reconnectToast}</span>
            <RefreshCw className="w-3 h-3 text-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
