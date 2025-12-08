"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Don't show layout on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not loading and no user, don't render content (will redirect)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
      />

      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={logout}
          adminEmail={user?.email || undefined}
        />

        <main className="flex-1 p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border bg-card/50 px-8 py-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Canara Pre University College. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Logged in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
