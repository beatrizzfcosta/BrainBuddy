import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Propriedades do componente Textarea
 * 
 * Estende todas as propriedades padrão de um textarea HTML
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Componente Textarea reutilizável
 * 
 * Textarea estilizado com suporte a todas as propriedades padrão de textarea HTML.
 * Inclui estilos de foco, placeholder e estados desabilitados.
 * 
 * @param props - Propriedades do textarea (rows, placeholder, value, onChange, etc.)
 * @param props.className - Classes CSS adicionais
 * 
 * @example
 * ```tsx
 * <Textarea placeholder="Digite sua descrição..." rows={5} />
 * <Textarea value={content} onChange={handleChange} disabled />
 * ```
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };