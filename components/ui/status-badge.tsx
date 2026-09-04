import React from 'react';
import { motion } from 'framer-motion';
import { ChapterStatus } from '@/lib/types';
import { Circle, Clock, RotateCcw, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: ChapterStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const STATUS_CONFIG: Record<
  ChapterStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
    keyNum: string;
  }
> = {
  'not-started': {
    label: 'Not Started',
    icon: Circle,
    bgClass: 'bg-zinc-100 dark:bg-zinc-800/80',
    textClass: 'text-zinc-600 dark:text-zinc-400',
    borderClass: 'border-zinc-200 dark:border-zinc-700/80',
    dotClass: 'bg-zinc-400 dark:bg-zinc-500',
    keyNum: '1',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800/60',
    dotClass: 'bg-blue-500 animate-pulse',
    keyNum: '2',
  },
  revision: {
    label: 'Revision',
    icon: RotateCcw,
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    dotClass: 'bg-amber-500',
    keyNum: '3',
  },
  mastered: {
    label: 'Mastered',
    icon: CheckCircle2,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    dotClass: 'bg-emerald-500',
    keyNum: '4',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['not-started'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  return (
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`inline-flex items-center rounded-full border transition-colors ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </motion.span>
  );
};
