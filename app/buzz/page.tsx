"use client";

import { useEffect, useState } from "react";
import { parse } from "node-html-parser";
import {
  Plus,
  Search,
  Filter,
  Megaphone,
  Edit,
  Trash2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateBuzzModal } from "@/components/buzz/CreateBuzzModal";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface BuzzItem {
  id: string;
  name: string;
  category: string;
  date: string;
  content?: string;
  design?: any;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

// Extract image, title, and excerpt from HTML
const extractContent = (html?: string) => {
  if (!html) {
    return {
      title: "No Title",
      excerpt: "No description available",
      image: "/placeholder.jpg",
    };
  }

  try {
    const root = parse(html);
    const firstHeading = root.querySelector("h1,h2,h3,h4,h5,h6")?.text?.trim();
    const firstP = root.querySelector("p")?.text?.trim();
    const firstImg = root.querySelector("img")?.getAttribute("src");

    return {
      title: firstHeading || "No Title",
      excerpt: firstP || "No description available",
      image: firstImg || "/placeholder.jpg",
    };
  } catch {
    return {
      title: "Invalid HTML",
      excerpt: "",
      image: "/placeholder.jpg",
    };
  }
};

const BuzzPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [buzzItems, setBuzzItems] = useState<BuzzItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BuzzItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Fetch Buzz
  useEffect(() => {
    const q = query(collection(db, "buzz"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BuzzItem[];
        setBuzzItems(items);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load buzz");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteDoc(doc(db, "buzz", itemToDelete));
      toast.success("Buzz deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete buzz");
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

  const filteredItems = buzzItems
    .filter((item) =>
      filterCategory === "all" ? true : item.category === filterCategory
    )
    .filter((item) =>
      searchTerm.trim()
        ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            
            Buzz</h1>
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
              <div
                key={item.id}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
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
                    <tr>
                      <td className="border p-2">
                        <img
                          src={image}
                          alt={title}
                          className="w-32 h-20 object-cover rounded-md"
                        />
                      </td>

                      <td className="border p-2 align-top">
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                      </td>

                      <td className="border p-2 align-top">
                        <p className="text-sm text-muted-foreground">{excerpt}</p>
                      </td>

                      <td className="border p-2 align-top capitalize">
                        {item.category}
                      </td>

                      <td className="border p-2 align-top">
                        {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer */}
                <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                  <div>Created: {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : "—"}</div>

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

      {/* Modals */}
      <CreateBuzzModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        editItem={editingItem}
        onSuccess={() => setIsCreateOpen(false)}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        description="Are you sure you want to delete this buzz?"
      />
    </div>
  );
};

export default BuzzPage;
