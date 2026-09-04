'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/useAppStore';
import { Sparkles, Check, ArrowRight, X, Calendar, Target, BookOpen } from 'lucide-react';
import { SubjectIcon } from '../ui/subject-icon';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setOnboardingOpen,
    subjects,
    settings,
    updateSettings,
  } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetPercentage, setTargetPercentage] = useState(settings.targetPercentage || 95);
  const [examDate, setExamDate] = useState(settings.examDate || '2027-02-15');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    settings.selectedSubjectIds || subjects.map((s) => s.id)
  );

  if (!isOnboardingOpen) return null;

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      if (selectedSubjectIds.length > 1) {
        setSelectedSubjectIds(selectedSubjectIds.filter((s) => s !== id));
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleFinish = async () => {
    await updateSettings({
      onboardingCompleted: true,
      targetPercentage,
      examDate,
      selectedSubjectIds,
    });
    setOnboardingOpen(false);
  };

  const handleSkip = async () => {
    await updateSettings({
      onboardingCompleted: true,
    });
    setOnboardingOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Top Skip button */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              CBSE Class 10 • Session 2026-27
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Skip setup <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 1: Welcome & Goal */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Welcome to TrackIT Web
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Your distraction-free desktop preparation command center for the Class 10 Board
                  Examinations. Set your target score to calculate your weighted readiness.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Board Exam Score
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="75"
                    max="99"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-primary font-mono w-16 text-right">
                    {targetPercentage}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[85, 90, 95, 98].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setTargetPercentage(score)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        targetPercentage === score
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {score}% Target
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-sm"
                >
                  Next: Exam Countdown <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Exam Date */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Board Exam Date
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  CBSE runs a single annual board exam starting mid-February 2027. Your daily countdown
                  and revision cadence are calibrated to this date.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Exam Start Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="bg-surface border border-border text-foreground text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-muted-foreground hover:text-foreground font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-sm"
                >
                  Next: Choose Subjects <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Choose Subjects */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Select Your Subjects
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Select the subjects you are enrolled in. All chapters can be customized or marked at
                  any time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const isSelected = selectedSubjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${sub.color}20`,
                            color: sub.color,
                          }}
                        >
                          <SubjectIcon name={sub.iconName} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{sub.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {sub.units.length} Units • {sub.totalMarks} Marks
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border/60">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-muted-foreground hover:text-foreground font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-md"
                >
                  Launch TrackIT <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Stepper Dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
