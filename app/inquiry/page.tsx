"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Mail,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  comments: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

const InquiryPage = () => {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Inquiries
  useEffect(() => {
    const q = query(collection(db, "inquiry"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as InquiryItem[];
        setInquiries(items);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load inquiries");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredInquiries = inquiries.filter((item) =>
    searchTerm.trim()
      ? item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-serif flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Inquiries
          </h1>
          <p className="text-muted-foreground">View and manage student inquiries.</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
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
                  <th className="border p-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </div>
                  </th>
                  <th className="border p-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </th>
                  <th className="border p-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </div>
                  </th>
                  <th className="border p-3 text-left font-semibold">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments
                    </div>
                  </th>
                  <th className="border p-3 text-left font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="border p-3">
                      <span className="font-medium">{item.fullName}</span>
                    </td>
                    <td className="border p-3">
                      <a
                        href={`mailto:${item.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.email}
                      </a>
                    </td>
                    <td className="border p-3">
                      <a
                        href={`tel:${item.phoneNumber}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.phoneNumber}
                      </a>
                    </td>
                    <td className="border p-3">
                      <p className="text-sm text-muted-foreground max-w-md">
                        {item.comments}
                      </p>
                    </td>
                    <td className="border p-3 text-sm text-muted-foreground">
                      {item.createdAt?.seconds
                        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total Count */}
      {!loading && filteredInquiries.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredInquiries.length} {filteredInquiries.length === 1 ? 'inquiry' : 'inquiries'}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default InquiryPage;
