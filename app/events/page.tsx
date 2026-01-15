"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Edit } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreateEventModal } from "@/components/events/CreateEventModal";

interface EventSection {
  heading: string;
  description: string;
  googleFormUrl: string;
  flipbookUrl: string;
  timing?: string[];
  getInTouch?: string;
  googleMapUrl?: string;
  venue?: string;
}

export default function EventsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<"mat-kabbadi" | "footprints" | null>(null);

  const [matKabbadi, setMatKabbadi] = useState<EventSection | null>(null);
  const [footprints, setFootprints] = useState<EventSection | null>(null);

  useEffect(() => {
    const unsub1 = onSnapshot(doc(db, "events", "mat-kabbadi"), (snap) => {
      if (snap.exists()) setMatKabbadi(snap.data() as EventSection);
    });

    const unsub2 = onSnapshot(doc(db, "events", "footprints"), (snap) => {
      if (snap.exists()) setFootprints(snap.data() as EventSection);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const openModal = (cat: "mat-kabbadi" | "footprints") => {
    setCategoryToEdit(cat);
    setModalOpen(true);
  };

  const SectionCard = (title: string, data: EventSection | null, cat: "mat-kabbadi" | "footprints") => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {data ? (
          <>
            <p className="font-semibold">{data.heading}</p>
            <p className="text-muted-foreground mt-2">{data.description}</p>

            {/* Google Form Link */}
            {data.googleFormUrl && (
              <a href={data.googleFormUrl} target="_blank" className="text-blue-600 underline block mt-3">
                Google Form Link
              </a>
            )}

            {/* Timing Section */}
            {data.timing && data.timing.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Schedule
                </h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {data.timing.map((time, index) => (
                    <li key={index} className="text-gray-700">
                      {time}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Get In Touch Section */}
            {data.getInTouch && (
              <div className="mt-4 p-3 bg-muted rounded-md border">
                <p className="font-semibold text-sm">Get In Touch</p>
                <p className="text-muted-foreground mt-1">{data.getInTouch}</p>
              </div>
            )}

            {/* Venue & Map Section */}
            {(data.venue || data.googleMapUrl) && (
              <div className="mt-4 p-3 bg-muted rounded-md border">
                {data.venue && (
                  <>
                    <p className="font-semibold text-sm">Venue</p>
                    <p className="text-muted-foreground mt-1">{data.venue}</p>
                  </>
                )}

                {data.googleMapUrl && (
                  <a href={data.googleMapUrl} target="_blank" className="text-blue-600 underline block mt-2 text-sm">
                    View on Google Maps
                  </a>
                )}
              </div>
            )}

            {/* Flipbook Preview */}
            {data.flipbookUrl && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Flipbook Preview</p>

                <div className="w-full h-[300px] rounded-md overflow-hidden border">
                  <iframe src={data.flipbookUrl} className="w-full h-full" allowFullScreen />
                </div>

                <a href={data.flipbookUrl} target="_blank" className="text-blue-600 underline block mt-2">
                  Open Flipbook in New Tab
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" onClick={() => openModal(cat)} className="gap-2">
          <Edit className="h-4 w-4" /> Edit
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="page-header font-serif flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        Events
      </h1>

      {SectionCard("Mat-Kabbadi", matKabbadi, "mat-kabbadi")}
      {SectionCard("Footprints", footprints, "footprints")}

      <CreateEventModal open={modalOpen} onOpenChange={setModalOpen} category={categoryToEdit} />
    </div>
  );
}
