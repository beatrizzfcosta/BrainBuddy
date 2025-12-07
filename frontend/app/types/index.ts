export interface Subject {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
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
  topicName: string;
}
