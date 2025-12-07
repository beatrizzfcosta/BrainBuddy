"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const topicId = params.topicId as string;
  const subjectId = searchParams.get("subjectId") as string;

  const [content, setContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("www.youtube.com");
  const [isEditing, setIsEditing] = useState(false);

  const mockTopic = {
    name: topicId,
    subjectName: "IAA",
  };

  const handleBack = () => router.push(`/subject/${subjectId}`);

  const handleScheduleSession = () =>
    router.push(`/schedule?subjectId=${subjectId}&topicId=${topicId}`);

  return (
    <div className="min-h-screen bg-background flex pl-72">
      <Sidebar history={[]} />

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="bg-card p-10 rounded-2xl shadow-card max-w-2xl w-full relative">

          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-primary"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="text-center mb-6 mt-4">
            <h1 className="text-3xl font-bold">{mockTopic.subjectName}</h1>
            <p className="text-muted-foreground">
              Topic: <span className="font-bold">{mockTopic.name}</span>
            </p>
          </div>

         <div className="relative w-full">
        <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Generated content..."
            className="min-h-[120px] border-primary/30 resize-none pr-12"
            readOnly={!isEditing}
  />

  {/* Edit Icon */}
  <button
    onClick={() => setIsEditing(true)}
    className="absolute top-3 right-3 text-primary hover:text-primary/80 transition-colors"
  >
    <Pencil size={18} />
  </button>
</div>


          <h2 className="font-bold text-center mt-5 mb-4">Youtube Link</h2>

          <Textarea
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            className="text-center border-primary/30"
          />

          <div className="flex flex-col items-center gap-4 mt-8">
            <Button className="w-56" onClick={handleScheduleSession}>
              Schedule Study Session
            </Button>

            <Button variant="destructive" className="w-56">
              Delete Topic
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
