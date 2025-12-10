export interface Subject {
  id?: string;
  subjectId?: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date | string;
}

export interface Topic {
  topicId?: string;
  id?: string;
  title: string;
  description?: string;
  subjectId: string;
}

export interface Note {
  noteId: string;
  content: string;
  source: string;
  topicId: string;
  createdAt: string;
}

export interface YouTubeSuggestion {
  suggestionId: string;
  title: string;
  url: string;
  topicId: string;
}

export interface StudySession {
  id: string;
  subjectName: string;
  date: Date;
  time: string;
}

export interface HistoryItem {
  id: string;
  subjectAbbr: string;
  subjectName?: string;
  topicName: string;
  subjectId?: string;
}
