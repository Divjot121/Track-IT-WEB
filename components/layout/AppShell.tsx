'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { useSyncStore } from '@/lib/stores/useSyncStore';
import { SyncEngine } from '@/lib/sync/syncEngine';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomBar } from './MobileBottomBar';
import { MobileDrawer } from './MobileDrawer';
import { ShortcutsModal } from './ShortcutsModal';
import { CommandPalette } from '../command-palette/CommandPalette';
import { OnboardingModal } from '../onboarding/OnboardingModal';
import { ExportImportModal } from '../export/ExportImportModal';
import { AuthModal } from '../auth/AuthModal';
import { ManualSessionModal } from '../timer/ManualSessionModal';
import { PwaRegister } from '../pwa/PwaRegister';
import { InstallBanner } from '../pwa/InstallBanner';
import { NetworkBanner } from '../sync/NetworkBanner';
import { DashboardSkeleton, TrackerSkeleton } from '../ui/skeleton-loaders';

// Views
import { DashboardView } from '../dashboard/DashboardView';
import { TrackerView } from '../tracker/TrackerView';
import { TimerView } from '../timer/TimerView';
import { PlannerView } from '../planner/PlannerView';
import { RevisionView } from '../revision/RevisionView';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { MockTestsView } from '../mock-tests/MockTestsView';
import { PrintableReportView } from '../report/PrintableReportView';

export const AppShell: React.FC = () => {
  const {
    initialize,
    isInitialized,
    setCommandPaletteOpen,
    isCommandPaletteOpen,
    isManualSessionModalOpen,
    setManualSessionModalOpen,
  } = useAppStore();
  const { isInitialDataPulling } = useSyncStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Initialize store, database, and sync engine on client mount
  useEffect(() => {
    initialize();
    SyncEngine.init();
  }, [initialize]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key.toLowerCase() === 'd') {
        setActiveTab('dashboard');
      } else if (e.key.toLowerCase() === 's') {
        setActiveTab('tracker');
      } else if (e.key.toLowerCase() === 't') {
        setActiveTab('timer');
      } else if (e.key.toLowerCase() === 'p') {
        setActiveTab('planner');
      } else if (e.key.toLowerCase() === 'r') {
        setActiveTab('revision');
      } else if (e.key.toLowerCase() === 'a') {
        setActiveTab('analytics');
      } else if (e.key.toLowerCase() === 'm') {
        setActiveTab('mock-tests');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-xl animate-pulse">
          T
        </div>
        <div className="text-xs font-mono text-muted-foreground animate-pulse">
          Loading TrackIT Web Workspace...
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigateTab={setActiveTab} />;
      case 'tracker':
        return <TrackerView onNavigateTab={setActiveTab} />;
      case 'timer':
        return <TimerView />;
      case 'planner':
        return <PlannerView onNavigateTab={setActiveTab} />;
      case 'revision':
        return <RevisionView onNavigateTab={setActiveTab} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'mock-tests':
        return <MockTestsView />;
      case 'report':
        return <PrintableReportView onBack={() => setActiveTab('dashboard')} />;
      default:
        return <DashboardView onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Offline / Reconnect Banner */}
        <NetworkBanner />

        <TopBar
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

        <main
          className={`flex-1 bg-background/50 relative ${
            activeTab === 'tracker' ? 'overflow-hidden' : 'overflow-y-auto pb-16 lg:pb-0'
          }`}
        >
          {isInitialDataPulling ? (
            activeTab === 'tracker' ? (
              <TrackerSkeleton />
            ) : (
              <DashboardSkeleton />
            )
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="min-h-full"
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Mobile Bottom Tab Bar (Fixed at bottom on <lg) */}
        <MobileBottomBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenMore={() => setIsMobileDrawerOpen(true)}
        />
      </div>

      {/* Mobile Action Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onSelectTab={setActiveTab}
        onOpenManualSession={() => {
          setIsMobileDrawerOpen(false);
          setManualSessionModalOpen(true);
        }}
        onOpenExportModal={() => {
          setIsMobileDrawerOpen(false);
          setIsExportModalOpen(true);
        }}
      />

      {/* Manual Study Session Logger Modal */}
      <ManualSessionModal
        isOpen={isManualSessionModalOpen}
        onClose={() => setManualSessionModalOpen(false)}
      />

      {/* PWA Service Worker & Installation Prompt Banner */}
      <PwaRegister />
      <InstallBanner />

      {/* Modals & Dialogs */}
      <CommandPalette onNavigateTab={setActiveTab} />
      <OnboardingModal />
      <AuthModal />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onNavigateToReport={() => setActiveTab('report')}
      />
    </div>
  );
};
