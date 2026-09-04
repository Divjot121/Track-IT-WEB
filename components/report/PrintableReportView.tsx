'use client';

import React from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';
import {
  calculateOverallReadiness,
  calculateSubjectReadiness,
  calculateExamCountdown,
} from '@/lib/utils';
import { Printer, Download, ArrowLeft, CheckCircle2, Award, Calendar } from 'lucide-react';

interface PrintableReportViewProps {
  onBack: () => void;
}

export const PrintableReportView: React.FC<PrintableReportViewProps> = ({ onBack }) => {
  const { subjects, chapterDataMap, settings, mockTests, studySessions } = useAppStore();

  const countdown = calculateExamCountdown(settings.examDate || '2027-02-15');
  const overall = calculateOverallReadiness(subjects, chapterDataMap);

  const totalStudyHours = Math.round(
    (studySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600) * 10
  ) / 10;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-surface-border shadow-xs print:hidden">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white text-zinc-900 border border-zinc-200 shadow-md space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-zinc-900 pb-6 flex items-start justify-between">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              Official Study Progress Record
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950">
              CBSE Class 10 Board Exam Readiness Report
            </h1>
            <p className="text-xs text-zinc-600 mt-1 font-mono">
              Academic Session 2026-27 (Single Annual Board Examination)
            </p>
          </div>

          <div className="text-right font-mono text-xs text-zinc-600">
            <div>Generated: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
            <div>Exam Date: {settings.examDate || '2027-02-15'}</div>
            <div className="font-bold text-zinc-900 mt-1">
              Countdown: {countdown.days} Days Remaining
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center font-mono">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Overall Readiness</div>
            <div className="text-2xl font-black text-zinc-950 mt-0.5">
              {overall.overallPercentage}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Target Goal</div>
            <div className="text-2xl font-black text-zinc-950 mt-0.5">
              {settings.targetPercentage}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Chapters Mastered</div>
            <div className="text-2xl font-black text-zinc-950 mt-0.5">
              {overall.masteredChapters}/{overall.totalChapters}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Focus Study Logged</div>
            <div className="text-2xl font-black text-zinc-950 mt-0.5">
              {totalStudyHours} hrs
            </div>
          </div>
        </div>

        {/* Subject-Wise Syllabus Coverage Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-1">
            Subject & Unit-Wise Syllabus Coverage
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-300 font-mono text-[11px] text-zinc-600">
                <th className="py-2 px-2">Subject / Unit</th>
                <th className="py-2 px-2 text-center">Weightage</th>
                <th className="py-2 px-2 text-center">Total Chapters</th>
                <th className="py-2 px-2 text-center">Mastered</th>
                <th className="py-2 px-2 text-center">Revision / In-Progress</th>
                <th className="py-2 px-2 text-right">Readiness %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {subjects.map((sub) => {
                const subRes = calculateSubjectReadiness(sub, chapterDataMap);
                return (
                  <React.Fragment key={sub.id}>
                    <tr className="bg-zinc-100/70 font-bold text-zinc-950">
                      <td className="py-2 px-2">{sub.name} (Code {sub.code})</td>
                      <td className="py-2 px-2 text-center font-mono">{sub.totalMarks} Marks</td>
                      <td className="py-2 px-2 text-center font-mono">{subRes.totalChapters}</td>
                      <td className="py-2 px-2 text-center font-mono text-emerald-700">
                        {subRes.masteredCount}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {subRes.revisionCount + subRes.inProgressCount}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-zinc-950">
                        {subRes.readinessPercentage}%
                      </td>
                    </tr>
                    {sub.units.map((unit) => {
                      const unitChapters = unit.chapters;
                      let unitMastered = 0;
                      let unitOthers = 0;
                      for (const c of unitChapters) {
                        const st = chapterDataMap[c.id]?.status || 'not-started';
                        if (st === 'mastered') unitMastered++;
                        else if (st !== 'not-started') unitOthers++;
                      }
                      const percent =
                        unitChapters.length > 0 ? Math.round((unitMastered / unitChapters.length) * 100) : 0;
                      return (
                        <tr key={unit.id} className="text-zinc-700 hover:bg-zinc-50">
                          <td className="py-1.5 px-4 text-[11px]">{unit.title}</td>
                          <td className="py-1.5 px-2 text-center font-mono text-[11px]">
                            {unit.marksWeightage}M
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[11px]">
                            {unitChapters.length}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[11px]">
                            {unitMastered}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[11px]">
                            {unitOthers}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-[11px] font-semibold">
                            {percent}%
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mock Test Performance Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-1">
            Mock Tests & Sample Paper Records
          </h3>

          {mockTests.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 font-mono text-[11px] text-zinc-600">
                  <th className="py-1.5 px-2">Paper Title</th>
                  <th className="py-1.5 px-2">Subject</th>
                  <th className="py-1.5 px-2 text-center">Score</th>
                  <th className="py-1.5 px-2 text-center">Percentage</th>
                  <th className="py-1.5 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {mockTests.map((t) => {
                  const sub = subjects.find((s) => s.id === t.subjectId);
                  const p = Math.round((t.marksScored / t.maxMarks) * 100);
                  return (
                    <tr key={t.id}>
                      <td className="py-1.5 px-2 font-medium text-zinc-950">{t.title}</td>
                      <td className="py-1.5 px-2 text-zinc-600">{sub?.name || t.subjectId}</td>
                      <td className="py-1.5 px-2 text-center font-mono">
                        {t.marksScored} / {t.maxMarks}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-zinc-950">
                        {p}%
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-zinc-600">{t.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-zinc-500 italic">No formal sample papers logged yet.</p>
          )}
        </div>

        {/* Verification Signatures Block */}
        <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-12 text-xs font-mono text-zinc-700">
          <div>
            <div className="border-b border-zinc-400 pb-8 mb-2" />
            <div>Student Verification Signature</div>
          </div>
          <div>
            <div className="border-b border-zinc-400 pb-8 mb-2" />
            <div>Parent / Academic Mentor Review</div>
          </div>
        </div>
      </div>
    </div>
  );
};
