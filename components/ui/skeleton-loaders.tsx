'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden bg-muted/60 dark:bg-muted/30 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`}
  />
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* 4 Bento Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4"
          >
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-3.5 w-24" />
              <SkeletonBox className="h-7 w-7 rounded-lg" />
            </div>
            <SkeletonBox className="h-9 w-20" />
            <SkeletonBox className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
          <SkeletonBox className="h-4 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border/70 space-y-3">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <SkeletonBox className="h-3.5 w-28" />
                    <SkeletonBox className="h-2.5 w-20" />
                  </div>
                </div>
                <SkeletonBox className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
          <SkeletonBox className="h-4 w-36" />
          <SkeletonBox className="h-3 w-48" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-border/60 flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <SkeletonBox className="h-3.5 w-32" />
                  <SkeletonBox className="h-2.5 w-20" />
                </div>
                <SkeletonBox className="w-7 h-7 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrackerSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-pulse">
      <div className="px-6 py-2.5 border-b border-border bg-surface/50 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox key={i} className="h-7 w-28 rounded-lg" />
        ))}
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 md:w-96 border-r border-border bg-surface p-4 space-y-3">
          <SkeletonBox className="h-8 w-full rounded-lg" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonBox key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8 space-y-6">
          <SkeletonBox className="h-44 w-full rounded-2xl" />
          <SkeletonBox className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
