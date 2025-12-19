"use client";

import { ArrowLeft, Upload } from "lucide-react";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { HistoryItem, Subject } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function NewTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [topicName, setTopicName] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                subjectName: subject.name,
                topicName: topic.title,
                subjectId: subjectId,
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

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedUser = localStorage.getItem("user");

      if (!storedUserId || !storedUser) {
        router.push("/login");
        return;
      }

      if (!subjectId) {
        setError("Subject ID não fornecido");
        setIsLoading(false);
        return;
      }

      setUserId(storedUserId);

      try {
        await Promise.all([
          loadSubject(subjectId),
          loadHistory(storedUserId),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [subjectId, router, loadSubject, loadHistory]);

  const handleBack = () => {
    if (subjectId) router.push(`/subject/${subjectId}`);
    else router.push("/homepage");
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar extensão
      if (!file.name.endsWith('.txt')) {
        setError("Apenas arquivos .txt são permitidos");
        return;
      }
      setFileName(file.name);
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleGeneratePlan = async () => {
    if (!topicName.trim()) {
      setError("O nome do topic é obrigatório");
      return;
    }

    if (!subjectId) {
      setError("Subject ID não fornecido");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Criar FormData para enviar dados e arquivo
      const formData = new FormData();
      formData.append("title", topicName.trim());
      formData.append("subjectId", subjectId);
      
      // Se houver arquivo selecionado, adicionar ao FormData
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/topics/`, {
        method: "POST",
        body: formData,
        // Não definir Content-Type manualmente - o browser define automaticamente com boundary para FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Erro ao criar topic" }));
        throw new Error(errorData.detail || "Erro ao criar topic");
      }

      const newTopic = await response.json();
      
      // Redirecionar para a página do topic criado
      const topicId = newTopic.topicId || newTopic.id;
      if (topicId) {
        router.push(`/topic/${topicId}?subjectId=${subjectId}`);
      } else {
        // Fallback para homepage se não houver ID
        router.push("/homepage");
      }
    } catch (error) {
      console.error("Erro ao criar topic:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao criar topic. Tente novamente.");
      }
    } finally {
      setIsCreating(false);
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
              {subject.name}
            </h1>
            <p className="text-muted-foreground">
              {subject.description || "No description available"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-2 text-foreground">Enter a Topic</h2>
              <Input
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder='e.g., "Neuroscience", "K-Means", "Algorithms"'
                disabled={isCreating}
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
                disabled={isCreating}
              />

              <button
                onClick={handleFileUpload}
                disabled={isCreating}
                className="w-full flex items-center justify-between px-4 py-3 border border-primary/30 rounded-lg text-muted-foreground hover:border-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{fileName || "Format: .txt"}</span>
                <Upload size={20} className="text-primary" />
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                className="w-48" 
                onClick={handleGeneratePlan}
                disabled={isCreating || !topicName.trim()}
              >
                {isCreating ? "Creating..." : "Generate Plan"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex pl-72">
        <Sidebar history={[]} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    }>
      <NewTopicContent />
    </Suspense>
  );
}

