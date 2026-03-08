import { cn } from '@/lib/utils';
import { AssessmentStatus } from '@/lib/types';

const statusConfig: Record<AssessmentStatus, { label: string; className: string }> = {
  approved: { label: 'APPROVED', className: 'bg-cam-success text-primary-foreground' },
  conditional: { label: 'CONDITIONAL', className: 'bg-cam-warning text-primary-foreground' },
  rejected: { label: 'REJECTED', className: 'bg-cam-danger text-primary-foreground' },
  processing: { label: 'PROCESSING', className: 'bg-cam-processing text-primary-foreground' },
  review: { label: 'REVIEW', className: 'bg-cam-review text-primary-foreground' },
  draft: { label: 'DRAFT', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status }: { status: AssessmentStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', config.className)}>
      {config.label}
    </span>
  );
}
