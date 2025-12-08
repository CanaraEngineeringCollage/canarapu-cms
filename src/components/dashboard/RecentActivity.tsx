import { Clock, FileText, Megaphone, Calendar, BookOpen } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'buzz',
    title: 'New Announcement Published',
    description: 'Annual Day 2024 announcement',
    time: '2 hours ago',
    icon: Megaphone,
  },
  {
    id: 2,
    type: 'event',
    title: 'Event Created',
    description: 'Mat Kabaddi 2024 registration',
    time: '5 hours ago',
    icon: Calendar,
  },
  {
    id: 3,
    type: 'question',
    title: 'Question Paper Uploaded',
    description: 'Physics Annual 2024',
    time: '1 day ago',
    icon: FileText,
  },
  {
    id: 4,
    type: 'magazine',
    title: 'E-Magazine Added',
    description: 'Campus Chronicle Vol. 12',
    time: '2 days ago',
    icon: BookOpen,
  },
];

export const RecentActivity = () => {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm font-medium text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
