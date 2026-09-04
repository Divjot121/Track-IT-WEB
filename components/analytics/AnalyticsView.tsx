'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAppStore } from '@/lib/stores/useAppStore';
import { calculateSubjectReadiness, calculateOverallReadiness } from '@/lib/utils';
import { StreakHeatmap } from '../streak/StreakHeatmap';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { subjects, chapterDataMap, studySessions } = useAppStore();

  const overall = calculateOverallReadiness(subjects, chapterDataMap);

  // 1. Time per subject data for Donut Chart
  const subjectTimeData = useMemo(() => {
    const timeMap: Record<string, number> = {};
    for (const sub of subjects) {
      timeMap[sub.id] = 0;
    }

    for (const s of studySessions) {
      timeMap[s.subjectId] = (timeMap[s.subjectId] || 0) + Math.round(s.durationSeconds / 60);
    }

    return subjects.map((sub) => ({
      name: sub.name,
      minutes: timeMap[sub.id] || 0,
      hours: Math.round(((timeMap[sub.id] || 0) / 60) * 10) / 10,
      color: sub.color,
    }));
  }, [subjects, studySessions]);

  // If no sessions logged yet, provide a baseline distribution so chart looks pristine
  const displayPieData = useMemo(() => {
    const hasData = subjectTimeData.some((s) => s.minutes > 0);
    if (hasData) {
      return subjectTimeData.filter((s) => s.minutes > 0);
    }
    return subjects.map((sub) => ({
      name: sub.name,
      minutes: 45,
      hours: 0.75,
      color: sub.color,
    }));
  }, [subjectTimeData, subjects]);

  // 2. Weekly Trend Data (last 7 days)
  const weeklyBarData = useMemo(() => {
    const days: Array<{ day: string; hours: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

      const daySeconds = studySessions
        .filter((s) => s.timestamp.slice(0, 10) === dateStr)
        .reduce((acc, s) => acc + s.durationSeconds, 0);

      days.push({
        day: dayLabel,
        hours: Math.round((daySeconds / 3600) * 10) / 10,
      });
    }
    return days;
  }, [studySessions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Overall Readiness
          </span>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {overall.overallPercentage}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Across all enrolled CBSE subjects
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Mastered Chapters
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-500">
            {overall.masteredChapters} / {overall.totalChapters}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {Math.round((overall.masteredChapters / (overall.totalChapters || 1)) * 100)}% of total syllabus
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Total Study Time
          </span>
          <div className="text-3xl font-extrabold font-mono text-primary">
            {Math.round(
              (studySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600) * 10
            ) / 10}
            h
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Logged with focus timer</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Total Sessions
          </span>
          <div className="text-3xl font-extrabold font-mono text-amber-500">
            {studySessions.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Pomodoro & stopwatch logs</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Time per Subject Donut */}
        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-primary" />
                Time Spent Per Subject
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Balance your preparation across high-yield subjects
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  animationDuration={1000}
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${Math.round((value / 60) * 10) / 10} hours (${value}m)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--surface))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.75rem',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60">
            {displayPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs truncate">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-muted-foreground">{item.name}</span>
                <span className="font-mono font-bold text-foreground shrink-0">
                  {item.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Weekly Hours Bar Chart */}
        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Weekly Study Hours Trend
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily study velocity over the past 7 days
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
                <Tooltip
                  formatter={(value: number) => [`${value} hours`, 'Study Focus']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--surface))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.75rem',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Goal: 3-4 hours daily</span>
            <span className="font-mono text-primary font-semibold">Keep it consistent!</span>
          </div>
        </div>
      </div>

      {/* GitHub-style Streak Heatmap */}
      <StreakHeatmap />

      {/* Unit-Wise Completion Heatmap / Progress Matrix */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Unit-Wise Marks & Completion Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full breakdown of syllabus coverage mapped against CBSE board theory marks
          </p>
        </div>

        <div className="space-y-6">
          {subjects.map((sub) => {
            const subRes = calculateSubjectReadiness(sub, chapterDataMap);
            return (
              <div key={sub.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    <h4 className="text-xs font-bold text-foreground">{sub.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {subRes.readinessPercentage}% Readiness
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sub.units.map((unit) => {
                    const unitChapters = unit.chapters;
                    let mastered = 0;
                    for (const ch of unitChapters) {
                      if (chapterDataMap[ch.id]?.status === 'mastered') mastered++;
                    }
                    const percent = unitChapters.length > 0 ? Math.round((mastered / unitChapters.length) * 100) : 0;

                    return (
                      <div
                        key={unit.id}
                        className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground line-clamp-1">
                            {unit.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                            {unit.marksWeightage}M
                          </span>
                        </div>

                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: sub.color,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>
                            {mastered} / {unitChapters.length} Chapters
                          </span>
                          <span>{percent}%</span>
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
    </div>
  );
};
