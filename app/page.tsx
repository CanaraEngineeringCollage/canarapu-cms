"use client";

import { useEffect, useState } from 'react';
import { Megaphone, Calendar, FileQuestion, FileText, BookOpen } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Dashboard() {
  const [buzzCount, setBuzzCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [questionPapersCount, setQuestionPapersCount] = useState(0);
  const [examCircularsCount, setExamCircularsCount] = useState(0);
  const [magazinesCount, setMagazinesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Buzz count
  useEffect(() => {
    const q = query(collection(db, "buzz"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBuzzCount(snapshot.docs.length);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Events count
  useEffect(() => {
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEventsCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Question Papers count
  useEffect(() => {
    const q = query(collection(db, "question-papers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQuestionPapersCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Exam Circulars count
  useEffect(() => {
    const q = query(collection(db, "exam-circulars"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExamCircularsCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Magazines count
  useEffect(() => {
    const q = query(collection(db, "magazines"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMagazinesCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, []);

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
          value={loading ? 0 : buzzCount}
          icon={Megaphone}
          variant="primary"
        />
        <StatCard
          title="Active Events"
          value={loading ? 0 : eventsCount}
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Question Papers"
          value={loading ? 0 : questionPapersCount}
          icon={FileQuestion}
          variant="success"
        />
        <StatCard
          title="Exam Circulars"
          value={loading ? 0 : examCircularsCount}
          icon={FileText}
          variant="danger"
        />
        <StatCard
          title="E-Magazines"
          value={loading ? 0 : magazinesCount}
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
