import "./globals.css";
import { SidebarProvider } from "./components/SidebarContext";

export const metadata = {
  title: "BrainBuddy",
  description: "Your AI",
};

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
