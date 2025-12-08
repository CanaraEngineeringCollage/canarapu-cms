import { Megaphone, Calendar, FileQuestion, FileText, BookOpen } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="page-header font-serif">Dashboard</h1>
        <p className="page-description">
          Welcome back! Here's an overview of your content management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Buzz"
          value={24}
          icon={Megaphone}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Events"
          value={8}
          icon={Calendar}
          variant="accent"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Question Papers"
          value={156}
          icon={FileQuestion}
          variant="success"
        />
        <StatCard
          title="Exam Circulars"
          value={42}
          icon={FileText}
          variant="danger"
        />
        <StatCard
          title="E-Magazines"
          value={12}
          icon={BookOpen}
          variant="primary"
        />
      </div>

      {/* Quick Actions */}
      {/* <QuickActions /> */}

      {/* Content Grid */}
      {/* <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity /> */}

        {/* System Status */}
        {/* <div className="rounded-xl border border-border/50 bg-card p-6 animate-slide-up">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
            Firebase Status
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Firestore Database</p>
                <p className="text-sm text-muted-foreground">5 collections active</p>
              </div>
              <span className="badge-success">Connected</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Firebase Storage</p>
                <p className="text-sm text-muted-foreground">2 folders configured</p>
              </div>
              <span className="badge-success">Connected</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Authentication</p>
                <p className="text-sm text-muted-foreground">Email/Password enabled</p>
              </div>
              <span className="badge-success">Active</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-primary font-medium">
              📋 Setup Required
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your Firebase credentials in the Settings page to enable full functionality.
            </p>
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
}
