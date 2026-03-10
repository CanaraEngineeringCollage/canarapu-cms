"use client";

import { useEffect, useState } from 'react';
import { Megaphone, Calendar, FileQuestion, FileText, BookOpen, MessageSquare } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    buzz: 0,
    inquiry: 0,
    events: 0,
    'question-papers': 0,
    'exam-circulars': 0,
    magazines: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard-counts')
      .then((res) => res.json())
      .then((data) => {
        setCounts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
          title="Total Inquiry"
          value={loading ? 0 : counts.inquiry}
          icon={MessageSquare}
          variant="primary"
        />
        <StatCard
          title="Total Buzz"
          value={loading ? 0 : counts.buzz}
          icon={Megaphone}
          variant="primary"
        />
        <StatCard
          title="Active Events"
          value={loading ? 0 : counts.events}
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Question Papers"
          value={loading ? 0 : counts['question-papers']}
          icon={FileQuestion}
          variant="success"
        />
        <StatCard
          title="Exam Circulars"
          value={loading ? 0 : counts['exam-circulars']}
          icon={FileText}
          variant="danger"
        />
        <StatCard
          title="E-Magazines"
          value={loading ? 0 : counts.magazines}
          icon={BookOpen}
          variant="primary"
        />
      </div>
    </div>
  );
}
