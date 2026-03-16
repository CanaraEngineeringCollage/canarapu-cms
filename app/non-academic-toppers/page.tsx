"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Image, Loader2, Trash2, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import Pagination from "@/components/ui/Pagination";
import { NonAcademicTopperModal } from "@/components/toppers/NonAcademicTopperModal";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface NonAcademicTopper {
  id: number;
  imageUrl: string;
  createdAt: string;
}

const NonAcademicToppersPage = () => {
  const [toppers, setToppers] = useState<NonAcademicTopper[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<NonAcademicTopper | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NonAcademicTopper | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/non-academic-toppers?page=${page}&limit=${limit}`);
      const data = await res.json();
      setToppers(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load non-academic toppers");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPage(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage, fetchPage]);

  const openEdit = (item: NonAcademicTopper) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const confirmDelete = (item: NonAcademicTopper) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const deleteTopper = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/non-academic-toppers/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Non-academic topper deleted");
      fetchPage(currentPage, rowsPerPage);
    } catch {
      toast.error("Delete failed");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="page-header flex items-center gap-3">
              <Image className="h-8 w-8 text-info" /> Non-Academic Toppers
            </h1>
            <p className="page-description">Manage non-academic achievement gallery.</p>
          </div>
          <Button
            className="btn-primary-gradient gap-2"
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-info" />
          </div>
        ) : toppers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Image className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No non-academic toppers</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add the first non-academic achievement image.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {toppers.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card shadow overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative w-full aspect-video bg-muted">
                    <img src={item.imageUrl} alt="Non-academic achievement" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">Added: {format(new Date(item.createdAt), "MMM d, yyyy")}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setViewImageUrl(item.imageUrl)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </div>

      <NonAcademicTopperModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editItem={editItem}
        onSuccess={() => fetchPage(currentPage, rowsPerPage)}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={deleteTopper}
        title="Delete Non-Academic Topper"
        description="Are you sure you want to delete this image?"
      />

      <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
        <DialogContent className="max-w-2xl">
          {viewImageUrl && <img src={viewImageUrl} alt="Full view" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NonAcademicToppersPage;
