"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NonAcademicTopperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: { id: number; imageUrl: string } | null;
  onSuccess?: () => void;
}

export const NonAcademicTopperModal = ({ open, onOpenChange, editItem, onSuccess }: NonAcademicTopperModalProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setImagePreview(editItem.imageUrl);
      setImageFile(null);
    } else {
      setImageFile(null);
      setImagePreview("");
    }
  }, [editItem, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!editItem && !imageFile) {
      toast.error("Image is required");
      return;
    }
    if (editItem && !imageFile) {
      toast.error("Please select a new image to update");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = editItem ? `/api/non-academic-toppers/${editItem.id}` : "/api/non-academic-toppers";
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error();

      toast.success(editItem ? "Non-academic topper updated successfully" : "Non-academic topper added successfully");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch {
      toast.error(editItem ? "Failed to update non-academic topper" : "Failed to add non-academic topper");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Non-Academic Topper" : "Add Non-Academic Topper"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Achievement Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md" />}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="btn-primary-gradient">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : editItem ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
