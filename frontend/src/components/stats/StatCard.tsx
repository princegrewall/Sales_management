import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

export function StatCard({ label, value, subValue, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-lg px-4 py-3 min-w-[160px]',
      className
    )}>
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
        <span>{label}</span>
        <Info className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        {subValue && (
          <span className="text-sm text-muted-foreground">{subValue}</span>
        )}
      </div>
    </div>
  );
}
