"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SettingsPage = () => {
 const { data: session, update } = useSession();
 const [profileData, setProfileData] = useState({
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
 });
 const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

 useEffect(() => {
  if (session?.user) {
   setProfileData((prev) => ({ 
    ...prev, 
    email: session.user?.email || '',
   }));
  }
 }, [session]);

 const handleUpdateProfile = async () => {
  if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
   toast.error('New passwords do not match');
   return;
  }
  
  if (!profileData.currentPassword) {
   toast.error('Current password is required to make changes');
   return;
  }

  try {
   setIsUpdatingProfile(true);
   const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     email: profileData.email,
     currentPassword: profileData.currentPassword,
     newPassword: profileData.newPassword || undefined,
    }),
   });

   const data = await res.json();
   
   if (!res.ok) {
    throw new Error(data.error || 'Failed to update profile');
   }

   toast.success('Profile updated successfully');
   setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
   
   // Force reload NextAuth session by triggering a reload or redirect
   if (profileData.email !== session?.user?.email) {
    await update({ email: profileData.email });
    // Force hard refresh to ensure all UI components see the new email immediately
    window.location.reload();
   }
  } catch (error: any) {
   toast.error(error.message);
  } finally {
   setIsUpdatingProfile(false);
  }
 };

 return (
  <div className="space-y-8 max-w-4xl mx-auto">
   {/* Page Header */}
   <div className="animate-fade-in border-b border-border/50 pb-6">
    <h1 className="page-header flex items-center gap-3">
     <Settings className="h-8 w-8 text-primary" />
     Account Settings
    </h1>
    <p className="page-description mt-2 text-muted-foreground">
     Manage your account preferences and secure your profile.
    </p>
   </div>

   <div className="animate-slide-up">
    {/* Profile Configuration Card */}
    <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
     <div className="mb-8 flex items-center gap-3 border-b border-border/50 pb-4">
      <div className="p-2 bg-primary/10 rounded-lg">
       <User className="h-6 w-6 text-primary" />
      </div>
      <div>
       <h3 className="text-xl font-semibold text-foreground">
        Profile Settings
       </h3>
       <p className="text-sm text-muted-foreground">
        Update your account email and password credentials.
       </p>
      </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
       <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <Input
         id="email"
         type="email"
         className="bg-background"
         value={profileData.email}
         onChange={(e) =>
          setProfileData({ ...profileData, email: e.target.value })
         }
        />
       </div>

       <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
        <Input
         id="currentPassword"
         type="password"
         className="bg-background"
         placeholder="Enter your current password"
         value={profileData.currentPassword}
         onChange={(e) =>
          setProfileData({ ...profileData, currentPassword: e.target.value })
         }
        />
       </div>
      </div>

      <div className="space-y-6 md:border-l md:border-border/50 md:pl-8">
       <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm font-medium">New Password <span className="text-muted-foreground font-normal">(Optional)</span></Label>
        <Input
         id="newPassword"
         type="password"
         className="bg-background"
         placeholder="Enter new password"
         value={profileData.newPassword}
         onChange={(e) =>
          setProfileData({ ...profileData, newPassword: e.target.value })
         }
        />
       </div>

       <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
        <Input
         id="confirmPassword"
         type="password"
         className="bg-background"
         placeholder="Confirm new password"
         value={profileData.confirmPassword}
         onChange={(e) =>
          setProfileData({ ...profileData, confirmPassword: e.target.value })
         }
        />
       </div>
      </div>
     </div>

     <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
      <Button 
       onClick={handleUpdateProfile} 
       disabled={isUpdatingProfile}
       className="btn-primary-gradient gap-2 px-8"
       size="lg"
      >
       <Save className="h-5 w-5" />
       {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile'}
      </Button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default SettingsPage;
