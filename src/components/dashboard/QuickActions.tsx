import Link from 'next/link';
import { Plus, Megaphone, Calendar, FileQuestion, FileText, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'New Buzz',
    href: '/buzz/new',
    icon: Megaphone,
    color: 'bg-primary hover:bg-primary/90',
  },
  {
    label: 'Add Event',
    href: '/events/new',
    icon: Calendar,
    color: 'bg-accent hover:bg-accent/90',
  },
  {
    label: 'Upload Question',
    href: '/question-bank/new',
    icon: FileQuestion,
    color: 'bg-success hover:bg-success/90',
  },
  {
    label: 'Add Circular',
    href: '/exam-circulars/new',
    icon: FileText,
    color: 'bg-warning hover:bg-warning/90',
  },
  {
    label: 'New Magazine',
    href: '/e-magazines/new',
    icon: BookOpen,
    color: 'bg-red-500 hover:bg-red-600',
  },
];

export const QuickActions = () => {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 animate-slide-up">
      <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg',
                action.color
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
