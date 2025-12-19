"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Sidebar from "@/app/components/SideBar";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { HistoryItem, Topic, Note, YouTubeSuggestion } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Componente de conteúdo da página de detalhes do topic
 * 
 * Exibe informações do topic, conteúdo gerado por IA (ou permite gerar),
 * sugestões do YouTube e permite agendar sessões de estudo ou deletar o topic.
 * 
 * @returns Componente React da página de detalhes do topic
 */
function TopicDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const topicId = params.topicId as string;
  const subjectId = searchParams.get("subjectId") as string;

  const [content, setContent] = useState("");
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * Carrega o histórico de navegação para exibir na sidebar
   * 
   * @param userId - ID do usuário autenticado
   */
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

  /**
   * Carrega os dados do topic
   * 
   * @param topicId - ID do topic a ser carregado
   * @throws {Error} Se o topic não for encontrado ou falhar ao buscar
   */
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

  /**
   * Carrega as notes do topic e exibe o conteúdo
   * 
   * Busca notes do topic, prioriza note gerada por IA, e se não houver notes,
   * gera conteúdo automaticamente usando a IA.
   * 
   * @param topicId - ID do topic
   * @param currentTopic - Dados do topic atual (para usar como contexto na geração)
   */
  const loadNotes = useCallback(async (topicId: string, currentTopic: Topic | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/topic/${topicId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar notes");
      }
      const notes: Note[] = await response.json();
      
      // Buscar a primeira note com conteúdo gerado por IA, ou a primeira note disponível
      const aiNote = notes.find(note => note.source === "AI-generated") || notes[0];
      if (aiNote && aiNote.content) {
        setContent(aiNote.content);
      } else if (notes.length === 0 && currentTopic) {
        // Se não houver notes, gerar conteúdo automaticamente
        await generateContent(topicId, currentTopic);
      }
    } catch (error) {
      console.error("Erro ao carregar notes:", error);
      // Tentar gerar conteúdo mesmo se falhar ao buscar notes
      if (currentTopic) {
        await generateContent(topicId, currentTopic);
      }
    }
  }, []);

  /**
   * Gera sugestões do YouTube para o topic
   * 
   * Gera até 5 sugestões de vídeos do YouTube relacionadas ao topic.
   * 
   * @param topicId - ID do topic
   */
  const generateYouTubeSuggestions = useCallback(async (topicId: string) => {
    try {
      const MAX_SUGGESTIONS = 5;
      
      // Gerar sugestões até atingir o limite de 5
      for (let i = 0; i < MAX_SUGGESTIONS; i++) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/youtube-suggestions/suggest?topicId=${topicId}`);
          if (response.ok) {
            const suggestion = await response.json();
            setYoutubeLinks(prev => {
              // Verificar se já temos 5 sugestões
              if (prev.length >= MAX_SUGGESTIONS) {
                return prev;
              }
              // Adicionar nova sugestão e garantir que não exceda 5
              const updated = [...prev, suggestion.url];
              return updated.slice(0, MAX_SUGGESTIONS);
            });
          } else if (response.status === 400) {
            // Limite atingido no backend
            break;
          }
        } catch (error) {
          console.error("Erro ao gerar sugestão:", error);
          break;
        }
      }
    } catch (error) {
      console.error("Erro ao gerar sugestões do YouTube:", error);
    }
  }, []);

  /**
   * Carrega sugestões do YouTube existentes ou gera novas se necessário
   * 
   * Busca sugestões já salvas no Firestore. Se não houver, gera automaticamente.
   * 
   * @param topicId - ID do topic
   */
  const loadYouTubeSuggestions = useCallback(async (topicId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/youtube-suggestions/topic/${topicId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar sugestões do YouTube");
      }
      const suggestions: YouTubeSuggestion[] = await response.json();
      
      // Limitar a 5 sugestões
      const limitedSuggestions = suggestions.slice(0, 5);
      
      if (limitedSuggestions.length > 0) {
        setYoutubeLinks(limitedSuggestions.map(s => s.url));
      } else {
        // Se não houver sugestões, gerar automaticamente
        await generateYouTubeSuggestions(topicId);
      }
    } catch (error) {
      console.error("Erro ao carregar sugestões do YouTube:", error);
      // Tentar gerar sugestões mesmo se falhar
      await generateYouTubeSuggestions(topicId);
    }
  }, [generateYouTubeSuggestions]);

  /**
   * Gera conteúdo com IA usando a API do Gemini
   * 
   * Cria uma note vazia, chama a API do Gemini para gerar conteúdo explicativo
   * sobre o topic e atualiza a note com o conteúdo gerado.
   * 
   * @param topicId - ID do topic
   * @param currentTopic - Dados do topic (usado como contexto no prompt)
   * @throws {Error} Se falhar ao criar note, gerar conteúdo ou atualizar note
   */
  const generateContent = useCallback(async (topicId: string, currentTopic: Topic) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Primeiro, criar uma note vazia para o topic
      const noteResponse = await fetch(`${API_BASE_URL}/api/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "",
          source: "AI-generated",
          topicId: topicId,
        }),
      });

      if (!noteResponse.ok) {
        throw new Error("Erro ao criar note");
      }

      const note = await noteResponse.json();

      // Gerar conteúdo com Gemini
      const geminiResponse = await fetch(`${API_BASE_URL}/api/gemini/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Explique de forma clara e didática sobre: ${currentTopic.title}`,
          topic_id: topicId,
          context: currentTopic.description || undefined,
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error("Erro ao gerar conteúdo com Gemini");
      }

      const geminiData = await geminiResponse.json();
      const generatedContent = geminiData.response;

      // Atualizar a note com o conteúdo gerado
      const updateResponse = await fetch(`${API_BASE_URL}/api/notes/${note.noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: generatedContent,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Erro ao atualizar note");
      }

      setContent(generatedContent);
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
      setError("Erro ao gerar conteúdo. Tente novamente.");
    } finally {
      setIsGenerating(false);
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

  useEffect(() => {
    if (topic) {
      loadNotes(topicId, topic);
      loadYouTubeSuggestions(topicId);
    }
  }, [topic, topicId, loadNotes, loadYouTubeSuggestions]);

  /**
   * Manipula o clique no botão de voltar
   * 
   * Redireciona para a página do subject se disponível, senão para homepage
   */
  const handleBack = () => {
    if (subjectId) router.push(`/subject/${subjectId}`);
    else router.push("/homepage");
  };

  /**
   * Redireciona para a página de agendamento de sessões
   * 
   * Navega para a página de schedule com os parâmetros do subject e topic
   */
  const handleScheduleSession = () =>
    router.push(`/schedule?subjectId=${subjectId}&topicId=${topicId}`);

  /**
   * Salva o conteúdo editado da note
   * 
   * Busca a note existente (priorizando AI-generated) e atualiza com o conteúdo editado.
   * Se não houver note, cria uma nova.
   * 
   * @throws {Error} Se falhar ao buscar ou atualizar/criar note
   */
  const handleSaveContent = async () => {
    if (!topic) return;

    try {
      // Buscar notes existentes
      const notesResponse = await fetch(`${API_BASE_URL}/api/notes/topic/${topicId}`);
      if (notesResponse.ok) {
        const notes: Note[] = await notesResponse.json();
        const aiNote = notes.find(note => note.source === "AI-generated") || notes[0];

        if (aiNote) {
          // Atualizar note existente
          await fetch(`${API_BASE_URL}/api/notes/${aiNote.noteId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: content,
            }),
          });
        } else {
          // Criar nova note
          await fetch(`${API_BASE_URL}/api/notes/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: content,
              source: "manual",
              topicId: topicId,
            }),
          });
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar conteúdo:", error);
      setError("Erro ao salvar conteúdo");
    }
  };

  /**
   * Deleta o topic atual
   * 
   * Solicita confirmação do usuário antes de deletar. Após deletar,
   * redireciona para a página do subject ou homepage.
   * 
   * @throws {Error} Se falhar ao deletar o topic no backend
   */
  const handleDeleteTopic = async () => {
    if (!confirm("Tem certeza que deseja deletar este topic? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/topics/${topicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar topic");
      }

      if (subjectId) {
        router.push(`/subject/${subjectId}`);
      } else {
        router.push("/homepage");
      }
    } catch (error) {
      console.error("Erro ao deletar topic:", error);
      setError("Erro ao deletar topic");
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

          <div className="text-center mb-6 mt-4">
            <h1 className="text-3xl font-bold">{topic.title}</h1>
            {topic.description && (
              <p className="text-muted-foreground mt-2">{topic.description}</p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {isGenerating && (
            <div className="mb-4 p-3 bg-primary/10 text-primary text-sm rounded-lg text-center">
          A Gerar conteúdo com IA...
            </div>
          )}

          <div className="relative w-full">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isGenerating ? "A gerar conteúdo..." : "O conteúdo gerado aparecerá aqui..."}
              className="min-h-[200px] border-primary/30 resize-none pr-12"
              readOnly={!isEditing || isGenerating}
            />

            {!isEditing && !isGenerating && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-3 right-3 text-primary hover:text-primary/80 transition-colors"
              >
                <Pencil size={18} />
              </button>
            )}

            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSaveContent} className="flex-1">
                  Salvar
                </Button>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    // Recarregar conteúdo original
                    if (topic) {
                      loadNotes(topicId, topic);
                    }
                  }} 
                  className="flex-1 bg-background border border-primary/30 text-foreground hover:bg-background/80"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <h2 className="font-bold text-center mt-5 mb-4">YouTube Links</h2>

          {youtubeLinks.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              A carregar sugestões do YouTube...
            </div>
          ) : (
            <div className="space-y-2">
              {youtubeLinks.slice(0, 5).map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border border-primary/30 rounded-lg hover:border-primary/50 transition text-center text-primary hover:underline"
                >
                  {link}
                </a>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mt-8">
            <Button 
              className="w-56" 
              onClick={handleScheduleSession}
              disabled={!subjectId}
            >
              Schedule Study Session
            </Button>

            <Button 
              variant="destructive" 
              className="w-56"
              onClick={handleDeleteTopic}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Topic"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Página wrapper de detalhes do topic
 * 
 * Envolve o TopicDetailContent em Suspense para lidar com o carregamento
 * assíncrono dos parâmetros de rota do Next.js.
 * 
 * Esta é a página principal exportada para a rota `/topic/[topicId]`.
 * 
 * @returns Componente React da página de detalhes do topic
 * 
 * @example
 * ```tsx
 * // Acessível em: /topic/abc123?subjectId=xyz789
 * <TopicDetailPage />
 * ```
 */
export default function TopicDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex pl-72">
        <Sidebar history={[]} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    }>
      <TopicDetailContent />
    </Suspense>
  );
}
