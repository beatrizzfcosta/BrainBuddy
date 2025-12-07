"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import brainbuddyLogo from "@/public/BrainBuddy.png";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // Se houver erro do Google, redirecionar para login com mensagem
      if (error) {
        sessionStorage.setItem("loginError", `Erro na autenticação: ${error}`);
        router.push("/login?error=auth_failed");
        return;
      }

      // Se não houver código, redirecionar para login com mensagem
      if (!code) {
        sessionStorage.setItem("loginError", "Código de autorização não encontrado");
        router.push("/login?error=no_code");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/oauth/callback?code=${code}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          sessionStorage.setItem("loginError", "Erro ao processar autenticação. Tente novamente.");
          router.push("/login?error=callback_failed");
          return;
        }

        const data = await response.json();
        
        // Salvar dados do usuário no localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userId", data.id);
        }

        // Redirecionar imediatamente para a homepage
        router.push("/homepage");
      } catch (error) {
        console.error("Erro ao processar callback:", error);
        sessionStorage.setItem("loginError", "Erro ao processar autenticação. Tente novamente.");
        router.push("/login?error=callback_failed");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  // Mostrar apenas logo e loading enquanto processa
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-8">
        <Image
          src={brainbuddyLogo}
          alt="BrainBuddy Logo"
          className="rounded-2xl"
          width={128}
          height={128}
        />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </div>
  );
};

const CallbackPage = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-8">
          <Image
            src={brainbuddyLogo}
            alt="BrainBuddy Logo"
            className="rounded-2xl"
            width={128}
            height={128}
          />
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
};

export default CallbackPage;

