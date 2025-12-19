import React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";

/**
 * Variantes de estilo do botão usando class-variance-authority
 * 
 * Define as classes CSS para diferentes variantes e tamanhos de botão.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        google: "bg-google hover:bg-google-hover",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Propriedades do componente Button
 * 
 * @property asChild - Se true, renderiza como Slot do Radix UI (permite composição)
 * @property variant - Variante visual do botão (default, google, destructive)
 * @property size - Tamanho do botão (default, lg)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Componente Button reutilizável
 * 
 * Botão estilizado com suporte a variantes, tamanhos e composição via Radix UI Slot.
 * 
 * @param props - Propriedades do botão
 * @param props.variant - Variante visual (default, google, destructive)
 * @param props.size - Tamanho (default, lg)
 * @param props.asChild - Se true, renderiza como Slot para composição
 * @param props.className - Classes CSS adicionais
 * 
 * @example
 * ```tsx
 * <Button variant="default" size="lg">Clique aqui</Button>
 * <Button variant="google" onClick={handleGoogleLogin}>Login com Google</Button>
 * <Button variant="destructive" onClick={handleDelete}>Deletar</Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
