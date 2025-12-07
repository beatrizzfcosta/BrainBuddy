"use client";

import { useState, useEffect, useCallback } from "react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Subject {
  subjectId: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
}

interface Topic {
  topicId: string;
  title: string;
  description?: string;
  subjectId: string;
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [selectedTopic, setSelectedTopic] = useState("");
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadHistory = useCallback(async (userId: string) => {
    try {
      const subjectsResponse = await fetch(`${API_BASE_URL}/api/subjects/user/${userId}`);
      if (!subjectsResponse.ok) {
        throw new Error("Erro ao buscar subjects");
      }
      const subjects = await subjectsResponse.json();

      const historyItems: HistoryItem[] = [];
      for (const subject of subjects.slice(0, 10)) {
        try {
          const subjectId = subject.subjectId || subject.id;
          const topicsResponse = await fetch(`${API_BASE_URL}/api/topics/subject/${subjectId}`);
          if (topicsResponse.ok) {
            const topics = await topicsResponse.json();
            topics.slice(0, 3).forEach((topic: any) => {
              historyItems.push({
                id: topic.topicId || topic.id,
                subjectAbbr: subject.name.substring(0, 3).toUpperCase(),
                topicName: topic.title,
              });
            });
          }
        } catch (error) {
          console.error(`Erro ao buscar topics do subject:`, error);
        }
      }

      setHistory(historyItems);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistory([]);
    }
  }, []);

  const loadSubject = useCallback(async (subjectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Subject não encontrado");
          return;
        }
        throw new Error("Erro ao buscar subject");
      }
      const data = await response.json();
      setSubject(data);
    } catch (error) {
      console.error("Erro ao carregar subject:", error);
      setError("Erro ao carregar subject");
    }
  }, []);

  const loadTopics = useCallback(async (subjectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/topics/subject/${subjectId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar topics");
      }
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error("Erro ao carregar topics:", error);
      setTopics([]);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedUser = localStorage.getItem("user");

      if (!storedUserId || !storedUser) {
        router.push("/login");
        return;
      }

      setUserId(storedUserId);

      try {
        await Promise.all([
          loadSubject(id),
          loadTopics(id),
          loadHistory(storedUserId),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [id, router, loadSubject, loadTopics, loadHistory]);

  const handleBack = () => router.push("/homepage");

  const handleSearch = () => {
    if (!selectedTopic) return;
    const topic = topics.find((t) => t.topicId === selectedTopic);
    if (topic) {
      router.push(`/topic/${selectedTopic}?subjectId=${id}`);
    }
  };

  const handleCreateTopic = () => router.push(`/newtopic?subjectId=${id}`);

  const handleDeleteSubject = async () => {
    if (!confirm("Tem certeza que deseja deletar este subject? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar subject");
      }

      router.push("/homepage");
    } catch (error) {
      console.error("Erro ao deletar subject:", error);
      setError("Erro ao deletar subject");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex pl-72">
        <Sidebar history={history} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (error && !subject) {
    return (
      <div className="min-h-screen bg-background flex pl-72">
        <Sidebar history={history} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-destructive">{error}</div>
        </main>
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex pl-72">
      <Sidebar history={history} />

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
              {subject.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {subject.description || "No description available"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">
              {error}
            </div>
          )}

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
                  {topics.length === 0 ? (
                    <SelectItem value="no-topics" disabled>
                      No topics available
                    </SelectItem>
                  ) : (
                    topics.map((topic) => (
                      <SelectItem key={topic.topicId} value={topic.topicId}>
                        {topic.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button 
                onClick={handleSearch} 
                className="w-48"
                disabled={!selectedTopic}
              >
                Search
              </Button>

              <Button onClick={handleCreateTopic} className="w-48">
                Create new Topic
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteSubject}
                className="w-48"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Subject"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
