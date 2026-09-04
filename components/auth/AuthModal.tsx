'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { signInWithMagicLink, signOutUser } from '@/lib/supabase/client';
import { SyncEngine } from '@/lib/sync/syncEngine';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  Cloud,
  LogOut,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    user,
    setUser,
    syncStatus,
    lastSyncedAt,
  } = useSyncStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  if (!isAuthModalOpen) return null;

  const validateEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address');
      setShakeTrigger((prev) => prev + 1);
      return;
    }

    if (!validateEmail(trimmed)) {
      setErrorMessage('Please enter a valid email address (e.g. student@gmail.com)');
      setShakeTrigger((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink(trimmed);
      if (error) {
        setErrorMessage(error.message);
        setShakeTrigger((prev) => prev + 1);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send login link');
      setShakeTrigger((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setAuthModalOpen(false);
  };

  const handleManualSync = async () => {
    await SyncEngine.pullAndReconcile();
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Soft Animated Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-surface border border-surface-border rounded-3xl shadow-2xl p-6 sm:p-8 z-10 glass-modal overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {user ? (
            /* Already Signed-In State */
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
                <Cloud className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Cloud Sync Active
                </span>
                <h3 className="text-lg font-bold text-foreground">Cross-Device Sync Enabled</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{user.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-foreground capitalize font-mono">
                    {syncStatus}
                  </span>
                </div>
                {lastSyncedAt && (
                  <div className="flex items-center justify-between">
                    <span>Last Synced:</span>
                    <span className="font-mono">
                      {new Date(lastSyncedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleManualSync}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-2.5 px-4 rounded-xl bg-surface border border-border text-rose-500 hover:bg-rose-500/10 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* "Check your email" Confirmation State with subtle bouncing envelope */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="py-6 text-center space-y-5"
            >
              {/* Animated Floating Envelope */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mx-auto shadow-lg"
              >
                <Mail className="w-8 h-8" />
              </motion.div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Check your inbox!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  We sent a magic sign-in link to{' '}
                  <strong className="text-foreground font-mono">{email}</strong>. Click the link in
                  your email to instantly activate cross-device sync.
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </motion.div>
          ) : (
            /* Magic-Link Sign In Form */
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  Supabase Cloud Sync
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Sync Across Your Devices
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Keep your chapter readiness, timetable, and study streak perfectly synced between
                  your desktop, laptop, and phone. Passwordless magic-link sign in.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Email Address
                  </label>

                  {/* Input with Shake Micro-Animation on Error */}
                  <motion.div
                    key={shakeTrigger}
                    animate={
                      shakeTrigger > 0
                        ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="you@example.com"
                      className={`w-full bg-muted/40 border text-foreground text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60 transition-all font-sans ${
                        errorMessage
                          ? 'border-rose-500/60 bg-rose-500/5'
                          : 'border-border/80 hover:border-border'
                      }`}
                      autoFocus
                    />
                  </motion.div>

                  {/* Inline Error Message */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-xs text-rose-500 mt-2 font-medium"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Animated Submit Button with Spinner */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Magic Link…</span>
                    </motion.div>
                  ) : (
                    <>
                      <span>Send Magic Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-border/60 text-center">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  No password needed. We&apos;ll send a one-click sign-in link to your email.
                  All your data stays completely private via Supabase Row-Level Security.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
