/**
 * Representa uma disciplina/matéria do usuário
 * 
 * @property id - ID único do subject (formato alternativo)
 * @property subjectId - ID único do subject (formato principal)
 * @property name - Nome do subject
 * @property description - Descrição do subject
 * @property userId - ID do usuário proprietário
 * @property createdAt - Data de criação (Date ou ISO string)
 */
export interface Subject {
  id?: string;
  subjectId?: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date | string;
}

/**
 * Representa um tópico de estudo dentro de um subject
 * 
 * @property topicId - ID único do topic (formato principal)
 * @property id - ID único do topic (formato alternativo)
 * @property title - Título do topic
 * @property description - Descrição opcional do topic
 * @property subjectId - ID do subject ao qual pertence
 */
export interface Topic {
  topicId?: string;
  id?: string;
  title: string;
  description?: string;
  subjectId: string;
}

/**
 * Representa uma nota/anotação relacionada a um topic
 * 
 * @property noteId - ID único da note
 * @property content - Conteúdo da nota (pode ser gerado por IA ou manual)
 * @property source - Origem da nota ("AI-generated", "manual", "extracted from slide")
 * @property topicId - ID do topic relacionado
 * @property createdAt - Data de criação (ISO string)
 */
export interface Note {
  noteId: string;
  content: string;
  source: string;
  topicId: string;
  createdAt: string;
}

/**
 * Representa uma sugestão de vídeo do YouTube para um topic
 * 
 * @property suggestionId - ID único da sugestão
 * @property title - Título do vídeo
 * @property url - URL do vídeo no YouTube
 * @property topicId - ID do topic relacionado
 */
export interface YouTubeSuggestion {
  suggestionId: string;
  title: string;
  url: string;
  topicId: string;
}

/**
 * Representa uma sessão de estudo agendada (formato para exibição)
 * 
 * @property id - ID único da sessão
 * @property subjectName - Nome do subject relacionado
 * @property date - Data da sessão
 * @property time - Horário formatado (ex: "14:00 - 15:30")
 */
export interface StudySession {
  id: string;
  subjectName: string;
  date: Date;
  time: string;
}

/**
 * Representa um item do histórico de navegação (usado na sidebar)
 * 
 * @property id - ID do topic
 * @property subjectAbbr - Abreviação do nome do subject (3 primeiras letras)
 * @property subjectName - Nome completo do subject (opcional)
 * @property topicName - Nome do topic
 * @property subjectId - ID do subject
 */
export interface HistoryItem {
  id: string;
  subjectAbbr: string;
  subjectName?: string;
  topicName: string;
  subjectId: string;
}
