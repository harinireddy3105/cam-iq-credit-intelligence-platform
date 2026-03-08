import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'teal' | 'red' | 'green' | 'amber';
  pulse?: boolean;
}

const colorMap = {
  teal: 'text-cam-processing',
  red: 'text-cam-danger',
  green: 'text-cam-success',
  amber: 'text-cam-warning',
};

export function KPICard({ title, value, icon: Icon, color = 'teal', pulse }: KPICardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('rounded-lg bg-secondary p-3', colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold font-mono', colorMap[color])}>
            {pulse && <span className="inline-block h-2 w-2 rounded-full bg-cam-danger animate-live-pulse mr-2" />}
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
