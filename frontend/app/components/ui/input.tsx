import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Propriedades do componente Input
 * 
 * Estende todas as propriedades padrão de um input HTML
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Componente Input reutilizável
 * 
 * Input estilizado com suporte a todas as propriedades padrão de input HTML.
 * Inclui estilos de foco, placeholder e estados desabilitados.
 * 
 * @param props - Propriedades do input (type, placeholder, value, onChange, etc.)
 * @param props.className - Classes CSS adicionais
 * 
 * @example
 * ```tsx
 * <Input type="email" placeholder="seu@email.com" />
 * <Input type="password" value={password} onChange={handleChange} />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-14 w-full rounded-lg border border-input bg-card px-4 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
