import { Check, X } from "lucide-react";
import { StudySession } from "@/app/types";

interface StudySessionCardProps {
  session: StudySession;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const StudySessionCard = ({ session, onConfirm, onCancel }: StudySessionCardProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-44 bg-card rounded-2xl shadow-card p-4 text-center">
      <h3 className="text-xl font-bold text-foreground mb-1">{session.subjectName}</h3>
      <p className="text-sm text-muted-foreground font-semibold">
        {formatDate(session.date)}
      </p>
      <p className="text-sm text-muted-foreground mb-3">at {session.time}</p>
      
      <div className="flex justify-center gap-4">
        <button
          onClick={onConfirm}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Check className="h-7 w-7 text-green-500 stroke-[3]" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 hover:scale-110 transition-transform"
        >
          <X className="h-7 w-7 text-red-500 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

export default StudySessionCard;