import { Check, X } from "lucide-react";
import { StudySession } from "@/app/types";

/**
 * Propriedades do componente StudySessionCard
 * 
 * @property session - Dados da sessão de estudo a ser exibida
 * @property onConfirm - Callback executado ao confirmar a sessão (marcar como completa)
 * @property onCancel - Callback executado ao cancelar a sessão (marcar como perdida)
 */
interface StudySessionCardProps {
  session: StudySession;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Componente de card para exibir uma sessão de estudo agendada
 * 
 * Exibe informações da sessão (subject, data, horário) e botões para
 * confirmar ou cancelar a sessão.
 * 
 * @param props - Propriedades do componente
 * 
 * @example
 * ```tsx
 * <StudySessionCard
 *   session={session}
 *   onConfirm={() => handleConfirmSession(session.id)}
 *   onCancel={() => handleCancelSession(session.id)}
 * />
 * ```
 */
const StudySessionCard = ({ session, onConfirm, onCancel }: StudySessionCardProps) => {
  /**
   * Formata uma data para o formato português (DD/MM/YYYY)
   * 
   * @param date - Data a ser formatada
   * @returns String formatada no formato DD/MM/YYYY
   */
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