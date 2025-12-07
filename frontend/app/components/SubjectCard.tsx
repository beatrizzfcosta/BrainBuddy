import { Plus } from "lucide-react";

interface SubjectCardProps {
  name?: string;
  isAddButton?: boolean;
  onClick?: () => void;
}

const SubjectCard = ({ name, isAddButton = false, onClick }: SubjectCardProps) => {
  if (isAddButton) {
    return (
      <button
        onClick={onClick}
        className="w-44 h-28 bg-card rounded-2xl shadow-card flex items-center justify-center hover:shadow-lg transition-shadow"
      >
        <Plus className="h-10 w-10 text-primary" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-44 h-28 bg-card rounded-2xl shadow-card flex items-center justify-center hover:shadow-lg transition-shadow"
    >
      <span className="text-xl font-bold text-foreground">{name}</span>
    </button>
  );
};

export default SubjectCard;