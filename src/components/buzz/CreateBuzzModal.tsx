"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EmailEditor = dynamic(() => import("react-email-editor"), { ssr: false });

interface BuzzEditItem {
  id: number;
  name: string;
  category: string;
  date: string;
  content?: string;
  design?: any;
}

interface CreateBuzzModalProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
  editItem?: BuzzEditItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateBuzzModal = ({
  children,
  onSuccess,
  editItem,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateBuzzModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const emailEditorRef = useRef<any>(null);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const editorKey = useMemo(() => (editItem ? `edit-${editItem.id}` : "create"), [editItem]);
  
  const [categories, setCategories] = useState(["sports", "cultural", "academic"]);
  const [newCategory, setNewCategory] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/buzz/categories");
      if (res.ok) {
        const data = await res.json();
        // SAFEGUARD: Ensure data is an array before mapping
        if (Array.isArray(data)) {
          setCategories((prev) => {
            const uniqueItems = new Set([
              ...prev, 
              ...data.map((c: string) => c?.toLowerCase() || "")
            ]);
            return Array.from(uniqueItems).filter(Boolean);
          });
        }
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Force a clean editor lifecycle when switching between create/edit items
    setIsEditorLoaded(false);
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      if (editItem.category && !categories.includes(editItem.category.toLowerCase())) {
        setCategories((prev) => [...prev, editItem.category.toLowerCase()]);
      }
      // SAFEGUARD: Validate date object before setting
      if (editItem.date) {
        const parsedDate = new Date(editItem.date);
        setDate(!isNaN(parsedDate.getTime()) ? parsedDate : undefined);
      }
    } else if (open) {
      resetForm();
    }
  }, [editItem, open, editorKey, categories]);

  const resetForm = () => {
    setName("");
    setCategory("");
    setDate(undefined);
  };

  const handleSubmit = async () => {
    if (!name || !category || !date) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!emailEditorRef.current?.editor) {
      toast.error("Editor is not ready yet");
      return;
    }

    setLoading(true);

    emailEditorRef.current.editor.exportHtml(
      async (data: { design: object | undefined; html: string | undefined }) => {
        const safeDesign = JSON.parse(JSON.stringify(data.design ?? {}));
        const safeHtml = data.html ?? "<div></div>";

        try {
          if (editItem) {
            const res = await fetch(`/api/buzz/${editItem.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name, category,
                date: date.toISOString(),
                content: safeHtml,
                design: safeDesign,
              }),
            });
            if (!res.ok) throw new Error();
            toast.success("Buzz updated successfully");
          } else {
            const res = await fetch("/api/buzz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name, category,
                date: date.toISOString(),
                content: safeHtml,
                design: safeDesign,
              }),
            });
            if (!res.ok) throw new Error();
            toast.success("Buzz created successfully");
          }

          setOpen(false);
          resetForm();
          onSuccess?.();
        } catch {
          toast.error(editItem ? "Failed to update buzz" : "Failed to create buzz");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getParsedDesign = useCallback(() => {
    if (!editItem?.design) return null;
    if (typeof editItem.design === "string") {
      try {
        return JSON.parse(editItem.design);
      } catch {
        return null;
      }
    }
    return editItem.design;
  }, [editItem]);

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Buzz" : "Create Buzz"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="space-y-2">
            <Label>Name of Event</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Event Name" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
              open={isSelectOpen}
              onOpenChange={setIsSelectOpen}
            >
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
                <div className="flex items-center gap-2 p-2 border-t mt-1">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCategory.trim() && !categories.includes(newCategory.trim().toLowerCase())) {
                          const newCat = newCategory.trim().toLowerCase();
                          setCategories([...categories, newCat]);
                          setCategory(newCat);
                          setNewCategory("");
                          setIsSelectOpen(false);
                        } else if (categories.includes(newCategory.trim().toLowerCase())) {
                          setCategory(newCategory.trim().toLowerCase());
                          setNewCategory("");
                          setIsSelectOpen(false);
                        }
                      }
                    }}
                    placeholder="New category..."
                    className="h-8"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (newCategory.trim() && !categories.includes(newCategory.trim().toLowerCase())) {
                        const newCat = newCategory.trim().toLowerCase();
                        setCategories([...categories, newCat]);
                        setCategory(newCat);
                        setNewCategory("");
                        setIsSelectOpen(false);
                      } else if (categories.includes(newCategory.trim().toLowerCase())) {
                        setCategory(newCategory.trim().toLowerCase());
                        setNewCategory("");
                        setIsSelectOpen(false);
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Of Event</Label>
            {/* SAFEGUARD: Prevent invalid dates from crashing date-fns format */}
            <Input
              type="date"
              value={date && !isNaN(date.getTime()) ? format(date, "yyyy-MM-dd") : ""}
              onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 border rounded-md bg-muted/10 overflow-hidden">
          <EmailEditor
            key={editorKey}
            ref={emailEditorRef}
            minHeight="100%"
            projectId={1234}
            options={{ displayMode: "email" }}
            onReady={() => {
              setIsEditorLoaded(true);
              const design = getParsedDesign();
              if (design && emailEditorRef.current?.editor) {
                emailEditorRef.current.editor.loadDesign(design);
              } else if (editItem?.content) {
                toast.message(
                  "This buzz was created without editor design data. It can’t be loaded into the builder.",
                  { description: "Saving will overwrite it with a new design." }
                );
              }
            }}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={loading || !isEditorLoaded} className="w-32">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : editItem ? "Update Buzz" : "Save Buzz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};