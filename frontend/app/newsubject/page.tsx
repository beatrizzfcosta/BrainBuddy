"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { HistoryItem } from "@/app/types";
import { useRouter } from "next/navigation";

export default function NewSubject() {
  const router = useRouter();

  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");

  const mockHistory: HistoryItem[] = [
    { id: "1", subjectAbbr: "IAA", topicName: "SVM" },
  ];

  const handleCreateSubject = () => {
    console.log("Create subject:", { subjectName, description });
  };

  const handleBack = () => {
    router.push("/homepage");
  };

  return (
    <div className="min-h-screen bg-background flex pl-72">

      <Sidebar history={mockHistory} />

      <main className="flex-1 p-6 flex items-center justify-center">

        <div className="bg-card rounded-2xl shadow-sm p-8 w-full max-w-2xl relative">
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="text-center mb-8 mt-4">
            <h1 className="text-2xl font-bold text-foreground tracking-wide mb-3">
              NEW SUBJECT
            </h1>
            <p className="text-muted-foreground">
              Add a new subject to your list. Give it a name and a short
              description to get started!
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-foreground font-semibold mb-2">
                Enter a subject
              </label>
              <Input
                type="text"
                placeholder='e.g., "Maths", "Science", "Biology"'
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="border-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-2">
                Description
              </label>
              <Input
                type="text"
                placeholder="e.g., 2 (Only Integer numbers)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-primary/30 focus:border-primary"
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleCreateSubject} size="lg" className="px-12">
                Create Subject
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
