"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  // Debounce the search input by 300ms to prevent database spamming
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUniqueYears = useCallback(async () => {
    try {
      // Pass the specific action flag instead of fetching 1000 full records
      const res = await fetch(`/api/academic-toppers?action=getYears`);
      
      if (!res.ok) throw new Error("Failed to fetch years");
      
      const years = await res.json();
      setUniqueYears(years);
    } catch (error) {
      console.error("Failed to fetch years:", error);
    }
  }, []);

  const fetchPage = useCallback(async (page: number, limit: number, year?: string, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString() 
      });
      
      if (year) params.set("year", year);
      if (search) params.set("search", search); // Include search parameter

      const res = await fetch(`/api/academic-toppers?${params.toString()}`);
      
      if (!res.ok) throw new Error("Failed to fetch data");
      
      const data = await res.json();
      setToppers(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load academic toppers");
    }
    setLoading(false);
  }, []);

  // Use debouncedSearch in dependencies instead of direct searchQuery
  useEffect(() => {
    fetchPage(currentPage, rowsPerPage, yearFilter || undefined, debouncedSearch || undefined);
  }, [currentPage, rowsPerPage, yearFilter, debouncedSearch, fetchPage]);

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
      fetchPage(currentPage, rowsPerPage, yearFilter || undefined, debouncedSearch || undefined);
      fetchUniqueYears();
    } catch {
      toast.error("Delete failed");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

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
        ) : toppers.length === 0 ? (
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
                  {/* Map directly over toppers since backend handles filtering */}
                  {toppers.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 border-b">
                      <td className="border p-4 text-center">
                        <div className="relative w-16 h-16 mx-auto">
                          <Image 
                            src={item.imageUrl} 
                            alt={item.name} 
                            fill
                            className="rounded-lg object-cover shadow-sm"
                            sizes="64px" 
                          />
                        </div>
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
          fetchPage(currentPage, rowsPerPage, yearFilter || undefined, debouncedSearch || undefined);
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