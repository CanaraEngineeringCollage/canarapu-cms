"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  useEffect(() => {
    if (category) loadData(category);
  }, [category]);

  const loadData = async (cat: string) => {
    try {
      const res = await fetch(`/api/events?category=${cat}`);
      const data = await res.json();
      const event = data.items?.[0];
      if (event) {
        setHeading(event.heading || "");
        setDescription(event.description || "");
        setGoogleFormUrl(event.googleFormUrl || "");
        setFlipbookUrl(event.flipbookUrl || "");
        setTiming(event.timing || []);
        setGetInTouch(event.getInTouch || "");
        setGoogleMapUrl(event.googleMapUrl || "");
        setVenue(event.venue || "");
      } else {
        setHeading(""); setDescription(""); setGoogleFormUrl(""); setFlipbookUrl("");
        setTiming([]); setGetInTouch(""); setGoogleMapUrl(""); setVenue("");
      }
    } catch {
      toast.error("Failed to load event data");
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
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, heading, description, googleFormUrl, flipbookUrl, timing, getInTouch, googleMapUrl, venue }),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {category}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Heading</label>
            <Input placeholder="Event Heading" value={heading} onChange={(e) => setHeading(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea placeholder="Event Description" className="h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Form URL</label>
            <Input placeholder="https://docs.google.com/..." value={googleFormUrl} onChange={(e) => setGoogleFormUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Flipbook URL</label>
            <Input placeholder="Flipbook Link" value={flipbookUrl} onChange={(e) => setFlipbookUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Venue</label>
            <Input placeholder="Event Venue Name" value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Map URL</label>
            <Input placeholder="https://maps.google.com/..." value={googleMapUrl} onChange={(e) => setGoogleMapUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Timing</label>
              <Button variant="outline" size="sm" onClick={() => setTiming([...timing, ""])}>Add Timing</Button>
            </div>
            {timing.map((time, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={time}
                  onChange={(e) => { const t = [...timing]; t[index] = e.target.value; setTiming(t); }}
                  placeholder="e.g. Day 1: 21 Nov 2025..."
                />
                <Button variant="ghost" size="icon" onClick={() => setTiming(timing.filter((_, i) => i !== index))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Get In Touch</label>
            <Input placeholder="Contact Info / Phone / Email" value={getInTouch} onChange={(e) => setGetInTouch(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
