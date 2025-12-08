"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  File,
  Loader2,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

/* ---------------------------------------------------
   ADD CIRCULAR MODAL
--------------------------------------------------- */
const AddCircularModal = ({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, file: File) => void;
  loading: boolean;
}) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }
    onSubmit(title.trim(), file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Exam Circular</h2>

        <label className="block mb-2 text-sm font-medium">Circular Title</label>
        <Input
          placeholder="Enter circular title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

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

          <Button disabled={loading} onClick={submit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------
   MAIN PAGE COMPONENT
--------------------------------------------------- */

interface Circular {
  id: string;
  title: string;
  fileName: string;
  pdfUrl: string;
  storagePath: string;
  createdAt: any;
}

const ExamCircularsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Circular | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "exam-circulars"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as Circular[];

      setCirculars(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const uploadCircular = async (title: string, file: File) => {
    setUploading(true);

    try {
      const storagePath = `exam-circulars/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file);
      const pdfUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "exam-circulars"), {
        title,
        fileName: file.name,
        pdfUrl,
        storagePath,
        createdAt: serverTimestamp(),
      });

      toast.success("Circular uploaded successfully");
      setAddModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload circular");
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
      await deleteObject(ref(storage, itemToDelete.storagePath));
      await deleteDoc(doc(db, "exam-circulars", itemToDelete.id));

      toast.success("Circular deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredCirculars = circulars.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
            <FileText className="h-8 w-8 text-warning" />
            Exam Circulars
          </h1>
          <p className="page-description">Manage uploaded exam circulars.</p>
        </div>

        <Button
          className="btn-primary-gradient text-warning-foreground gap-2"
          onClick={() => setAddModalOpen(true)}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Upload Circular
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search circulars..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-warning"></div>
        </div>
      ) : filteredCirculars.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No circulars found.
        </div>
      ) : (
        <div className="data-table">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Title</th>
                <th className="table-cell">File Name</th>
                <th className="table-cell">Created</th>
                <th className="table-cell text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCirculars.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded bg-warning/10">
                        <File className="h-4 w-4 text-warning" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>

                  <td className="table-cell text-muted-foreground">
                    {item.fileName}
                  </td>

                  <td className="table-cell text-muted-foreground">
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleDateString()
                      : "Just now"}
                  </td>

                  <td className="table-cell">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(item.pdfUrl, "_blank")}
                      >
                        <SquareArrowOutUpRight  className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => confirmDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Circular Modal */}
      <AddCircularModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={uploadCircular}
        loading={uploading}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={deleteCircular}
        title="Delete Circular"
        description={`Are you sure you want to delete "${itemToDelete?.title}"?`}
      />
    </div>
  );
};

export default ExamCircularsPage;
