"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Tipo do contexto da sidebar
 * 
 * @property isOpen - Indica se a sidebar está aberta ou fechada
 * @property setIsOpen - Função para alterar o estado de abertura da sidebar
 */
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Provider do contexto da sidebar
 * 
 * Gerencia o estado global de abertura/fechamento da sidebar
 * 
 * @param props - Propriedades do provider
 * @param props.children - Componentes filhos que terão acesso ao contexto
 * 
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <App />
 * </SidebarProvider>
 * ```
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Hook para acessar o contexto da sidebar
 * 
 * @returns Objeto com estado e função para controlar a sidebar
 * @throws {Error} Se usado fora do SidebarProvider
 * 
 * @example
 * ```tsx
 * const { isOpen, setIsOpen } = useSidebar();
 * setIsOpen(false); // Fecha a sidebar
 * ```
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

/**
 * Hook utilitário para obter a classe de padding baseada no estado da sidebar
 * 
 * Retorna a classe Tailwind apropriada para ajustar o padding do conteúdo
 * principal quando a sidebar está aberta ou fechada.
 * 
 * @returns Classe CSS do Tailwind ('pl-72' se aberta, 'pl-16' se fechada)
 * 
 * @example
 * ```tsx
 * const paddingClass = useSidebarPadding();
 * <main className={paddingClass}>Conteúdo</main>
 * ```
 */
export function useSidebarPadding() {
  const { isOpen } = useSidebar();
  return isOpen ? 'pl-72' : 'pl-16';
}

