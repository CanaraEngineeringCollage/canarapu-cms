"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, FileQuestion, Trash2, Loader2, SquareArrowOutUpRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import Pagination from "@/components/ui/Pagination";

/* --------------------------------------------------
  Add Question Paper Modal
-------------------------------------------------- */
interface AddQuestionPaperModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (subject: string, year: string, file: File) => void;
  loading: boolean;
}

const AddQuestionPaperModal = ({ open, onClose, onSubmit, loading }: AddQuestionPaperModalProps) => {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setSubject("");
      setYear("");
      setFile(null);
    }
  }, [open]);

  const handleUpload = () => {
    if (!subject.trim()) return toast.error("Subject name is required.");
    if (!year) return toast.error("Please select a category.");
    if (!file) return toast.error("Select a PDF file.");
    onSubmit(subject.trim(), year, file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add Question Paper</h2>
        <label className="block mb-2 text-sm font-medium">Subject Name</label>
        <Input placeholder="Enter subject name" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="block mt-4 mb-2 text-sm font-medium">Category</label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="firstYear">First Year</SelectItem>
            <SelectItem value="secondYear">Second Year</SelectItem>
          </SelectContent>
        </Select>
        <label className="block mt-4 mb-2 text-sm font-medium">Select PDF File</label>
        <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------
  Edit Question Paper Modal
-------------------------------------------------- */
interface EditQuestionPaperModalProps {
  open: boolean;
  onClose: () => void;
  item: QuestionPaper | null;
  onSubmit: (id: number, subject: string, year: string, file?: File | null) => void;
  loading: boolean;
}

const EditQuestionPaperModal = ({ open, onClose, item, onSubmit, loading }: EditQuestionPaperModalProps) => {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    setSubject(item.subject ?? "");
    setYear(item.year ?? "");
    setFile(null);
  }, [open, item]);

  const handleSave = () => {
    if (!item) return;
    if (!subject.trim()) return toast.error("Subject name is required.");
    if (!year) return toast.error("Please select a category.");
    onSubmit(item.id, subject.trim(), year, file);
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Question Paper</h2>
        <label className="block mb-2 text-sm font-medium">Subject Name</label>
        <Input placeholder="Enter subject name" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="block mt-4 mb-2 text-sm font-medium">Category</label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="firstYear">First Year</SelectItem>
            <SelectItem value="secondYear">Second Year</SelectItem>
          </SelectContent>
        </Select>
        <label className="block mt-4 mb-2 text-sm font-medium">Replace PDF File (optional)</label>
        <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------
  Main Page
-------------------------------------------------- */
interface QuestionPaper {
  id: number;
  name: string;
  subject: string;
  year: string;
  fileUrl: string;
  createdAt?: string;
}

const QuestionBankPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<QuestionPaper | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<QuestionPaper | null>(null);

  const fetchPage = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/question-papers?page=${page}&limit=${limit}`);
      const data = await res.json();
      setPapers(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load papers");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPage(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage, fetchPage]);

  const uploadQuestionPaper = async (subject: string, year: string, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("year", year);
      formData.append("file", file);

      const res = await fetch("/api/question-papers", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Uploaded successfully");
      setAddModalOpen(false);
      fetchPage(currentPage, rowsPerPage);
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const [savingEdit, setSavingEdit] = useState(false);
  const openEdit = (item: QuestionPaper) => {
    setEditItem(item);
    setEditModalOpen(true);
  };

  const saveEdit = async (id: number, subject: string, year: string, file?: File | null) => {
    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("year", year);
      if (file) formData.append("file", file);

      const res = await fetch(`/api/question-papers/${id}`, { method: "PUT", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Updated successfully");
      setEditModalOpen(false);
      setEditItem(null);
      fetchPage(currentPage, rowsPerPage);
    } catch {
      toast.error("Update failed");
    }
    setSavingEdit(false);
  };

  const confirmDelete = (item: QuestionPaper) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/question-papers/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted successfully");
      fetchPage(currentPage, rowsPerPage);
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredPapers = papers.filter((p) => {
    const matchesSearch = p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.year === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="page-header flex items-center gap-3">
              <FileQuestion className="h-8 w-8 text-success" />
              Question Bank
            </h1>
            <p className="page-description">Upload and manage question papers.</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} disabled={uploading} className="btn-primary-gradient gap-2">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus />}
            Upload Question Paper
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search papers..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="w-[200px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="firstYear">First Year</SelectItem>
                <SelectItem value="secondYear">Second Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredPapers.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">No papers found.</p>
        ) : (
          <>
            <div className="rounded-lg border bg-card shadow overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="border p-3 text-center">Subject</th>
                    <th className="border p-3 text-center">Category</th>
                    <th className="border p-3 text-center">Uploaded On</th>
                    <th className="border p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPapers.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="border p-3 text-center">{item.subject}</td>
                      <td className="border p-3 text-center">
                        {item.year === "firstYear" ? "First Year" : item.year === "secondYear" ? "Second Year" : item.year || "—"}
                      </td>
                      <td className="border p-3 text-center">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="border p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => window.open(item.fileUrl, "_blank")}>
                            <SquareArrowOutUpRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
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
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          </>
        )}

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDelete}
          title="Delete Question Paper"
          description="Are you sure you want to delete this question paper?"
        />
      </div>
      <AddQuestionPaperModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={uploadQuestionPaper} loading={uploading} />
      <EditQuestionPaperModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditItem(null);
        }}
        item={editItem}
        onSubmit={saveEdit}
        loading={savingEdit}
      />
    </div>
  );
};

export default QuestionBankPage;
