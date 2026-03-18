import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'teal' | 'red' | 'green' | 'amber';
  pulse?: boolean;
  subtitle?: string;
}

const colorMap = {
  teal: { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', glow: 'shadow-[0_0_20px_-5px_hsl(187,92%,37%,0.15)]' },
  red: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', glow: 'shadow-[0_0_20px_-5px_hsl(0,72%,51%,0.15)]' },
  green: { text: 'text-cam-success', bg: 'bg-cam-success/10', border: 'border-cam-success/20', glow: 'shadow-[0_0_20px_-5px_hsl(160,84%,39%,0.15)]' },
  amber: { text: 'text-cam-warning', bg: 'bg-cam-warning/10', border: 'border-cam-warning/20', glow: 'shadow-[0_0_20px_-5px_hsl(32,95%,44%,0.15)]' },
};

export function KPICard({ title, value, icon: Icon, color = 'teal', pulse, subtitle }: KPICardProps) {
  const c = colorMap[color];
  return (
    <Card className={cn('group relative overflow-hidden border-border/40 transition-all duration-300 hover:border-border/60', c.glow, 'hover:translate-y-[-2px]')}>
      {/* Subtle top gradient line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', c.bg)} />
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('rounded-xl p-3 transition-transform duration-300 group-hover:scale-110', c.bg, 'border', c.border)}>
          <Icon className={cn('h-5 w-5', c.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
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
