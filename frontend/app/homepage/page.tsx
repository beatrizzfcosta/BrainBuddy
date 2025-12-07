"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/components/SideBar";
import SubjectCard from "@/app/components/SubjectCard";
import StudySessionCard from "@/app/components/StudySessionCard";
import { Subject, StudySession, HistoryItem } from "@/app/types";
import { useRouter, usePathname } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const loadSubjects = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects/user/${userId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar subjects");
      }
      const data = await response.json();
      
      // Converter do formato do backend para o formato do frontend
      const formattedSubjects: Subject[] = data.map((subject: any) => ({
        id: subject.subjectId || subject.id,
        name: subject.name,
        description: subject.description || "",
        userId: subject.userId,
        createdAt: subject.createdAt ? new Date(subject.createdAt) : new Date(),
      }));

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error("Erro ao carregar subjects:", error);
      setSubjects([]);
    }
  }, []);

  const loadHistory = useCallback(async (userId: string) => {
    try {
      // Buscar todos os subjects do usuário
      const subjectsResponse = await fetch(`${API_BASE_URL}/api/subjects/user/${userId}`);
      if (!subjectsResponse.ok) {
        throw new Error("Erro ao buscar subjects");
      }
      const subjects = await subjectsResponse.json();

      // Para cada subject, buscar os topics
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

  const loadStudySessions = useCallback(async (userId: string) => {
    try {
      // TODO: Implementar quando a API de study sessions estiver pronta
      // Por enquanto, manter vazio ou usar mock
      setStudySessions([]);
    } catch (error) {
      console.error("Erro ao carregar study sessions:", error);
      setStudySessions([]);
    }
  }, []);

  // Verificar autenticação e carregar dados
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedUser = localStorage.getItem("user");

      if (!storedUserId || !storedUser) {
        router.push("/login");
        return;
      }

      setUserId(storedUserId);

      // Carregar dados do usuário
      try {
        await Promise.all([
          loadSubjects(storedUserId),
          loadHistory(storedUserId),
          loadStudySessions(storedUserId),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router, loadSubjects, loadHistory, loadStudySessions]);

  // Recarregar dados quando voltar para a homepage (detecta mudança de rota)
  useEffect(() => {
    if (pathname === "/homepage" && userId && !isLoading) {
      loadSubjects(userId);
      loadHistory(userId);
    }
  }, [pathname, userId, isLoading, loadSubjects, loadHistory]);

  // Recarregar dados quando a página ficar visível novamente ou receber foco
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userId) {
        loadSubjects(userId);
        loadHistory(userId);
      }
    };

    const handleFocus = () => {
      if (userId && pathname === "/homepage") {
        loadSubjects(userId);
        loadHistory(userId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId, pathname, loadSubjects, loadHistory]);

  const handleAddSubject = () => {
    router.push("/newsubject");
  };

  const handleSubjectClick = (subject: Subject) => {
    router.push(`/subject/${subject.id}`);
  };

  const handleConfirmSession = (sessionId: string) => {
    console.log("Confirm session:", sessionId);
  };

  const handleCancelSession = (sessionId: string) => {
    console.log("Cancel session:", sessionId);
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
    <div className="min-h-screen bg-background pl-80">
      <Sidebar history={history} />

      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Subjects */}
        <section className="mb-12">
          <h1 className="text-3xl font-extrabold text-foreground text-center mb-2">
            SUBJECTS
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Here you can find all your subjects. Choose one to explore
            <br />
            the content and review materials!
          </p>

          <div className="flex flex-wrap gap-6 justify-center">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                name={subject.name}
                onClick={() => handleSubjectClick(subject)}
              />
            ))}
            <SubjectCard isAddButton onClick={handleAddSubject} />
          </div>
        </section>

        {/* Study Sessions */}
        <section>
          <h2 className="text-2xl font-extrabold text-foreground text-center mb-6">
            STUDY SESSIONS
          </h2>

          <div className="flex flex-wrap gap-6 justify-center">
            {studySessions.map((session) => (
              <StudySessionCard
                key={session.id}
                session={session}
                onConfirm={() => handleConfirmSession(session.id)}
                onCancel={() => handleCancelSession(session.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}