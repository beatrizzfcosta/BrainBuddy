"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import Sidebar from "@/app/components/SideBar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useState, Suspense } from "react";

function ScheduleContent() {
  const router = useRouter();
  const search = useSearchParams();

  const subjectId = search.get("subjectId")!;
  const topicId = search.get("topicId")!;

  const [sessionsPerWeek, setSessionsPerWeek] = useState("");

  const handleBack = () =>
    router.push(`/topic/${topicId}?subjectId=${subjectId}`);

  const handleAdd = () =>
    console.log("Add session:", topicId, sessionsPerWeek);

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

          <div className="text-center mb-8 mt-4">
            <h1 className="text-2xl font-bold">Plan Study Sessions</h1>
            <p className="text-muted-foreground">
              Topic: <b>{topicId}</b>
            </p>
          </div>

          <Input
            type="number"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
            placeholder="How many sessions per week?"
            className="text-center"
          />

          <div className="flex justify-center mt-8">
            <Button onClick={handleAdd} className="px-8 py-6">
              <Calendar className="mr-2" /> Add to Google Calendar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex pl-72">
        <Sidebar history={[]} />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  );
}
