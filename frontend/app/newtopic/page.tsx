"use client";

import { ArrowLeft, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { HistoryItem } from "@/app/types";

export default function NewTopicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [topicName, setTopicName] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockHistory: HistoryItem[] = [
    { id: "1", subjectAbbr: "IAA", topicName: "SVM" },
  ];

  const mockSubject = {
    id,
    name: "IAA",
    description:
      "Learn the fundamentals of machine learning and how computers can make predictions from data.",
  };

  const handleBack = () => {
    if (id) router.push(`/subject/${id}`);
    else router.push("/homepage");
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      console.log("File selected:", file.name);
    }
  };

  const handleGeneratePlan = () => {
    console.log("Generate plan for:", topicName, "file:", fileName);
  };

  return (
    <div className="min-h-screen bg-background flex pl-72">
      <Sidebar history={mockHistory} />

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="bg-card rounded-2xl shadow-card p-10 w-full max-w-2xl relative">

          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {mockSubject.name}
            </h1>
            <p className="text-muted-foreground">
              {mockSubject.description}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-2 text-foreground">Enter a Topic</h2>
              <Input
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder='e.g., "Neuroscience", "K-Means", "Algorithms"'
              />
            </div>

            <div>
              <h2 className="font-bold text-lg mb-2 text-foreground">Upload Appointments</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleFileUpload}
                className="w-full flex items-center justify-between px-4 py-3 border border-primary/30 rounded-lg text-muted-foreground hover:border-primary/50 transition"
              >
                <span>{fileName || "Format: .txt"}</span>
                <Upload size={20} className="text-primary" />
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <Button className="w-48" onClick={handleGeneratePlan}>
                Generate Plan
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
