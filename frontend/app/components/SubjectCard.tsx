import { Plus } from "lucide-react";

/**
 * Propriedades do componente SubjectCard
 * 
 * @property name - Nome do subject a ser exibido (opcional se for botão de adicionar)
 * @property isAddButton - Se true, renderiza como botão de adicionar novo subject
 * @property onClick - Callback executado ao clicar no card
 */
interface SubjectCardProps {
  name?: string;
  isAddButton?: boolean;
  onClick?: () => void;
}

/**
 * Componente de card para exibir um subject ou botão de adicionar novo subject
 * 
 * Pode ser usado de duas formas:
 * - Como card de subject: exibe o nome do subject
 * - Como botão de adicionar: exibe um ícone de "+"
 * 
 * @param props - Propriedades do componente
 * 
 * @example
 * ```tsx
 * // Card de subject
 * <SubjectCard name="Matemática" onClick={() => router.push('/subject/123')} />
 * 
 * // Botão de adicionar
 * <SubjectCard isAddButton onClick={handleAddSubject} />
 * ```
 */
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