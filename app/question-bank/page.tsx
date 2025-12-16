"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileQuestion, Trash2, File, Loader2, SquareArrowOutUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, addDoc, serverTimestamp, doc } from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import Pagination from "@/components/ui/Pagination";

/* --------------------------------------------------
   Add Question Paper Modal
-------------------------------------------------- */
interface AddQuestionPaperModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (subject: string, category: string, file: File) => void;
  loading: boolean;
}

const AddQuestionPaperModal = ({ open, onClose, onSubmit, loading }: AddQuestionPaperModalProps) => {
  const [subjectName, setSubjectName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setSubjectName("");
      setCategory("");
      setFile(null);
    }
  }, [open]);

  const handleUpload = () => {
    if (!subjectName.trim()) return toast.error("Subject name is required.");
    if (!category) return toast.error("Please select a category.");
    if (!file) return toast.error("Select a PDF file.");
    onSubmit(subjectName.trim(), category, file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add Question Paper</h2>

        <label className="block mb-2 text-sm font-medium">Subject Name</label>
        <Input placeholder="Enter subject name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />

        <label className="block mt-4 mb-2 text-sm font-medium">Category</label>
        <Select value={category} onValueChange={setCategory}>
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
   Main Page
-------------------------------------------------- */
interface QuestionPaper {
  id: string;
  subjectName: string;
  category: string;
  fileName: string;
  pdfUrl: string;
  storagePath: string;
  createdAt: any;
}

const QuestionBankPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  /* Pagination States */
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([]);

  /* Modals */
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<QuestionPaper | null>(null);

  /* ------------------------------------------
     Count total documents
  ------------------------------------------ */
  useEffect(() => {
    async function getCount() {
      const snap = await getDocs(collection(db, "question-papers"));
      setTotalPages(Math.ceil(snap.size / rowsPerPage));
    }
    getCount();
  }, [rowsPerPage]);

  /* ------------------------------------------
     Fetch Page
  ------------------------------------------ */
  async function fetchPage(pageNumber: number) {
    setLoading(true);

    try {
      let q;

      if (pageNumber === 1) {
        q = query(collection(db, "question-papers"), orderBy("createdAt", "desc"), limit(rowsPerPage));
      } else {
        const cursor = pageCursors[pageNumber - 2];
        if (!cursor) return;
        q = query(collection(db, "question-papers"), orderBy("createdAt", "desc"), startAfter(cursor), limit(rowsPerPage));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as QuestionPaper[];

      setPapers(docs);

      const lastVisible = snap.docs[snap.docs.length - 1];
      if (lastVisible) {
        const newCursors = [...pageCursors];
        newCursors[pageNumber - 1] = lastVisible;
        setPageCursors(newCursors);
      }
    } catch (err) {
      toast.error("Failed to load papers");
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage, rowsPerPage]);

  /* ------------------------------------------
     Upload Paper
  ------------------------------------------ */
  const uploadQuestionPaper = async (subject: string, category: string, file: File) => {
    setUploading(true);

    try {
      const storagePath = `question-bank/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "question-papers"), {
        subjectName: subject,
        category: category,
        fileName: file.name,
        pdfUrl: downloadURL,
        storagePath,
        createdAt: serverTimestamp(),
      });

      toast.success("Uploaded successfully");
      setAddModalOpen(false);
      fetchPage(currentPage);
    } catch {
      toast.error("Upload failed");
    }

    setUploading(false);
  };

  /* ------------------------------------------
     Delete Paper
  ------------------------------------------ */
  const confirmDelete = (item: QuestionPaper) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteObject(ref(storage, itemToDelete.storagePath));
      await deleteDoc(doc(db, "question-papers", itemToDelete.id));
      toast.success("Deleted successfully");
      fetchPage(currentPage);
    } catch {
      toast.error("Failed to delete");
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  /* ------------------------------------------
     Search Filter
  ------------------------------------------ */
  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || p.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  /* ------------------------------------------
     UI Rendering (TABLE View)
  ------------------------------------------ */
  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="page-header font-serif flex items-center gap-3">
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

        {/* Search and Filter */}
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

        {/* Table Output */}
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
                    <th className="border p-3 text-center">PDF Name</th>
                    <th className="border p-3 text-center">Uploaded On</th>
                    <th className="border p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPapers.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="border p-3 text-center">{item.subjectName}</td>

                      <td className="border p-3 text-center">
                        {item.category === "firstYear" ? "First Year" : item.category === "secondYear" ? "Second Year" : item.category || "—"}
                      </td>

                      <td className="border p-3 text-center">{item.fileName}</td>

                      <td className="border p-3 text-center">{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "—"}</td>

                      <td className="border p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => window.open(item.pdfUrl, "_blank")}>
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

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
                setPageCursors([]);
              }}
            />
          </>
        )}

        {/* Upload Modal */}

        {/* Delete Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDelete}
          title="Delete Question Paper"
          description={`Are you sure you want to delete "${itemToDelete?.fileName}"?`}
        />
      </div>
      <AddQuestionPaperModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={uploadQuestionPaper} loading={uploading} />
    </div>
  );
};

export default QuestionBankPage;
