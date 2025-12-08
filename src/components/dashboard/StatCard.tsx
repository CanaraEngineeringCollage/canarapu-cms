import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'danger';
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) => {
  const iconBgColors = {
    default: 'bg-muted',
    primary: 'bg-primary/10',
    accent: 'bg-accent/10',
    success: 'bg-success/10',
    danger: 'bg-destructive/10',
  };

  const iconColors = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    accent: 'text-accent',
    success: 'text-success',
    danger: 'text-destructive',
  };

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            iconBgColors[variant]
          )}
        >
          <Icon className={cn('h-6 w-6', iconColors[variant])} />
        </div>
      </div>
    </div>
  );
};
