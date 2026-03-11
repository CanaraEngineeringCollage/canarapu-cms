"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, FileText, Loader2, Trash2, SquareArrowOutUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import Pagination from "@/components/ui/Pagination";

/* ---------------- Add Modal ---------------- */
interface AddCircularModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, file: File) => void;
  loading: boolean;
}

const AddCircularModal = ({ open, onClose, onSubmit, loading }: AddCircularModalProps) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!file) return toast.error("Please select a PDF file");
    onSubmit(title, file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 h-full backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Exam Circular</h2>
        <Input placeholder="Enter circular title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="block mt-4 mb-2 text-sm font-medium">Select PDF File</label>
        <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={submit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main Page ---------------- */
interface Circular {
  id: number;
  title: string;
  fileUrl: string;
  createdAt?: string;
}

const ExamCircularsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Circular | null>(null);

  const fetchPage = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exam-circulars?page=${page}&limit=${limit}`);
      const data = await res.json();
      setCirculars(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load circulars");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPage(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage, fetchPage]);

  const uploadCircular = async (title: string, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      const res = await fetch("/api/exam-circulars", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Circular uploaded");
      setAddModalOpen(false);
      fetchPage(currentPage, rowsPerPage);
    } catch {
      toast.error("Failed to upload");
    }
    setUploading(false);
  };

  const confirmDelete = (item: Circular) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const deleteCircular = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/exam-circulars/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Circular deleted");
      fetchPage(currentPage, rowsPerPage);
    } catch {
      toast.error("Delete failed");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredCirculars = circulars.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="page-header font-serif flex items-center gap-3">
              <FileText className="h-8 w-8 text-warning" /> Exam Circulars
            </h1>
            <p className="page-description">Manage uploaded exam circulars.</p>
          </div>
          <Button className="btn-primary-gradient gap-2" onClick={() => setAddModalOpen(true)} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus />}
            Upload Circular
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search circulars..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-warning" />
          </div>
        ) : filteredCirculars.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No circulars found.</p>
        ) : (
          <>
            <div className="rounded-lg border bg-card shadow overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="border p-3 text-center">Title</th>
                    <th className="border p-3 text-center">Created</th>
                    <th className="border p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCirculars.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="border p-3 text-center">{item.title}</td>
                      <td className="border p-3 text-center">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="border p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => window.open(item.fileUrl, "_blank")}>
                            <SquareArrowOutUpRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
            />
          </>
        )}

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={deleteCircular}
          title="Delete Circular"
          description={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        />
      </div>
      <AddCircularModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={uploadCircular}
        loading={uploading}
      />
    </div>
  );
};

export default ExamCircularsPage;
