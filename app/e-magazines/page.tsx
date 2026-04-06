"use client";

import { useEffect, useState, useCallback } from "react";
import {
 Plus, Search, BookOpen, Edit, ExternalLink, Trash2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagazineModal } from "@/components/magazines/MagazineModal";
import Pagination from "@/components/ui/Pagination";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { format } from "date-fns";
import { toast } from "sonner";

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
 const [debouncedSearch, setDebouncedSearch] = useState("");
 const [magazines, setMagazines] = useState<Magazine[]>([]);
 const [loading, setLoading] = useState(true);
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [editItem, setEditItem] = useState<{ id: number; title: string; url: string; year?: string } | null>(null);
 const [itemToDelete, setItemToDelete] = useState<number | null>(null);
 const [deletingId, setDeletingId] = useState<number | null>(null);
 
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [rowsPerPage, setRowsPerPage] = useState(10);

 // Debounce search query
 useEffect(() => {
  const timer = setTimeout(() => {
   setDebouncedSearch(searchQuery);
   setCurrentPage(1); // Reset to page 1 on new search
  }, 500);
  return () => clearTimeout(timer);
 }, [searchQuery]);

 const fetchMagazines = useCallback(async () => {
  try {
   const res = await fetch(`/api/magazines?page=${currentPage}&limit=${rowsPerPage}&search=${encodeURIComponent(debouncedSearch)}`);
   const data = await res.json();
   setMagazines(data.items || []);
   setTotalPages(data.totalPages || 1);
  } catch {
   toast.error("Failed to load magazines");
  } finally {
   setLoading(false);
  }
 }, [currentPage, debouncedSearch, rowsPerPage]);

 useEffect(() => {
  fetchMagazines();
 }, [fetchMagazines]);

 const handleCreate = () => {
  setEditItem(null);
  setIsDialogOpen(true);
 };

 const handleEdit = (magazine: Magazine) => {
  setEditItem({
   id: magazine.id,
   title: magazine.title,
   url: magazine.fileUrl,
   year: magazine.year
  });
  setIsDialogOpen(true);
 };

 const handleDeleteConfirm = async () => {
  if (!itemToDelete) return;
  setDeletingId(itemToDelete);
  try {
   const res = await fetch(`/api/magazines/${itemToDelete}`, { method: "DELETE" });
   if (!res.ok) throw new Error();
   toast.success("Magazine deleted successfully");
   setItemToDelete(null);
   fetchMagazines();
  } catch {
   toast.error("Failed to delete magazine");
  } finally {
   setDeletingId(null);
  }
 };

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
    <div>
     <h1 className="page-header flex items-center gap-3">
      <BookOpen className="h-8 w-8 text-primary" />
      E-Magazines
     </h1>
     <p className="page-description">Manage and view your digital magazines.</p>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
     <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
       placeholder="Search magazines..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="pl-9 h-10 w-full rounded-full border-border/50 bg-card focus-visible:ring-primary/20"
      />
     </div>
     <Button className="btn-primary-gradient gap-2 h-10 rounded-full w-full sm:w-auto" onClick={handleCreate}>
      <Plus className="h-4 w-4" />
      Add Magazine
     </Button>
    </div>

    <MagazineModal
     open={isDialogOpen}
     onOpenChange={setIsDialogOpen}
     editItem={editItem}
     onSuccess={fetchMagazines}
    />

    <DeleteConfirmationModal
     open={!!itemToDelete}
     onOpenChange={(open) => !open && setItemToDelete(null)}
     onConfirm={handleDeleteConfirm}
     title="Delete E-Magazine"
     description="Are you sure you want to delete this e-magazine? This action cannot be undone."
     loading={deletingId === itemToDelete}
    />
   </div>

   {loading ? (
    <div className="flex justify-center py-12">
     <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
   ) : magazines.length > 0 ? (
    <>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {magazines.map((magazine) => (
       <div key={magazine.id} className="rounded-xl border border-border/50 bg-card overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="w-full h-64 bg-muted relative overflow-hidden">
         <iframe src={magazine.fileUrl} className="w-full h-full border-0 pointer-events-none" />
         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <a href={magazine.fileUrl} target="_blank" rel="noopener noreferrer">
           <Button className="btn-primary-gradient gap-2">
            <ExternalLink className="h-4 w-4" /> Read Now
           </Button>
          </a>
         </div>
        </div>
        <div className="p-4">
         <div className="flex justify-between items-start">
          <h3 className="font-semibold text-foreground line-clamp-1">{magazine.title}</h3>
          {magazine.year && (
           <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {magazine.year}
           </span>
          )}
         </div>
         <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
          <span>Added: {magazine.createdAt ? format(new Date(magazine.createdAt), "MMM d, yyyy") : "Just now"}</span>
         </p>
         <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
          <a href={magazine.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
           <ExternalLink className="h-3 w-3" /> View Source
          </a>
          <div className="flex gap-1 -mr-2">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => handleEdit(magazine)}>
            <Edit className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setItemToDelete(magazine.id)} disabled={deletingId === magazine.id}>
            {deletingId === magazine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
           </Button>
          </div>
         </div>
        </div>
       </div>
      ))}
     </div>

     {totalPages > 0 && (
      <div className="mt-8 overflow-hidden rounded-xl border border-border/50">
       <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
       />
      </div>
     )}
    </>
   ) : (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 bg-card/30">
     <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
     <h3 className="text-lg font-medium text-foreground">No magazines found</h3>
     <p className="mt-1 text-sm text-muted-foreground max-w-sm text-center">
      {searchQuery ? "No magazines match your search query." : "You haven't added any e-magazines yet. Click 'Add Magazine' to get started."}
     </p>
     {searchQuery && (
      <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-primary">
       Clear search
      </Button>
     )}
    </div>
   )}
  </div>
 );
};

export default EMagazinesPage;
