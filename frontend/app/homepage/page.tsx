"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/components/SideBar";
import SubjectCard from "@/app/components/SubjectCard";
import StudySessionCard from "@/app/components/StudySessionCard";
import { Subject, StudySession, HistoryItem } from "@/app/types";
import { useRouter, usePathname } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Página principal (Dashboard/Homepage) do BrainBuddy
 * 
 * Exibe a lista de subjects do usuário, sessões de estudo agendadas e histórico de navegação.
 * Permite criar novos subjects, visualizar subjects existentes e gerenciar sessões de estudo.
 * 
 * @returns Componente React da homepage
 */
export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * Carrega todos os subjects do usuário
   * 
   * Busca os subjects do backend e converte para o formato esperado pelo frontend.
   * 
   * @param userId - ID do usuário autenticado
   * @throws {Error} Se falhar ao buscar subjects do backend
   */
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

  /**
   * Carrega o histórico de navegação do usuário
   * 
   * Busca até 10 subjects mais recentes e, para cada um, até 3 topics mais recentes
   * para montar o histórico exibido na sidebar.
   * 
   * @param userId - ID do usuário autenticado
   * @throws {Error} Se falhar ao buscar subjects ou topics
   */
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

  /**
   * Cria um evento no Google Calendar para uma sessão de estudo
   * 
   * Cria o evento no calendário e vincula o ID do evento à study session no backend.
   * 
   * @param session - Dados da sessão de estudo
   * @param topic - Dados do topic relacionado
   * @param accessToken - Token de acesso do Google Calendar
   * @returns true se o evento foi criado com sucesso, false caso contrário
   */
  const createCalendarEventForSession = useCallback(async (session: any, topic: any, accessToken: string) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const eventData = {
        summary: `Estudo: ${topic.title}`,
        description: `Sessão de estudo sobre ${topic.title}`,
        start_time: session.startTime,
        end_time: session.endTime,
        timezone: timezone,
      };

      const calendarResponse = await fetch(
        `${API_BASE_URL}/api/calendar/events?access_token=${encodeURIComponent(accessToken)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (calendarResponse.ok) {
        const calendarEvent = await calendarResponse.json();
        // Atualizar study session com o ID do evento do calendar
        await fetch(`${API_BASE_URL}/api/study-sessions/${session.sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendarEvent: calendarEvent.id,
          }),
        });
        return true;
      }
    } catch (error) {
      console.error(`Erro ao criar evento no calendar para sessão ${session.sessionId}:`, error);
    }
    return false;
  }, []);

  /**
   * Carrega as sessões de estudo agendadas do usuário
   * 
   * Busca todas as sessões do usuário, filtra apenas as agendadas e futuras,
   * e cria eventos no Google Calendar se necessário (quando access token disponível).
   * 
   * @param userId - ID do usuário autenticado
   * @throws {Error} Se falhar ao buscar study sessions do backend
   */
  const loadStudySessions = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/study-sessions/user/${userId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar study sessions");
      }
      const sessions = await response.json();
      
      // Tentar obter access token para criar eventos no calendar
      let accessToken: string | null = null;
      try {
        const tokenResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/access-token`);
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData?.access_token || null;
        }
      } catch (error) {
        console.warn("Access token não disponível para criar eventos no calendar");
      }
      
      // Converter do formato do backend para o formato do frontend
      const formattedSessions: StudySession[] = [];
      
      // Filtrar apenas sessões agendadas (scheduled) e que ainda não passaram
      const now = new Date();
      const scheduledSessions = sessions.filter((session: any) => {
        const startTime = new Date(session.startTime);
        return session.state === "scheduled" && startTime >= now;
      });
      
      for (const session of scheduledSessions) {
        try {
          // Buscar o topic para obter informações
          const topicResponse = await fetch(`${API_BASE_URL}/api/topics/${session.topicId}`);
          if (topicResponse.ok) {
            const topic = await topicResponse.json();
            
            // Buscar o subject do topic
            const subjectResponse = await fetch(`${API_BASE_URL}/api/subjects/${topic.subjectId}`);
            if (subjectResponse.ok) {
              const subject = await subjectResponse.json();
              
              // Se a sessão não tem calendarEvent e temos access token, criar evento no calendar
              if (!session.calendarEvent && accessToken) {
                await createCalendarEventForSession(session, topic, accessToken);
              }
              
              // Converter startTime para Date
              const startTime = new Date(session.startTime);
              const endTime = new Date(session.endTime);
              
              // Formatar data e hora
              const date = startTime;
              const time = `${startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
              
              formattedSessions.push({
                id: session.sessionId,
                subjectName: subject.name,
                date: date,
                time: time,
              });
            }
          }
        } catch (error) {
          console.error(`Erro ao buscar informações do topic/subject para sessão ${session.sessionId}:`, error);
          // Continuar mesmo se falhar ao buscar topic/subject
        }
      }
      
      // Ordenar por data (mais próximas primeiro)
      formattedSessions.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      setStudySessions(formattedSessions);
    } catch (error) {
      console.error("Erro ao carregar study sessions:", error);
      setStudySessions([]);
    }
  }, [createCalendarEventForSession]);

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
      loadStudySessions(userId);
    }
  }, [pathname, userId, isLoading, loadSubjects, loadHistory, loadStudySessions]);

  // Recarregar dados quando a página ficar visível novamente ou receber foco
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userId) {
        loadSubjects(userId);
        loadHistory(userId);
        loadStudySessions(userId);
      }
    };

    const handleFocus = () => {
      if (userId && pathname === "/homepage") {
        loadSubjects(userId);
        loadHistory(userId);
        loadStudySessions(userId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId, pathname, loadSubjects, loadHistory, loadStudySessions]);

  /**
   * Manipula o clique no botão de adicionar novo subject
   * 
   * Redireciona para a página de criação de subject
   */
  const handleAddSubject = () => {
    router.push("/newsubject");
  };

  /**
   * Manipula o clique em um card de subject
   * 
   * Redireciona para a página de detalhes do subject selecionado
   * 
   * @param subject - Subject que foi clicado
   */
  const handleSubjectClick = (subject: Subject) => {
    router.push(`/subject/${subject.id}`);
  };

  /**
   * Confirma uma sessão de estudo (marca como completa)
   * 
   * Atualiza o estado da sessão para "completed" no backend
   * 
   * @param sessionId - ID da sessão a ser confirmada
   */
  const handleConfirmSession = async (sessionId: string) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: "completed",
        }),
      });

      if (response.ok) {
        // Recarregar study sessions
        await loadStudySessions(userId);
      } else {
        console.error("Erro ao confirmar sessão");
      }
    } catch (error) {
      console.error("Erro ao confirmar sessão:", error);
    }
  };

  /**
   * Cancela uma sessão de estudo (marca como perdida)
   * 
   * Remove o evento do Google Calendar (se existir) e atualiza
   * o estado da sessão para "missed" no backend.
   * 
   * @param sessionId - ID da sessão a ser cancelada
   */
  const handleCancelSession = async (sessionId: string) => {
    if (!userId) return;
    
    try {
      // Primeiro, buscar a sessão para obter o calendarEvent
      const sessionResponse = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}`);
      if (!sessionResponse.ok) {
        console.error("Erro ao buscar sessão");
        return;
      }

      const session = await sessionResponse.json();
      const calendarEventId = session.calendarEvent;

      // Se a sessão tem um evento no calendar, deletá-lo
      if (calendarEventId) {
        try {
          // Buscar access token
          const tokenResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/access-token`);
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData?.access_token;

            if (accessToken) {
              // Deletar evento do Google Calendar
              const deleteCalendarResponse = await fetch(
                `${API_BASE_URL}/api/calendar/events/${calendarEventId}?access_token=${encodeURIComponent(accessToken)}`,
                {
                  method: "DELETE",
                }
              );

              if (deleteCalendarResponse.ok) {
                console.log("Evento deletado do Google Calendar");
              } else {
                console.error("Erro ao deletar evento do calendar:", deleteCalendarResponse.status);
              }
            }
          }
        } catch (calendarError) {
          console.error("Erro ao deletar evento do calendar:", calendarError);
          // Continuar mesmo se falhar ao deletar do calendar
        }
      }

      // Atualizar estado da sessão para "missed"
      const updateResponse = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: "missed",
        }),
      });

      if (updateResponse.ok) {
        // Recarregar study sessions
        await loadStudySessions(userId);
      } else {
        console.error("Erro ao cancelar sessão");
      }
    } catch (error) {
      console.error("Erro ao cancelar sessão:", error);
    }
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