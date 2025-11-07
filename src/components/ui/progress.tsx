import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const Progress = ({ value, max = 100, className, ...props }: ProgressProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('ui-progress', className)} role="progressbar" aria-valuenow={value} aria-valuemax={max} {...props}>
      <div className="ui-progress__bar" style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default Progress;
