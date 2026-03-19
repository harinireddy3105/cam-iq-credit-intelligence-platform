import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'orange' | 'red' | 'green' | 'teal' | 'amber';
  pulse?: boolean;
  subtitle?: string;
}

const colorMap = {
  orange: { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', glow: 'hover:shadow-[0_0_24px_-6px_hsl(18,100%,60%,0.2)]' },
  red: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', glow: 'hover:shadow-[0_0_24px_-6px_hsl(4,90%,58%,0.2)]' },
  green: { text: 'text-cam-success', bg: 'bg-cam-success/10', border: 'border-cam-success/20', glow: 'hover:shadow-[0_0_24px_-6px_hsl(122,39%,49%,0.2)]' },
  teal: { text: 'text-cam-processing', bg: 'bg-cam-processing/10', border: 'border-cam-processing/20', glow: 'hover:shadow-[0_0_24px_-6px_hsl(187,100%,42%,0.2)]' },
  amber: { text: 'text-cam-warning', bg: 'bg-cam-warning/10', border: 'border-cam-warning/20', glow: 'hover:shadow-[0_0_24px_-6px_hsl(36,100%,50%,0.2)]' },
};

export function KPICard({ title, value, icon: Icon, color = 'orange', pulse, subtitle }: KPICardProps) {
  const c = colorMap[color];
  return (
    <Card className={cn(
      'group relative overflow-hidden border-border/30 transition-all duration-300 hover:border-border/50 hover:translate-y-[-2px]',
      c.glow
    )}>
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', c.bg)} />
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('rounded-xl p-3 transition-transform duration-300 group-hover:scale-110', c.bg, 'border', c.border)}>
          <Icon className={cn('h-5 w-5', c.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold font-mono flex items-center gap-2', c.text)}>
            {pulse && <span className="inline-block h-2 w-2 rounded-full bg-destructive animate-live-pulse shrink-0" />}
            {value}
          </p>
          {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
