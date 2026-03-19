import { cn } from '@/lib/utils';
import { AssessmentStatus } from '@/lib/types';

const statusConfig: Record<AssessmentStatus, { label: string; className: string }> = {
  approved: { label: 'APPROVED', className: 'bg-cam-success/15 text-cam-success border-cam-success/25' },
  conditional: { label: 'CONDITIONAL', className: 'bg-cam-warning/15 text-cam-warning border-cam-warning/25' },
  rejected: { label: 'REJECTED', className: 'bg-destructive/15 text-destructive border-destructive/25' },
  processing: { label: 'PROCESSING', className: 'bg-cam-processing/15 text-cam-processing border-cam-processing/25' },
  review: { label: 'REVIEW', className: 'bg-cam-review/15 text-cam-review border-cam-review/25' },
  draft: { label: 'DRAFT', className: 'bg-muted text-muted-foreground border-border' },
};

export function StatusBadge({ status }: { status: AssessmentStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
      config.className
    )}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        status === 'approved' && 'bg-cam-success',
        status === 'conditional' && 'bg-cam-warning',
        status === 'rejected' && 'bg-destructive',
        status === 'processing' && 'bg-cam-processing animate-live-pulse',
        status === 'review' && 'bg-cam-review',
        status === 'draft' && 'bg-muted-foreground',
      )} />
      {config.label}
    </span>
  );
}
