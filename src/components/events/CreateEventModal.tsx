"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "mat-kabbadi" | "footprints" | null;
}

export const CreateEventModal = ({ open, onOpenChange, category }: CreateEventModalProps) => {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [flipbookUrl, setFlipbookUrl] = useState("");
  const [timing, setTiming] = useState<string[]>([]);
  const [getInTouch, setGetInTouch] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [venue, setVenue] = useState("");
  const [loading, setLoading] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (category) loadData(category);
  }, [category]);

  const loadData = async (cat: string) => {
    const ref = doc(db, "events", cat);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setHeading(data.heading || "");
      setDescription(data.description || "");
      setGoogleFormUrl(data.googleFormUrl || "");
      setFlipbookUrl(data.flipbookUrl || "");
      setTiming(data.timing || []);
      setGetInTouch(data.getInTouch || "");
      setGoogleMapUrl(data.googleMapUrl || "");
      setVenue(data.venue || "");
    } else {
      // Reset form if no data yet
      setHeading("");
      setDescription("");
      setGoogleFormUrl("");
      setFlipbookUrl("");
      setTiming([]);
      setGetInTouch("");
      setGoogleMapUrl("");
      setVenue("");
    }
  };

  const handleSubmit = async () => {
    if (!heading || !description || !googleFormUrl || !flipbookUrl) {
      toast.error("Please fill all fields");
      return;
    }

    if (!category) return;

    setLoading(true);

    try {
      const ref = doc(db, "events", category);

      await setDoc(ref, {
        heading,
        description,
        googleFormUrl,
        flipbookUrl,
        timing,
        getInTouch,
        googleMapUrl,
        venue,
        updatedAt: serverTimestamp(),
      });

      toast.success("Saved successfully");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {category}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Heading" value={heading} onChange={(e) => setHeading(e.target.value)} />

          <Textarea placeholder="Description" className="h-32" value={description} onChange={(e) => setDescription(e.target.value)} />

          <Input placeholder="Google Form URL" value={googleFormUrl} onChange={(e) => setGoogleFormUrl(e.target.value)} />

          <Input placeholder="Flipbook URL" value={flipbookUrl} onChange={(e) => setFlipbookUrl(e.target.value)} />

          <Input placeholder="Get In Touch (Contact Info)" value={getInTouch} onChange={(e) => setGetInTouch(e.target.value)} />

          <Input placeholder="Google Map URL" value={googleMapUrl} onChange={(e) => setGoogleMapUrl(e.target.value)} />

          <Input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Timing</label>
              <Button variant="outline" size="sm" onClick={() => setTiming([...timing, ""])}>
                Add Timing
              </Button>
            </div>
            {timing.map((time, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={time}
                  onChange={(e) => {
                    const newTiming = [...timing];
                    newTiming[index] = e.target.value;
                    setTiming(newTiming);
                  }}
                  placeholder="e.g. Day 1: 21 Nov 2025..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newTiming = timing.filter((_, i) => i !== index);
                    setTiming(newTiming);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
