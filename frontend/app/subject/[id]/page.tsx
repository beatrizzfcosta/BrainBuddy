"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { HistoryItem } from "@/app/types";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [selectedTopic, setSelectedTopic] = useState("");

  //Mock history
  const mockHistory: HistoryItem[] = [
    { id: "1", subjectAbbr: "IAA", topicName: "SVM" },
  ];

  //Mock subject
  const mockSubject = {
    id,
    name: "IAA",
    description:
      "Learn the fundamentals of machine learning and how computers can make predictions from data.",
    topics: ["SVM"],
  };

  const handleBack = () => router.push("/homepage");

 const handleSearch = () => {
  if (!selectedTopic) return;
  router.push(`/topic/${selectedTopic}`);
};

 const handleCreateTopic = () => router.push(`/newtopic`);
  const handleDeleteSubject = () => console.log("Delete subject:", id);

  return (
   <div className="min-h-screen bg-background flex pl-72">

      <Sidebar history={mockHistory} />

      {/* CENTERED MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl shadow-card p-10 w-full max-w-2xl relative">

        <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-primary hover:text-primary/80 transition-colors"
            >
            <ArrowLeft size={24} />
        </button>


          {/* Title Description */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              {mockSubject.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {mockSubject.description}
            </p>
          </div>

          {/* TOPIC SELECT */}
          <div className="space-y-6">
            <div>
              <h2 className="text-foreground font-bold text-lg mb-4">
                Available Topics
              </h2>

              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-full border-primary/30">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>

                <SelectContent>
                  {mockSubject.topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button onClick={handleSearch} className="w-48">
                Search
              </Button>

              <Button onClick={handleCreateTopic} className="w-48">
                Create new Topic
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteSubject}
                className="w-48"
              >
                Delete Subject
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
