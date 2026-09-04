'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpenCheck,
  CalendarDays,
  BarChart2,
  Menu,
  Timer,
} from 'lucide-react';
import { useTimerStore } from '@/lib/stores/useTimerStore';
import { useAppStore } from '@/lib/stores/useAppStore';
import { isRevisionDue } from '@/lib/utils';

interface MobileBottomBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDrawer?: () => void;
  onOpenMore?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDrawer,
  onOpenMore,
}) => {
  const handleOpenMore = onOpenDrawer || onOpenMore || (() => {});
  const { status: timerStatus } = useTimerStore();
  const { chapterDataMap } = useAppStore();

  const dueRevisionCount = Object.values(chapterDataMap).filter(
    (c) => c.status === 'mastered' && isRevisionDue(c.revisionDueDate)
  ).length;

  const hasAlert = dueRevisionCount > 0 || timerStatus === 'running';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Syllabus', icon: BookOpenCheck },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 border-t border-border/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] select-none print:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors relative"
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={handleOpenMore}
          className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground relative"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {hasAlert && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </div>
    </nav>
  );
};
