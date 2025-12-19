"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import GoogleIcon from "@/app/components/GoogleIcon";
import brainbuddyLogo from "@/public/BrainBuddy.png";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Página de login do BrainBuddy
 * 
 * Permite autenticação via Google OAuth. O login com email/senha está desabilitado.
 * Verifica se o usuário já está autenticado e redireciona para a homepage se necessário.
 * 
 * @returns Componente React da página de login
 */
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verifica se o usuário já está autenticado e redireciona para homepage
   * Também recupera mensagens de erro do callback OAuth (se houver)
   */
  useEffect(() => {
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (storedUserId) {
      window.location.href = "/homepage";
      return;
    }
    // Recupera mensagem de erro prévia do callback (se houver)
    const callbackError = sessionStorage.getItem("loginError");
    if (callbackError) {
      setError(callbackError);
      sessionStorage.removeItem("loginError");
    }
  }, []);

  /**
   * Manipula o submit do formulário de login
   * 
   * Atualmente desabilitado - apenas exibe mensagem pedindo uso do Google OAuth
   * 
   * @param e - Evento de submit do formulário
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Login com e-mail/senha não disponível. Use Google.");
  };

  /**
   * Inicia o processo de autenticação com Google OAuth
   * 
   * Busca a URL de autorização do backend e redireciona o usuário para o Google.
   * Trata erros de conexão e exibe mensagens apropriadas.
   * 
   * @throws {Error} Se falhar ao obter URL de autorização do backend
   */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/oauth/login`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de autorização não encontrada na resposta");
      }
    } catch (error) {
      console.error("Erro ao iniciar login com Google:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro desconhecido ao iniciar login com Google");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl bg-card p-8 shadow-card">
          
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <Image
              src={brainbuddyLogo}
              alt="BrainBuddy Logo"
              className="rounded-2xl"
              width={128}
              height={128}
            />
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary">
              BRAINBUDDY
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled
            />

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-start">
                <span className="bg-card pr-4 text-sm text-muted-foreground">
                  Continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="google"
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon />
            </Button>

            {/* Login Button (disabled) */}
            <Button type="submit" size="lg" className="w-full" disabled>
              Log in (disabled)
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
