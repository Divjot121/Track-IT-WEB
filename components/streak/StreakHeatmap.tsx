'use client';

import React from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';
import { Flame, Award, Calendar, Clock } from 'lucide-react';

export const StreakHeatmap: React.FC = () => {
  const { studySessions } = useAppStore();

  // Aggregate study minutes by YYYY-MM-DD
  const minutesByDate: Record<string, number> = {};
  for (const s of studySessions) {
    const d = s.timestamp.slice(0, 10);
    minutesByDate[d] = (minutesByDate[d] || 0) + Math.round(s.durationSeconds / 60);
  }

  // Generate grid for past 24 weeks (168 days)
  const totalDays = 24 * 7;
  const daysArray: Array<{ dateStr: string; minutes: number; dayOfWeek: number }> = [];
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    daysArray.push({
      dateStr,
      minutes: minutesByDate[dateStr] || 0,
      dayOfWeek: d.getDay(),
    });
  }

  // Calculate streak stats
  const sessionDates = Object.keys(minutesByDate).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (sessionDates.includes(todayStr) || sessionDates.includes(yesterdayStr)) {
    let checkDate = sessionDates.includes(todayStr) ? new Date() : yesterday;
    while (true) {
      const dateKey = checkDate.toISOString().slice(0, 10);
      if (sessionDates.includes(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Active days count
  const activeDays = sessionDates.length;
  const totalMinutes = Object.values(minutesByDate).reduce((acc, m) => acc + m, 0);

  // Intensity color
  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return 'bg-muted/40 hover:bg-muted';
    if (minutes < 25) return 'bg-emerald-500/30 hover:bg-emerald-500/40';
    if (minutes < 60) return 'bg-emerald-500/60 hover:bg-emerald-500/70';
    if (minutes < 120) return 'bg-emerald-500 hover:bg-emerald-600';
    return 'bg-emerald-400 dark:bg-emerald-300 font-bold';
  };

  return (
    <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-6">
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Daily Study Activity & Consistency Heatmap
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            GitHub-style contribution grid of your Class 10 preparation sessions
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Current Streak:</span>
            <span className="font-bold text-amber-500 flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-500/30" /> {currentStreak} days
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Active Days:</span>
            <span className="font-bold text-foreground">{activeDays}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Total Study:</span>
            <span className="font-bold text-foreground">
              {Math.round((totalMinutes / 60) * 10) / 10}h
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {daysArray.map((day, idx) => (
              <div
                key={idx}
                title={`${day.dateStr}: ${day.minutes} minutes studied`}
                className={`w-3.5 h-3.5 rounded-xs transition-colors cursor-pointer ${getIntensityClass(
                  day.minutes
                )}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Mon</span>
              <span className="ml-4">Wed</span>
              <span className="ml-4">Fri</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-muted/40" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/30" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/60" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
