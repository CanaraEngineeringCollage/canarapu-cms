"use client";

import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      if (editItem.date) setDate(new Date(editItem.date));
    } else if (open) {
      resetForm();
    }
  }, [editItem, open]);

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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Of Event</Label>
            <Input
              type="date"
              value={date ? format(date, "yyyy-MM-dd") : ""}
              onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 border rounded-md bg-muted/10 overflow-hidden">
          <EmailEditor
            ref={emailEditorRef}
            minHeight="60vh"
            projectId={1234}
            options={{ displayMode: "email" }}
            onReady={() => {
              setIsEditorLoaded(true);
              if (editItem?.design) {
                emailEditorRef.current.editor.loadDesign(editItem.design);
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
