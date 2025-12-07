"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { HistoryItem } from "@/app/types";
import { Pencil, Edit3 } from "lucide-react";

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();

  const topicId = params?.topicId as string;
  const subjectId = params?.id as string;

  //Read-only state control
  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState("");  
  const [youtubeLink, setYoutubeLink] = useState("www.youtube.com");

  const mockHistory: HistoryItem[] = [
    { id: "1", subjectAbbr: "IAA", topicName: "SVM" },
  ];

  const mockTopic = {
    id: topicId,
    name: "SVM",
    subjectName: "IAA",
    generatedContent: "",
  };

  const handleBack = () => router.push(`/subject/${subjectId}`);

  const handleScheduleSession = () =>
    console.log("Schedule study session for topic:", topicId);

  const handleDeleteTopic = () => console.log("Delete topic:", topicId);

  const handleEditContent = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-background flex pl-72">

      <Sidebar history={mockHistory} />

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="bg-card rounded-2xl shadow-card p-10 w-full max-w-2xl relative">

          {/* Back button */}
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Title */}
          <div className="text-center mb-6 mt-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mockTopic.subjectName}
            </h1>
            <p className="text-muted-foreground">
              Here's the information for the topic:{" "}
              <span className="font-bold text-foreground">{mockTopic.name}</span>
            </p>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-foreground font-bold text-lg text-center mb-4">
                {mockTopic.name}
              </h2>

              <div className="relative">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Generated content..."
                  className="min-h-[120px] border-primary/30 pr-14 resize-none"
                  readOnly={!isEditing}
                />

                {/* EDIT Button */}
                <button
            onClick={handleEditContent}
            className="absolute top-2 right-2 text-primary hover:text-primary/80 transition-colors">
            <Pencil size={20} /> 
                </button>
              </div>
            </div>

            {/* Link section */}
            <div>
              <h2 className="text-foreground font-bold text-lg text-center mb-4">
                Youtube Link
              </h2>

              <Input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="www.youtube.com"
                className="border-primary/30 text-center"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                onClick={handleScheduleSession}
                size="lg"
                className="w-56 bg-primary hover:bg-primary/90"
              >
                Schedule Study Session
              </Button>

              <Button
                onClick={handleDeleteTopic}
                size="lg"
                variant="destructive"
                className="w-56"
              >
                Delete Topic
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
