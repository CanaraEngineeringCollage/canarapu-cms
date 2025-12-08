"use client";

import { useEffect, useState } from "react";
import { parse } from "node-html-parser";
import {
  Plus, Search, Filter, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CreateBuzzModal } from "@/components/buzz/CreateBuzzModal";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";


import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Pagination from "@/components/ui/Pagination";

interface BuzzItem {
  id: string;
  name: string;
  category: string;
  date: string;
  content?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

// Extract content helpers
const extractContent = (html?: string) => {
  if (!html) return { title: "No Title", excerpt: "No description", image: "/placeholder.jpg" };
  try {
    const root = parse(html);
    return {
      title: root.querySelector("h1,h2,h3,h4,h5,h6")?.text?.trim() || "No Title",
      excerpt: root.querySelector("p")?.text?.trim() || "No description",
      image: root.querySelector("img")?.getAttribute("src") || "/placeholder.jpg",
    };
  } catch {
    return { title: "Invalid HTML", excerpt: "", image: "/placeholder.jpg" };
  }
};

const BuzzPage = () => {
  // UI States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BuzzItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [buzzItems, setBuzzItems] = useState<BuzzItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [pageCursors, setPageCursors] = useState<any[]>([]); // store Firestore cursors

  // ---------------------------------
  // 1️⃣ Count total items once
  // ---------------------------------
  useEffect(() => {
    async function fetchCount() {
      const snapshot = await getDocs(collection(db, "buzz"));
      const totalItems = snapshot.size;
      setTotalPages(Math.ceil(totalItems / rowsPerPage));
    }
    fetchCount();
  }, [rowsPerPage]);

  // ---------------------------------
  // 2️⃣ Fetch a specific page
  // ---------------------------------
  async function fetchPage(page: number) {
    setLoading(true);

    try {
      let q;

      // Page 1: no cursor needed
      if (page === 1) {
        q = query(
          collection(db, "buzz"),
          orderBy("createdAt", "desc"),
          limit(rowsPerPage)
        );
      } else {
        const cursor = pageCursors[page - 2];
        if (!cursor) return;

        q = query(
          collection(db, "buzz"),
          orderBy("createdAt", "desc"),
          startAfter(cursor),
          limit(rowsPerPage)
        );
      }

      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as BuzzItem[];

      setBuzzItems(items);

      // Save cursor for next page
      const last = snapshot.docs[snapshot.docs.length - 1];
      if (last) {
        const newCursors = [...pageCursors];
        newCursors[page - 1] = last;
        setPageCursors(newCursors);
      }

      setLastVisibleDoc(last);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load buzz");
    }

    setLoading(false);
  }

  // Load page on mount & when page changes
  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage, rowsPerPage]);

  // ---------------------------------
  // Pagination change handlers
  // ---------------------------------
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
    setPageCursors([]);
  };

  // ---------------------------------
  // Delete Buzz Item
  // ---------------------------------
  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "buzz", itemToDelete));
      toast.success("Buzz deleted");
      fetchPage(currentPage); // reload page
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (item: BuzzItem) => {
    setEditingItem(item);
    setIsCreateOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsCreateOpen(true);
  };

  // ---------------------------------
  // Apply filters client-side to **fetched page only**
  // ---------------------------------
  const filteredItems = buzzItems
    .filter((item) =>
      filterCategory === "all" ? true : item.category === filterCategory
    )
    .filter((item) =>
      searchTerm.trim()
        ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  // ---------------------------------
  // Render
  // ---------------------------------
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
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
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="cultural">Cultural</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="other">Other</SelectItem>
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
                {/* Table */}
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

                {/* Footer */}
                <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                  <div>
                    Created:&nbsp;
                    {item.createdAt?.seconds
                      ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                      : "—"}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => confirmDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsChange}
      />

      {/* Modals */}
      <CreateBuzzModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        editItem={editingItem}
        onSuccess={() => fetchPage(currentPage)}
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
