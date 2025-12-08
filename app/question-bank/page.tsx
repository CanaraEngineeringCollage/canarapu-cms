"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, FileQuestion, Download, Trash2, File, Loader2, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';

/* --------------------------------------------------
   Modal for Adding Question Paper
-------------------------------------------------- */
const AddQuestionPaperModal = ({
  open,
  onClose,
  onSubmit,
  loading
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (subject: string, file: File) => void;
  loading: boolean;
}) => {
  const [subjectName, setSubjectName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!subjectName.trim()) {
      toast.error("Subject name is required.");
      return;
    }
    if (!file) {
      toast.error("Select a PDF file.");
      return;
    }

    onSubmit(subjectName.trim(), file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add Question Paper</h2>

        {/* Subject Name */}
        <label className="block mb-2 text-sm font-medium">Subject Name</label>
        <Input
          placeholder="Enter subject name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />

        {/* PDF Upload */}
        <label className="block mt-4 mb-2 text-sm font-medium">Select PDF File</label>
        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleUpload} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------
   Main Page Component
-------------------------------------------------- */

interface QuestionPaper {
  id: string;
  subjectName: string;
  fileName: string;
  pdfUrl: string;
  storagePath: string;
  createdAt: any;
}

const QuestionBankPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<QuestionPaper | null>(null);

  /* Fetch Papers */
  useEffect(() => {
    const q = query(collection(db, 'question-papers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionPaper[];

      setPapers(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* Upload Handler */
  const uploadQuestionPaper = async (subject: string, file: File) => {
    setUploading(true);
    try {
      const storagePath = `question-bank/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      const snap = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snap.ref);

      await addDoc(collection(db, "question-papers"), {
        subjectName: subject,
        fileName: file.name,
        pdfUrl: downloadURL,
        storagePath,
        createdAt: serverTimestamp(),
      });

      toast.success("Question paper uploaded successfully");
      setAddModalOpen(false);

    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }

    setUploading(false);
  };

  /* Delete Handler */
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
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  /* Search Filter */
  const filteredPapers = papers.filter(paper =>
    paper.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
            <FileQuestion className="h-8 w-8 text-success" />
            Question Bank
          </h1>
          <p className="page-description">Upload and manage question papers.</p>
        </div>

        <Button
          className="btn-primary-gradient gap-2"
          onClick={() => setAddModalOpen(true)}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Upload Question Paper
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search papers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary"></div>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No question papers found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPapers.map((item) => (
            <div key={item.id} className="group rounded-xl border p-4 bg-card">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <File className="h-6 w-6 text-success" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.subjectName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.fileName}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(item.pdfUrl, "_blank")}
                >
                  <SquareArrowOutUpRight className="h-4 w-4" />
                  Open
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={() => confirmDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddQuestionPaperModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={uploadQuestionPaper}
        loading={uploading}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        description={`Are you sure you want to delete "${itemToDelete?.fileName}"? This cannot be undone.`}
      />
    </div>
  );
};

export default QuestionBankPage;
