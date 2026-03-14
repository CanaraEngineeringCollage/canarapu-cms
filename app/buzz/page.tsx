"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateBuzzModal } from "@/components/buzz/CreateBuzzModal";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { toast } from "sonner";
import Pagination from "@/components/ui/Pagination";

interface BuzzItem {
 id: number;
 name: string;
 category: string;
 date: string;
 content?: string;
 design?: any;
 createdAt?: string;
}

// SAFEGUARD: Replaced node-html-parser with native DOMParser
const extractContent = (html?: string) => {
 if (!html) return { title: "No Title", excerpt: "No description", image: "/placeholder.jpg" };
 
 // Guard against Server-Side Rendering (DOMParser is browser-only)
 if (typeof window === "undefined") {
   return { title: "Loading...", excerpt: "Loading...", image: "/placeholder.jpg" };
 }

 try {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return {
   title: doc.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() || "No Title",
   excerpt: doc.querySelector("p")?.textContent?.trim() || "No description",
   image: doc.querySelector("img")?.getAttribute("src") || "/placeholder.jpg",
  };
 } catch {
  return { title: "Invalid HTML", excerpt: "", image: "/placeholder.jpg" };
 }
};

const BuzzPage = () => {
 const [isCreateOpen, setIsCreateOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<BuzzItem | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [itemToDelete, setItemToDelete] = useState<number | null>(null);

 const [filterCategory, setFilterCategory] = useState("all");
 const [availableCategories, setAvailableCategories] = useState<string[]>([]);
 const [searchTerm, setSearchTerm] = useState("");

 const [buzzItems, setBuzzItems] = useState<BuzzItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [totalPages, setTotalPages] = useState(1);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const [currentPage, setCurrentPage] = useState(1);

 const fetchPage = useCallback(async (page: number, limit: number) => {
  setLoading(true);
  try {
   const res = await fetch(`/api/buzz?page=${page}&limit=${limit}`);
   const data = await res.json();
   setBuzzItems(data.items ?? []);
   setTotalPages(data.totalPages ?? 1);
  } catch {
   toast.error("Failed to load buzz");
  }
  setLoading(false);
 }, []);

 useEffect(() => {
  fetchPage(currentPage, rowsPerPage);
 }, [currentPage, rowsPerPage, fetchPage]);

 const fetchCategories = useCallback(async () => {
  try {
   const res = await fetch("/api/buzz/categories");
   if (res.ok) {
    const data = await res.json();
    // SAFEGUARD: Ensure data is an array before setting
    if (Array.isArray(data)) {
      setAvailableCategories(data.filter(Boolean));
    }
   }
  } catch (error) {
   console.error("Failed to load categories", error);
  }
 }, []);

 useEffect(() => {
  fetchCategories();
 }, [fetchCategories]);

 const handlePageChange = (page: number) => setCurrentPage(page);

 const handleRowsChange = (rows: number) => {
  setRowsPerPage(rows);
  setCurrentPage(1);
 };

 const confirmDelete = (id: number) => {
  setItemToDelete(id);
  setDeleteModalOpen(true);
 };

 const handleDelete = async () => {
  if (!itemToDelete) return;
  try {
   const res = await fetch(`/api/buzz/${itemToDelete}`, { method: "DELETE" });
   if (!res.ok) throw new Error();
   toast.success("Buzz deleted");
   fetchPage(currentPage, rowsPerPage);
   setDeleteModalOpen(false);
   setItemToDelete(null);
  } catch {
   toast.error("Failed to delete");
  }
 };

 const handleEdit = async (item: BuzzItem) => {
  try {
   const res = await fetch(`/api/buzz/${item.id}`);
   if (!res.ok) throw new Error();
   const fullItem = await res.json();
   setEditingItem(fullItem);
   setIsCreateOpen(true);
  } catch {
   toast.error("Failed to load buzz for editing");
  }
 };

 const handleCreate = () => {
  setEditingItem(null);
  setIsCreateOpen(true);
 };

 const filteredItems = buzzItems
  .filter((item) => (filterCategory === "all" ? true : item.category === filterCategory))
  // SAFEGUARD: Added optional chaining (item.name?.toLowerCase())
  .filter((item) =>
   searchTerm.trim() ? item.name?.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

 return (
  <div className="p-6 space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h1 className="page-header flex items-center gap-3">
      <Megaphone className="h-8 w-8 text-primary" />
      Buzz
     </h1>
     <p className="text-muted-foreground">Manage announcements and buzz items.</p>
    </div>
    <Button className="gap-2" onClick={handleCreate}>
     <Plus className="h-4 w-4" />
     Create Buzz
    </Button>
   </div>

   {/* Filters */}
   <div className="flex items-center gap-4">
    <div className="relative flex-1 max-w-sm">
     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
     <Input
      placeholder="Search buzz..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>

    <Select value={filterCategory} onValueChange={setFilterCategory}>
     <SelectTrigger className="w-[180px]">
      <Filter className="mr-2 h-4 w-4" />
      <SelectValue placeholder="Category" />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="all">All</SelectItem>
      {availableCategories.map(cat => (
         <SelectItem key={cat} value={cat}>
           {cat.charAt(0).toUpperCase() + cat.slice(1)}
         </SelectItem>
      ))}
     </SelectContent>
    </Select>
   </div>

   {/* Loading */}
   {loading ? (
    <div className="flex items-center justify-center h-40">
     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
   ) : filteredItems.length === 0 ? (
    <div className="flex flex-col items-center justify-center border border-dashed p-8 rounded-lg">
     <Megaphone className="h-10 w-10 text-primary" />
     <p className="mt-4 text-muted-foreground">No buzz items found</p>
    </div>
   ) : (
    <div className="space-y-6">
     {filteredItems.map((item) => {
      const { title, excerpt, image } = extractContent(item.content);
      return (
       <div key={item.id} className="rounded-lg border bg-card p-6 shadow-sm">
        <table className="w-full border-collapse">
         <thead>
          <tr>
           <th className="border p-2">Image</th>
           <th className="border p-2">Title</th>
           <th className="border p-2">Description</th>
           <th className="border p-2">Category</th>
           <th className="border p-2">Event Date</th>
          </tr>
         </thead>
         <tbody>
          <tr className="text-center">
           <td className="border flex items-center justify-center p-2">
            <img src={image} alt={title} className="w-32 h-20 object-cover rounded-md" />
           </td>
           <td className="border p-2 align-top">
            <h2 className="text-lg font-semibold">{item.name}</h2>
           </td>
           <td className="border p-2 align-top">
            <p className="text-sm text-muted-foreground">{excerpt}</p>
           </td>
           <td className="border p-2 align-top capitalize">{item.category}</td>
           <td className="border p-2 align-top">
            {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
           </td>
          </tr>
         </tbody>
        </table>

        <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
         <div>
          Created:&nbsp;
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
         </div>
         <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
          <Button variant="outline" size="sm" onClick={() => confirmDelete(item.id)}>Delete</Button>
         </div>
        </div>
       </div>
      );
     })}
    </div>
   )}

   <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    rowsPerPage={rowsPerPage}
    onPageChange={handlePageChange}
    onRowsPerPageChange={handleRowsChange}
   />

   <CreateBuzzModal
    open={isCreateOpen}
    onOpenChange={setIsCreateOpen}
    editItem={editingItem}
    onSuccess={() => fetchPage(currentPage, rowsPerPage)}
   />

   <DeleteConfirmationModal
    open={deleteModalOpen}
    onOpenChange={setDeleteModalOpen}
    onConfirm={handleDelete}
    title="Delete Buzz?"
    description="This action cannot be undone."
   />
  </div>
 );
};

export default BuzzPage;