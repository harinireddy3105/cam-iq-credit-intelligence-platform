import { cn } from '@/lib/utils';
import { getScoreColor } from '@/lib/format';

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={cn('font-mono font-bold text-sm', getScoreColor(score))}>
      {score}/100
    </span>
  );
}
