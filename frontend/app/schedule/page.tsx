"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import Sidebar from "@/app/components/SideBar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useState, Suspense, useEffect, useCallback } from "react";
import { HistoryItem, Topic } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ScheduleContent() {
  const router = useRouter();
  const search = useSearchParams();

  const subjectId = search.get("subjectId")!;
  const topicId = search.get("topicId")!;

  const [sessionsPerWeek, setSessionsPerWeek] = useState("");
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const weekDays = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 0 },
  ];

  const toggleDay = (dayValue: number) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(dayValue)) {
      newSelectedDays.delete(dayValue);
    } else {
      newSelectedDays.add(dayValue);
    }
    setSelectedDays(newSelectedDays);
  };

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

  const loadTopic = useCallback(async (topicId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/topics/${topicId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Topic não encontrado");
          return;
        }
        throw new Error("Erro ao buscar topic");
      }
      const data = await response.json();
      setTopic(data);
    } catch (error) {
      console.error("Erro ao carregar topic:", error);
      setError("Erro ao carregar topic");
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
          loadTopic(topicId),
          loadHistory(storedUserId),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [topicId, router, loadTopic, loadHistory]);

  const handleBack = () =>
    router.push(`/topic/${topicId}?subjectId=${subjectId}`);

  const handleAdd = async () => {
    if (selectedDays.size === 0) {
      setError("Por favor, selecione pelo menos um dia da semana");
      return;
    }

    if (!startTime || !endTime) {
      setError("Por favor, informe o horário de início e fim");
      return;
    }

    // Validar intervalo mínimo de 30 minutos
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    if (durationMinutes < 30) {
      setError("O intervalo mínimo deve ser de 30 minutos");
      return;
    }

    if (endTotalMinutes <= startTotalMinutes) {
      setError("O horário de fim deve ser posterior ao horário de início");
      return;
    }

    if (!userId || !topic) {
      setError("Dados insuficientes para criar sessões");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Calcular datas das sessões baseado nos dias selecionados (próximas 4 semanas)
      const sessions: any[] = [];
      const now = new Date();
      const selectedDaysArray = Array.from(selectedDays);
      
      // Encontrar o próximo dia da semana selecionado a partir de hoje
      const getNextDateForDay = (dayOfWeek: number, fromDate: Date): Date => {
        const currentDay = fromDate.getDay();
        let daysUntil = dayOfWeek - currentDay;
        if (daysUntil <= 0) {
          daysUntil += 7; // Próxima semana
        }
        const nextDate = new Date(fromDate);
        nextDate.setDate(fromDate.getDate() + daysUntil);
        return nextDate;
      };

      // Criar sessões para as próximas 4 semanas
      for (let week = 0; week < 4; week++) {
        for (const dayOfWeek of selectedDaysArray) {
          let sessionDate: Date;
          
          if (week === 0) {
            // Primeira semana: encontrar a próxima ocorrência do dia
            sessionDate = getNextDateForDay(dayOfWeek, now);
          } else {
            // Semanas seguintes: pegar a data da primeira semana e adicionar semanas
            const firstWeekDate = getNextDateForDay(dayOfWeek, now);
            sessionDate = new Date(firstWeekDate);
            sessionDate.setDate(firstWeekDate.getDate() + (week * 7));
          }
          
          // Aplicar horário de início
          const [startH, startM] = startTime.split(":").map(Number);
          sessionDate.setHours(startH, startM, 0, 0);

          const startTimeDate = new Date(sessionDate);
          
          // Aplicar horário de fim
          const [endH, endM] = endTime.split(":").map(Number);
          const endTimeDate = new Date(sessionDate);
          endTimeDate.setHours(endH, endM, 0, 0);

          sessions.push({
            startTime: startTimeDate.toISOString(),
            endTime: endTimeDate.toISOString(),
          });
        }
      }

      // Ordenar sessões por data
      sessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      // Buscar access_token do usuário uma vez (se disponível)
      let accessToken: string | null = null;
      try {
        const tokenResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/access-token`);
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData?.access_token || null;
        } else {
          console.warn("Access token não disponível. Os eventos não serão criados no Google Calendar.");
        }
      } catch (error) {
        console.error("Erro ao buscar access token:", error);
        // Continuar mesmo se falhar - criar apenas as study sessions
      }

      // Criar study sessions
      const createdSessions = [];
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      
      for (const session of sessions) {
        try {
          const sessionResponse = await fetch(`${API_BASE_URL}/api/study-sessions/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startTime: session.startTime,
              endTime: session.endTime,
              topicId: topicId,
              userId: userId,
              numberSessions: selectedDays.size,
            }),
          });

          if (sessionResponse.ok) {
            const createdSession = await sessionResponse.json();
            createdSessions.push(createdSession);

            // Tentar criar evento no Google Calendar se o token estiver disponível
            if (accessToken) {
              try {
                const eventData = {
                  summary: `Estudo: ${topic.title}`,
                  description: `Sessão de estudo sobre ${topic.title}`,
                  start_time: session.startTime,
                  end_time: session.endTime,
                  timezone: timezone,
                };

                console.log("Criando evento no calendar:", eventData);

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
                  console.log("Evento criado no calendar:", calendarEvent.id);
                  
                  // Atualizar study session com o ID do evento do calendar
                  const updateResponse = await fetch(`${API_BASE_URL}/api/study-sessions/${createdSession.sessionId}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      calendarEvent: calendarEvent.id,
                    }),
                  });

                  if (updateResponse.ok) {
                    console.log("Study session atualizada com calendar event ID");
                  }
                } else {
                  const errorText = await calendarResponse.text();
                  console.error("Erro ao criar evento no calendar:", calendarResponse.status, errorText);
                  // Mostrar erro mais detalhado para o usuário
                  if (calendarResponse.status === 401) {
                    setError("Token expirado. Por favor, faça login novamente.");
                  }
                }
              } catch (calendarError) {
                console.error("Erro ao criar evento no calendar:", calendarError);
                // Continuar mesmo se falhar ao criar no calendar
              }
            } else {
              console.warn("Access token não disponível - eventos não serão criados no Google Calendar");
            }
          }
        } catch (error) {
          console.error("Erro ao criar sessão:", error);
        }
      }

      if (createdSessions.length > 0) {
        // Redirecionar para a homepage após criar
        router.push("/homepage");
      } else {
        setError("Erro ao criar sessões de estudo");
      }
    } catch (error) {
      console.error("Erro ao criar sessões:", error);
      setError("Erro ao criar sessões de estudo. Tente novamente.");
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

  if (error && !topic) {
    return (
      <div className="min-h-screen bg-background flex pl-72">
        <Sidebar history={history} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-destructive">{error}</div>
        </main>
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex pl-72">
      <Sidebar history={history} />

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="bg-card p-10 rounded-2xl shadow-card max-w-2xl w-full relative">
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="text-center mb-8 mt-4">
            <h1 className="text-2xl font-bold">Plan Study Sessions</h1>
            <p className="text-muted-foreground">
              Topic: <b>{topic.title}</b>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Seleção de dias da semana */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 text-center">
                Select Days of the Week
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    disabled={isCreating}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedDays.has(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border-2 border-primary/30 text-foreground hover:border-primary/50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de horário */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 text-center">
                Time Interval
              </h2>
              <div className="flex items-center gap-4 justify-center">
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-2 text-center">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-center"
                    disabled={isCreating}
                  />
                </div>
                <div className="pt-6">
                  <span className="text-muted-foreground">-</span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-2 text-center">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-center"
                    disabled={isCreating}
                  />
                </div>
              </div>
              {startTime && endTime && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Duration: {(() => {
                    const [startH, startM] = startTime.split(":").map(Number);
                    const [endH, endM] = endTime.split(":").map(Number);
                    const startTotal = startH * 60 + startM;
                    const endTotal = endH * 60 + endM;
                    const duration = endTotal - startTotal;
                    if (duration < 0) return "Invalid";
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;
                    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
                  })()}
                </p>
              )}
            </div>

            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleAdd} 
                className="px-8 py-6"
                disabled={
                  isCreating || 
                  selectedDays.size === 0 || 
                  !startTime || 
                  !endTime
                }
              >
                <Calendar className="mr-2" /> 
                {isCreating ? "Creating Sessions..." : "Add to Google Calendar"}
              </Button>
            </div>

            {isCreating && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Criando sessões para {selectedDays.size} dia(s) por semana para as próximas 4 semanas...
              </div>
            )}
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
