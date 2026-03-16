"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AcademicTopperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: { id: number; name: string; year: string; imageUrl: string } | null;
  onSuccess?: () => void;
}

export const AcademicTopperModal = ({ open, onOpenChange, editItem, onSuccess }: AcademicTopperModalProps) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setYear(editItem.year);
      setImagePreview(editItem.imageUrl);
      setImageFile(null);
    } else {
      setName("");
      setYear("");
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
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!year.trim()) {
      toast.error("Year is required");
      return;
    }
    if (!editItem && !imageFile) {
      toast.error("Image is required for new entries");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("year", year);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = editItem ? `/api/academic-toppers/${editItem.id}` : "/api/academic-toppers";
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error();

      toast.success(editItem ? "Academic topper updated successfully" : "Academic topper added successfully");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch {
      toast.error(editItem ? "Failed to update academic topper" : "Failed to add academic topper");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setYear("");
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Academic Topper" : "Add Academic Topper"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Achievement Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., II Top Rank Achievers" />
          </div>
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g., 2024-2025" />
          </div>
          <div className="space-y-2">
            <Label>Student Image</Label>
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
