"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Award, Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import Pagination from "@/components/ui/Pagination";
import { AcademicTopperModal } from "@/components/toppers/AcademicTopperModal";

interface AcademicTopper {
  id: number;
  name: string;
  year: string;
  imageUrl: string;
  createdAt: string;
}

const AcademicToppersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [toppers, setToppers] = useState<AcademicTopper[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicTopper | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AcademicTopper | null>(null);
  const [uniqueYears, setUniqueYears] = useState<string[]>([]);

  const fetchUniqueYears = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const yearsUrl = new URL(`/api/academic-toppers`, baseUrl || "http://localhost:3000");
      yearsUrl.searchParams.set("page", "1");
      yearsUrl.searchParams.set("limit", "1000");

      const res = await fetch(yearsUrl.toString());
      const data = await res.json();
      const years = [...new Set((data.items ?? []).map((t: AcademicTopper) => t.year))] as string[];
      setUniqueYears(years.sort().reverse());
    } catch (error) {
      console.error("Failed to fetch years:", error);
    }
  }, []);

  const fetchPage = useCallback(async (page: number, limit: number, year?: string) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const apiUrl = new URL(`/api/academic-toppers`, baseUrl || "http://localhost:3000");
      apiUrl.searchParams.set("page", page.toString());
      apiUrl.searchParams.set("limit", limit.toString());
      if (year) {
        apiUrl.searchParams.set("year", year);
      }

      const res = await fetch(apiUrl.toString());
      const data = await res.json();
      setToppers(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load academic toppers");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPage(currentPage, rowsPerPage, yearFilter || undefined);
  }, [currentPage, rowsPerPage, yearFilter, fetchPage]);

  useEffect(() => {
    fetchUniqueYears();
  }, [fetchUniqueYears]);

  const openEdit = (item: AcademicTopper) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const confirmDelete = (item: AcademicTopper) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const deleteTopper = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/academic-toppers/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Academic topper deleted");
      fetchPage(currentPage, rowsPerPage, yearFilter || undefined);
      fetchUniqueYears();
    } catch {
      toast.error("Delete failed");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredToppers = toppers.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="page-header flex items-center gap-3">
              <Award className="h-8 w-8 text-success" /> Academic Toppers
            </h1>
            <p className="page-description">Manage academic achievement toppers and rank achievers.</p>
          </div>
          <Button
            className="btn-primary-gradient gap-2"
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Topper
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-success" />
          </div>
        ) : filteredToppers.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No academic toppers found.</p>
        ) : (
          <>
            <div className="rounded-lg border bg-card shadow overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="border p-3 text-center">Image</th>
                    <th className="border p-3 text-left">Name</th>
                    <th className="border p-3 text-center">Year</th>
                    <th className="border p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredToppers.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 border-b">
                      <td className="border p-4 text-center">
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover mx-auto shadow-sm" loading="lazy" />
                      </td>
                      <td className="border p-4">
                        <span className="font-medium line-clamp-2">{item.name}</span>
                      </td>
                      <td className="border p-4 text-center text-sm">{item.year}</td>
                      <td className="border p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </div>

      <AcademicTopperModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editItem={editItem}
        onSuccess={() => {
          fetchPage(currentPage, rowsPerPage, yearFilter || undefined);
          fetchUniqueYears();
        }}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={deleteTopper}
        title="Delete Academic Topper"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
      />
    </div>
  );
};

export default AcademicToppersPage;
