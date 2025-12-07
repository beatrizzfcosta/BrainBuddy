"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/SideBar";
import SubjectCard from "@/app/components/SubjectCard";
import StudySessionCard from "@/app/components/StudySessionCard";
import { Subject, StudySession, HistoryItem } from "@/app/types";
import { useRouter } from "next/navigation";

//Mock data
const mockHistory: HistoryItem[] = [
  { id: "1", subjectAbbr: "IAA", topicName: "SVM" },
];

const mockSubjects: Subject[] = [
  { id: "1", name: "IAA", description: "Inteligência Artificial Aplicada", userId: "1", createdAt: new Date() },
];

const mockStudySessions: StudySession[] = [
  { id: "1", subjectName: "SVM", date: new Date("2025-11-07"), time: "2pm" },
];

export default function Dashboard() {
  const router = useRouter();

  const [subjects] = useState(mockSubjects);
  const [studySessions] = useState(mockStudySessions);
  const [history] = useState(mockHistory);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem("userId");
      const user = localStorage.getItem("user");

      if (!userId || !user) {
        // Se não estiver autenticado, redirecionar para login
        router.push("/login");
        return;
      }

      // Se estiver autenticado, mostrar a página
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleAddSubject = () => {
    router.push("/newsubject");
  };

  const handleSubjectClick = (subject: Subject) => {
    console.log("Subject clicked:", subject.name);
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
