"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Pagination from "@/components/ui/Pagination";

interface InquiryItem {
 id: number;
 fullName: string;
 email: string;
 phoneNumber: string;
 comments: string;
 createdAt?: string;
}

const InquiryPage = () => {
 const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");

 const [currentPage, setCurrentPage] = useState(1);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const [totalPages, setTotalPages] = useState(1);

 const fetchPage = useCallback(async (page: number, limit: number) => {
  setLoading(true);
  try {
   const res = await fetch(`/api/inquiry?page=${page}&limit=${limit}`);
   if (!res.ok) throw new Error();
   const data = await res.json();
   setInquiries(data.items ?? []);
   setTotalPages(data.totalPages ?? 1);
  } catch {
   toast.error("Failed to load inquiries");
  }
  setLoading(false);
 }, []);

 useEffect(() => {
  fetchPage(currentPage, rowsPerPage);
 }, [currentPage, rowsPerPage, fetchPage]);

 const filteredInquiries = inquiries.filter((item) =>
  searchTerm.trim()
   ? item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
   : true
 );

 const exportCsv = () => {
  if (filteredInquiries.length === 0) {
   toast.error("No inquiries to export");
   return;
  }

  const escape = (value: unknown) => {
   const s = String(value ?? "");
   const needsQuotes = /[",\n]/.test(s);
   const escaped = s.replace(/"/g, '""');
   return needsQuotes ? `"${escaped}"` : escaped;
  };

  const header = ["Full Name", "Email", "Phone", "Comments", "Date"];
  const rows = filteredInquiries.map((i) => ([
   i.fullName,
   i.email,
   i.phoneNumber,
   i.comments,
   i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
  ]));

  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
 };

 return (
  <div className="p-6 space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="page-header flex items-center gap-3">
      <MessageSquare className="h-8 w-8 text-primary" />
      Inquiries
     </h1>
     <p className="text-muted-foreground">View and manage student inquiries.</p>
    </div>
   </div>

   <div className="flex items-center gap-4 flex-wrap">
    <div className="relative flex-1 max-w-sm">
     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
     <Input
      placeholder="Search by name, email, or phone..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>
    <Button variant="outline" onClick={exportCsv}>Export as CSV</Button>
   </div>

   {loading ? (
    <div className="flex items-center justify-center h-40">
     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
   ) : filteredInquiries.length === 0 ? (
    <div className="flex flex-col items-center justify-center border border-dashed p-8 rounded-lg">
     <MessageSquare className="h-10 w-10 text-primary" />
     <p className="mt-4 text-muted-foreground">No inquiries found</p>
    </div>
   ) : (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full border-collapse">
       <thead>
        <tr className="bg-muted/50">
         <th className="border p-3">Full Name</th>
         <th className="border p-3">Email</th>
         <th className="border p-3">Phone</th>
         <th className="border p-3">Comments</th>
         <th className="border p-3">Date</th>
        </tr>
       </thead>
       <tbody>
        {filteredInquiries.map((item) => (
         <tr key={item.id} className="hover:bg-muted/30 text-center transition-colors">
          <td className="border p-3 font-medium">{item.fullName}</td>
          <td className="border p-3">
           <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">
            {item.email}
           </a>
          </td>
          <td className="border p-3">
           <a href={`tel:${item.phoneNumber}`} className="text-blue-600 hover:underline">
            {item.phoneNumber}
           </a>
          </td>
          <td className="border p-3 text-sm text-muted-foreground max-w-md">{item.comments}</td>
          <td className="border p-3 text-sm text-muted-foreground">
           {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    rowsPerPage={rowsPerPage}
    onPageChange={setCurrentPage}
    onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
   />
  </div>
 );
};

export default InquiryPage;
