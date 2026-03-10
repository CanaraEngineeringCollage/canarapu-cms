"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Search, BookOpen, Edit, Trash2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagazineModal } from "@/components/magazines/MagazineModal";
import { format } from "date-fns";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface Magazine {
  id: number;
  title: string;
  fileUrl: string;
  coverUrl?: string;
  year?: string;
  createdAt?: string;
}

const EMagazinesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; url: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMagazine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/magazines?page=1&limit=1");
      const data = await res.json();
      setMagazine(data.items?.[0] ?? null);
    } catch {
      toast.error("Failed to load magazine");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMagazine();
  }, [fetchMagazine]);

  const handleCreateOrEdit = () => {
    setEditItem(magazine ? { id: magazine.id, url: magazine.fileUrl } : null);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (!magazine?.id) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!magazine?.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/magazines/${magazine.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Magazine deleted successfully");
      setMagazine(null);
      setIsDeleteModalOpen(false);
    } catch {
      toast.error("Failed to delete magazine");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            E-Magazine
          </h1>
          <p className="page-description">Only one magazine is stored.</p>
        </div>

        <Button className="btn-primary-gradient gap-2" onClick={handleCreateOrEdit}>
          <Plus className="h-4 w-4" />
          {magazine ? "Edit Magazine" : "Add Magazine"}
        </Button>

        <MagazineModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editItem={editItem}
          onSuccess={fetchMagazine}
        />

        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={confirmDelete}
          loading={isDeleting}
          title="Delete Magazine"
          description="Are you sure you want to delete this magazine? This action cannot be undone."
        />
      </div>

      {magazine ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="w-full h-80 bg-muted">
            <iframe src={magazine.fileUrl} className="w-full h-full border-0" />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-foreground line-clamp-1">{magazine.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Added:{" "}
              {magazine.createdAt
                ? format(new Date(magazine.createdAt), "MMM d, yyyy")
                : "Just now"}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a href={magazine.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="btn-primary-gradient w-full gap-2">
                  <ExternalLink className="h-4 w-4" /> Open
                </Button>
              </a>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleCreateOrEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No magazine added</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add the first e-magazine link.</p>
          </div>
        )
      )}
    </div>
  );
};

export default EMagazinesPage;
