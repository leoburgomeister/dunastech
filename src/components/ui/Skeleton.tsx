'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'image';
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  const baseClasses = 'animate-shimmer bg-[var(--color-surface-alt)]';

  const variantClasses = {
    text: 'h-4 rounded-md',
    circle: 'rounded-full',
    card: 'rounded-xl',
    image: 'rounded-lg',
  };

  const defaultSizes = {
    text: { width: '100%', height: '16px' },
    circle: { width: '40px', height: '40px' },
    card: { width: '100%', height: '160px' },
    image: { width: '100%', height: '200px' },
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        width: width || defaultSizes[variant].width,
        height: height || defaultSizes[variant].height,
      }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('surface-card p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="44px" height="44px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="14px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <Skeleton variant="image" height="120px" />
      <div className="space-y-2">
        <Skeleton width="80%" />
        <Skeleton width="60%" />
      </div>
    </div>
  );
}
