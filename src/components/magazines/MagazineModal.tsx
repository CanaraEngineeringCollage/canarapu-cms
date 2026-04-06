"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MagazineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: { id: number; title: string; url: string; year?: string } | null;
  onSuccess?: () => void;
}

export const MagazineModal = ({ open, onOpenChange, editItem, onSuccess }: MagazineModalProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setUrl(editItem.url || '');
      setYear(editItem.year || '');
    } else {
      setTitle('');
      setUrl('');
      setYear('');
    }
  }, [editItem, open]);

  const handleSubmit = async () => {
    if (!url) {
      toast.error("Magazine URL is required");
      return;
    }
    if (!year) {
      toast.error("Magazine year is required");
      return;
    }

    setLoading(true);
    try {
      if (editItem) {
        // PUT request for edit
        const res = await fetch(`/api/magazines/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title || url, fileUrl: url, year: year || null }),
        });
        if (!res.ok) throw new Error();
      } else {
        // POST new magazine with URL as fileUrl
        const res2 = await fetch('/api/magazines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title || url, fileUrl: url, year: year || null }),
        });
        if (!res2.ok) throw new Error();
      }

      toast.success(editItem ? "Magazine updated successfully" : "Magazine added successfully");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch {
      toast.error(editItem ? "Failed to update magazine" : "Failed to add magazine");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setYear('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Magazine' : 'Add Magazine'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Magazine Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Magazine name" />
          </div>
          <div className="space-y-2">
            <Label>Magazine URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="btn-primary-gradient">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (editItem ? 'Update' : 'Add Magazine')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
