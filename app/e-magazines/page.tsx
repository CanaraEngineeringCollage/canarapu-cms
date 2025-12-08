"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, BookOpen, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MagazineModal } from '@/components/magazines/MagazineModal';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';

const EMagazinesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string; name: string; url: string } | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'magazines'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMagazines(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (item: any) => {
    setEditItem({ id: item.id, name: item.name, url: item.url });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'magazines', deleteId));
      toast.success("Magazine deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting magazine: ", error);
      toast.error("Failed to delete magazine");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredMagazines = magazines.filter((magazine) =>
    magazine.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            E-Magazines
          </h1>
          <p className="page-description">
            Manage external magazine links. No file uploads - URLs only.
          </p>
        </div>

        <Button className="btn-primary-gradient gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Add Magazine
        </Button>

        <MagazineModal 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            editItem={editItem}
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

      {/* Search */}
      <div className="relative max-w-md animate-slide-up">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search magazines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        {filteredMagazines.map((magazine) => (
          <div
            key={magazine.id}
            className="group rounded-xl border border-border/50 bg-card overflow-hidden card-hover"
          >
            {/* Magazine Preview Header */}
            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>

            <div className="p-4">
              <h3 className="font-medium text-foreground line-clamp-1">
                {magazine.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Added: {magazine.createdAt?.seconds ? format(new Date(magazine.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={magazine.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="btn-primary-gradient w-full gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>
                </a>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEdit(magazine)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(magazine.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMagazines.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No magazines yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first e-magazine link to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default EMagazinesPage;
