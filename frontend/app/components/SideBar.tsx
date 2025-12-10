"use client";

import { Menu, ChevronRight, ChevronDown, Folder, FolderOpen, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { HistoryItem } from "@/app/types";
import { useSidebar } from "./SidebarContext";

interface SidebarProps {
  history: HistoryItem[];
}

interface GroupedHistory {
  subjectId: string;
  subjectName: string;
  topics: HistoryItem[];
}

const Sidebar = ({ history }: SidebarProps) => {
  const router = useRouter();
  const { isOpen, setIsOpen } = useSidebar();
  // Expandir todos os subjects por padrão
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(() => {
    const subjectIds = new Set<string>();
    history.forEach((item) => {
      if (item.subjectId) {
        subjectIds.add(item.subjectId);
      }
    });
    return subjectIds;
  });

  // Agrupar history por subject
  const groupedHistory = useMemo(() => {
    const grouped = new Map<string, GroupedHistory>();
    
    history.forEach((item) => {
      if (!item.subjectId) return;
      
      const subjectId = item.subjectId;
      if (!grouped.has(subjectId)) {
        // Usar o nome completo do subject se disponível, senão usar a abreviação
        const firstItem = history.find(h => h.subjectId === subjectId);
        const subjectName = firstItem?.subjectName || firstItem?.subjectAbbr || "Subject";
        
        grouped.set(subjectId, {
          subjectId,
          subjectName: subjectName,
          topics: [],
        });
      }
      
      grouped.get(subjectId)!.topics.push(item);
    });
    
    return Array.from(grouped.values());
  }, [history]);

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    const topicId = item.id;
    if (topicId) {
      const subjectIdParam = item.subjectId ? `?subjectId=${item.subjectId}` : "";
      router.push(`/topic/${topicId}${subjectIdParam}`);
    }
  };

  const handleSubjectClick = (subjectId: string) => {
    router.push(`/subject/${subjectId}`);
  };

  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-0 h-full w-16 bg-card rounded-r-2xl shadow-card flex flex-col items-center py-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="text-primary hover:text-primary/80 transition-colors mb-4"
          title="Open sidebar"
        >
          <Menu className="h-8 w-8" />
        </button>
        <Image
          src="/BrainBuddy.png"
          alt="BrainBuddy Logo"
          width={40}
          height={40}
          className="h-10 w-10 rounded-xl object-cover"
        />
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-card rounded-r-2xl p-6 shadow-card flex flex-col z-50 transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <Image
          src="/BrainBuddy.png"
          alt="BrainBuddy Logo"
          width={56}
          height={56}
          className="h-14 w-14 rounded-xl object-cover"
        />
        <button
          onClick={() => setIsOpen(false)}
          className="text-primary hover:text-primary/80 transition-colors"
          title="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-4">History</h2>
      
      <div className="flex-1 overflow-y-auto space-y-1">
        {groupedHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No history available
          </p>
        ) : (
          groupedHistory.map((group) => {
            const isExpanded = expandedSubjects.has(group.subjectId);
            return (
              <div key={group.subjectId} className="mb-1">
                {/* Botão do Subject (Pasta) */}
                <button
                  onClick={() => toggleSubject(group.subjectId)}
                  className="w-full text-left py-2 px-2 flex items-center gap-2 text-foreground hover:bg-background/50 transition-colors rounded-md group"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm flex-1 truncate">
                    {group.subjectName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({group.topics.length})
                  </span>
                </button>
                
                {/* Lista de Topics (quando expandido) */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {group.topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleHistoryItemClick(topic)}
                        className="w-full text-left py-1.5 px-2 text-muted-foreground hover:text-foreground hover:bg-background/30 transition-colors text-sm rounded-md cursor-pointer truncate"
                      >
                        {topic.topicName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
