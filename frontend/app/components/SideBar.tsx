import { Menu } from "lucide-react";
import Image from "next/image";
import { HistoryItem } from "@/app/types";

interface SidebarProps {
  history: HistoryItem[];
}

const Sidebar = ({ history }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-card rounded-r-2xl p-6 shadow-card flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <Image
          src="/BrainBuddy.png"
          alt="BrainBuddy Logo"
          width={56}
          height={56}
          className="h-14 w-14 rounded-xl object-cover"
        />
        <button className="text-primary hover:text-primary/80 transition-colors">
          <Menu className="h-8 w-8" />
        </button>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-4">History</h2>
      
      <div className="flex-1 space-y-1">
        {history.map((item) => (
          <button
            key={item.id}
            className="w-full text-left py-2 px-1 text-muted-foreground hover:text-foreground transition-colors text-sm border-b border-border/50"
          >
            {item.subjectAbbr} - {item.topicName}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
