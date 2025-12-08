"use client";

import { useState } from 'react';
import { Settings, Shield, Database, Key, Save, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });

  const handleSaveConfig = () => {
    // Save to localStorage or env (in production, use proper secrets management)
    localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
    toast.success('Firebase configuration saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="page-header font-serif flex items-center gap-3">
          <Settings className="h-8 w-8 text-muted-foreground" />
          Settings
        </h1>
        <p className="page-description">
          Configure your Firebase backend and manage application settings.
        </p>
      </div>

      <Tabs defaultValue="firebase" className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="firebase" className="gap-2">
            <Database className="h-4 w-4" />
            Firebase
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Firebase Configuration */}
        <TabsContent value="firebase" className="mt-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Firebase Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your Firebase project configuration values.
                </p>
              </div>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Open Firebase Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="AIza..."
                  value={firebaseConfig.apiKey}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authDomain">Auth Domain</Label>
                <Input
                  id="authDomain"
                  placeholder="your-project.firebaseapp.com"
                  value={firebaseConfig.authDomain}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  placeholder="your-project-id"
                  value={firebaseConfig.projectId}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageBucket">Storage Bucket</Label>
                <Input
                  id="storageBucket"
                  placeholder="your-project.appspot.com"
                  value={firebaseConfig.storageBucket}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                <Input
                  id="messagingSenderId"
                  placeholder="123456789"
                  value={firebaseConfig.messagingSenderId}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, messagingSenderId: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appId">App ID</Label>
                <Input
                  id="appId"
                  placeholder="1:123456789:web:abc123"
                  value={firebaseConfig.appId}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveConfig} className="btn-primary-gradient gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </div>

          {/* Setup Checklist */}
          <div className="mt-6 rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Setup Checklist
            </h3>
            <div className="space-y-3">
              {[
                'Create Firebase project',
                'Enable Firestore Database',
                'Enable Authentication (Email/Password)',
                'Enable Firebase Storage',
                'Upgrade to Blaze Plan',
                'Add Security Rules',
                'Create Admin User',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Security Rules Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium text-foreground">Firestore Rules</p>
                  <p className="text-sm text-muted-foreground">5 collections configured</p>
                </div>
                <span className="badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium text-foreground">Storage Rules</p>
                  <p className="text-sm text-muted-foreground">2 folders protected</p>
                </div>
                <span className="badge-success">Active</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/src/docs/FIREBASE_SETUP.md"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View complete security rules documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="mt-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Environment Variables
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These environment variables should be set in your deployment environment for production.
            </p>
            <pre className="rounded-lg bg-sidebar p-4 text-sm text-sidebar-foreground overflow-x-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
