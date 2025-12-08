"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MagazineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: { id: string; url: string } | null;
  onSuccess?: () => void;
}

export const MagazineModal = ({ open, onOpenChange, editItem, onSuccess }: MagazineModalProps) => {

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      
      setUrl(editItem.url);
    } else {
 
      setUrl('');
    }
  }, [editItem, open]);

  const handleSubmit = async () => {
    if (!url) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (editItem) {
        // Update
        await updateDoc(doc(db, 'magazines', editItem.id), {
          url,
          updatedAt: serverTimestamp(),
        });
        toast.success("Magazine updated successfully");
      } else {
        // Create
        await addDoc(collection(db, 'magazines'), {
         
          url,
          createdAt: serverTimestamp(),
        });
        toast.success("Magazine added successfully");
      }
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(editItem ? "Failed to update magazine" : "Failed to add magazine");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!editItem) {
       
        setUrl('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Magazine' : 'Add Magazine'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Magazine URL</Label>
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://..."
            />
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
