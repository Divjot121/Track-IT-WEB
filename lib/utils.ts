import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChapterUserData, Subject } from "./types";
import { SEED_SUBJECTS } from "@/data/subjects";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates days, hours, and minutes remaining until the CBSE board exam.
 * Target: CBSE 2026-27 Single Board Exam (default Feb 15, 2027).
 */
export function calculateExamCountdown(targetDateStr: string = "2027-02-15") {
  const targetDate = new Date(`${targetDateStr}T09:00:00+05:30`).getTime();
  const now = Date.now();
  const diff = targetDate - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Spaced repetition interval in days based on level:
 * Level 0: Not mastered yet
 * Level 1: 3 days
 * Level 2: 7 days
 * Level 3: 14 days
 * Level 4: 30 days
 */
export function getNextRevisionDate(currentLevel: number): { nextLevel: number; dueDate: string } {
  const intervals = [3, 7, 14, 30];
  const nextLevel = Math.min(currentLevel + 1, intervals.length);
  const intervalDays = intervals[nextLevel - 1] || 30;

  const now = new Date();
  now.setDate(now.getDate() + intervalDays);
  return {
    nextLevel,
    dueDate: now.toISOString(),
  };
}

/**
 * Checks if a revision is due or overdue
 */
export function isRevisionDue(revisionDueDate: string | null): boolean {
  if (!revisionDueDate) return false;
  return new Date(revisionDueDate).getTime() <= Date.now();
}

/**
 * Calculates weighted readiness percentage:
 * Chapter Status Weight:
 * - mastered: 1.0 (100%)
 * - revision: 0.8 (80%)
 * - in-progress: 0.4 (40%)
 * - not-started: 0.0 (0%)
 *
 * Subject Readiness = sum(unit_weight * (unit_chapter_completion_avg)) / total_subject_weight
 */
export function calculateSubjectReadiness(
  subject: Subject,
  chapterUserDataMap: Record<string, ChapterUserData>
): {
  readinessPercentage: number;
  totalChapters: number;
  masteredCount: number;
  inProgressCount: number;
  revisionCount: number;
  notStartedCount: number;
  marksCovered: number;
} {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let totalChapters = 0;
  let masteredCount = 0;
  let inProgressCount = 0;
  let revisionCount = 0;
  let notStartedCount = 0;

  for (const unit of subject.units) {
    totalWeight += unit.marksWeightage;
    const unitChapters = unit.chapters;
    totalChapters += unitChapters.length;

    let unitChapterScoreSum = 0;

    for (const ch of unitChapters) {
      const uData = chapterUserDataMap[ch.id];
      const status = uData?.status || 'not-started';

      if (status === 'mastered') {
        unitChapterScoreSum += 1.0;
        masteredCount++;
      } else if (status === 'revision') {
        unitChapterScoreSum += 0.8;
        revisionCount++;
      } else if (status === 'in-progress') {
        unitChapterScoreSum += 0.4;
        inProgressCount++;
      } else {
        notStartedCount++;
      }
    }

    const unitAvg = unitChapters.length > 0 ? unitChapterScoreSum / unitChapters.length : 0;
    totalWeightedScore += unitAvg * unit.marksWeightage;
  }

  const readinessPercentage = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  const marksCovered = Math.round((totalWeightedScore / (totalWeight || 1)) * subject.totalMarks);

  return {
    readinessPercentage,
    totalChapters,
    masteredCount,
    inProgressCount,
    revisionCount,
    notStartedCount,
    marksCovered,
  };
}

/**
 * Calculates overall preparation readiness across all enrolled subjects
 */
export function calculateOverallReadiness(
  subjects: Subject[],
  chapterUserDataMap: Record<string, ChapterUserData>
): {
  overallPercentage: number;
  totalChapters: number;
  masteredChapters: number;
  weakestSubject: { subject: Subject; readiness: number } | null;
  strongestSubject: { subject: Subject; readiness: number } | null;
} {
  let totalReadinessSum = 0;
  let totalChapters = 0;
  let masteredChapters = 0;

  let weakest: { subject: Subject; readiness: number } | null = null;
  let strongest: { subject: Subject; readiness: number } | null = null;

  for (const sub of subjects) {
    const res = calculateSubjectReadiness(sub, chapterUserDataMap);
    totalReadinessSum += res.readinessPercentage;
    totalChapters += res.totalChapters;
    masteredChapters += res.masteredCount;

    if (!weakest || res.readinessPercentage < weakest.readiness) {
      weakest = { subject: sub, readiness: res.readinessPercentage };
    }
    if (!strongest || res.readinessPercentage > strongest.readiness) {
      strongest = { subject: sub, readiness: res.readinessPercentage };
    }
  }

  const overallPercentage = subjects.length > 0 ? Math.round(totalReadinessSum / subjects.length) : 0;

  return {
    overallPercentage,
    totalChapters,
    masteredChapters,
    weakestSubject: weakest,
    strongestSubject: strongest,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}
