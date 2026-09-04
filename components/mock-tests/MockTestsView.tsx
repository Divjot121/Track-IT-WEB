'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useAppStore } from '@/lib/stores/useAppStore';
import { MockTestLog } from '@/lib/types';
import {
  FileCheck2,
  Plus,
  Trash2,
  Award,
  TrendingUp,
  Calendar,
  X,
  Target,
  Sparkles,
} from 'lucide-react';

export const MockTestsView: React.FC = () => {
  const { subjects, mockTests, addMockTest, deleteMockTest, settings } = useAppStore();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'maths-standard');
  const [title, setTitle] = useState('');
  const [marksScored, setMarksScored] = useState<number>(72);
  const [maxMarks, setMaxMarks] = useState<number>(80);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const filteredTests = useMemo(() => {
    if (selectedSubjectFilter === 'all') return mockTests;
    return mockTests.filter((m) => m.subjectId === selectedSubjectFilter);
  }, [mockTests, selectedSubjectFilter]);

  // Chart data sorted by date
  const chartData = useMemo(() => {
    const sorted = [...filteredTests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.map((t) => ({
      date: t.date.slice(5), // MM-DD
      scorePercent: Math.round((t.marksScored / t.maxMarks) * 100),
      title: t.title,
      subjectId: t.subjectId,
    }));
  }, [filteredTests]);

  // Overall calculations
  const averagePercentage =
    filteredTests.length > 0
      ? Math.round(
          filteredTests.reduce((acc, m) => acc + (m.marksScored / m.maxMarks) * 100, 0) /
            filteredTests.length
        )
      : 0;

  const highestScore =
    filteredTests.length > 0
      ? Math.max(...filteredTests.map((m) => Math.round((m.marksScored / m.maxMarks) * 100)))
      : 0;

  const handleSave = async () => {
    if (!title) return;
    await addMockTest({
      subjectId,
      title,
      marksScored,
      maxMarks,
      date,
      notes,
    });
    setIsModalOpen(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface border border-surface-border shadow-xs">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            Mock Tests & Sample Papers Performance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your score trajectories on pre-boards, CBSE official sample papers, and chapter tests.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Log Test Score
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            {filteredTests.length > 0 ? `${averagePercentage}%` : '--'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Target benchmark: {settings.targetPercentage}%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Highest Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-500">
            {filteredTests.length > 0 ? `${highestScore}%` : '--'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Peak performance recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Papers Completed</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-500">
            {filteredTests.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Practice & sample tests logged</p>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Score Trend Trajectory (%)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Target line indicates your CBSE Board aim ({settings.targetPercentage}%)
            </p>
          </div>

          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="p-2 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-72 w-full pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Score']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.title} (${item.date})` : label;
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--surface))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.75rem',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={settings.targetPercentage}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Goal (${settings.targetPercentage}%)`,
                    fill: '#10B981',
                    fontSize: 11,
                    position: 'top',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="scorePercent"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl">
              No mock tests recorded yet. Click &ldquo;Log Test Score&rdquo; to begin plotting your score trend.
            </div>
          )}
        </div>
      </div>

      {/* Tests Log Table */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground tracking-tight">
          Logged Practice & Sample Papers
        </h3>

        {filteredTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Paper Title</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTests.map((t) => {
                  const sub = subjects.find((s) => s.id === t.subjectId);
                  const percent = Math.round((t.marksScored / t.maxMarks) * 100);
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.color || '#6366F1' }}
                        />
                        {sub?.name || t.subjectId}
                      </td>
                      <td className="py-3 px-3 text-foreground font-medium">
                        {t.title}
                        {t.notes && (
                          <span className="block text-[11px] text-muted-foreground">
                            {t.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {t.marksScored} / {t.maxMarks}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            percent >= 90
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : percent >= 75
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {percent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">{t.date}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => t.id && deleteMockTest(t.id)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Delete test log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No papers found for this filter.
          </div>
        )}
      </div>

      {/* Log Mock Test Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-bold text-sm text-foreground">Record Practice Paper Score</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Paper Title / Source
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CBSE Official Sample Paper 2027"
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Marks Scored
                    </label>
                    <input
                      type="number"
                      value={marksScored}
                      onChange={(e) => setMarksScored(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Maximum Marks
                    </label>
                    <input
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Date Completed
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Analysis / Weak Points Noted
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Lost 4 marks in Geometry theorem proof"
                    className="w-full p-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Save Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
