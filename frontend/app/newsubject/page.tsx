"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { HistoryItem } from "@/app/types";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NewSubject() {
  const router = useRouter();

  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Verificar autenticação e buscar histórico
  useEffect(() => {
    const checkAuthAndLoadHistory = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedUser = localStorage.getItem("user");

      if (!storedUserId || !storedUser) {
        router.push("/login");
        return;
      }

      setUserId(storedUserId);

      // Buscar histórico (topics recentes do usuário)
      try {
        await loadHistory(storedUserId);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        // Continuar mesmo se o histórico falhar
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadHistory();
  }, [router]);

  const loadHistory = async (userId: string) => {
    try {
      // Buscar todos os subjects do usuário
      const subjectsResponse = await fetch(`${API_BASE_URL}/api/subjects/user/${userId}`);
      if (!subjectsResponse.ok) {
        throw new Error("Erro ao buscar subjects");
      }
      const subjects = await subjectsResponse.json();

      // Para cada subject, buscar os topics
      const historyItems: HistoryItem[] = [];
      for (const subject of subjects.slice(0, 10)) { // Limitar a 10 mais recentes
        try {
          const subjectId = subject.subjectId || subject.id; // Suportar ambos os formatos
          const topicsResponse = await fetch(`${API_BASE_URL}/api/topics/subject/${subjectId}`);
          if (topicsResponse.ok) {
            const topics = await topicsResponse.json();
            topics.slice(0, 3).forEach((topic: any) => {
              historyItems.push({
                id: topic.topicId || topic.id,
                subjectAbbr: subject.name.substring(0, 3).toUpperCase(),
                topicName: topic.title,
                subjectId: subjectId,
              });
            });
          }
        } catch (error) {
          const subjectId = subject.subjectId || subject.id;
          console.error(`Erro ao buscar topics do subject ${subjectId}:`, error);
        }
      }

      setHistory(historyItems);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistory([]);
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectName.trim()) {
      setError("O nome do subject é obrigatório");
      return;
    }

    if (!userId) {
      setError("Usuário não autenticado");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: subjectName.trim(),
          description: description.trim() || null,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Erro ao criar subject" }));
        throw new Error(errorData.detail || "Erro ao criar subject");
      }

      const newSubject = await response.json();
      
      // Redirecionar para a homepage após criar com sucesso
      router.push("/homepage");
    } catch (error) {
      console.error("Erro ao criar subject:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao criar subject. Tente novamente.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.push("/homepage");
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex pl-72">

      <Sidebar history={history} />

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

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleCreateSubject} 
                size="lg" 
                className="px-12"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Subject"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
