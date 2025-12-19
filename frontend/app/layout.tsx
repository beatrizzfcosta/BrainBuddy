import "./globals.css";
import { SidebarProvider } from "./components/SidebarContext";

/**
 * Metadados da aplicação BrainBuddy
 */
export const metadata = {
  title: "BrainBuddy",
  description: "Your AI",
};

/**
 * Layout raiz da aplicação BrainBuddy
 * 
 * Envolve toda a aplicação com o SidebarProvider para gerenciar
 * o estado global da sidebar em todas as páginas.
 * 
 * @param props - Propriedades do layout
 * @param props.children - Componentes filhos (páginas da aplicação)
 * 
 * @returns Componente React do layout raiz
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
