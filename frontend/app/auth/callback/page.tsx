"use client";

import { useEffect, Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import brainbuddyLogo from "@/public/BrainBuddy.png";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessed = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Garantir que o callback execute apenas uma vez
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;

      // Extrair valores dentro do efeito para evitar dependências desnecessárias
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
          const message = errorText || "Erro ao processar autenticação. Tente novamente.";
          sessionStorage.setItem("loginError", message);
          setErrorMsg(message);
          return; // não redireciona imediatamente para permitir exibir erro
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
        const message =
          error instanceof Error
            ? `Erro ao processar autenticação: ${error.message}`
            : "Erro ao processar autenticação. Tente novamente.";
        console.error("Erro ao processar callback:", error);
        sessionStorage.setItem("loginError", message);
        setErrorMsg(message);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // searchParams é omitido intencionalmente: usamos useRef para garantir execução única
    // e os valores da URL não mudam após o primeiro render
  }, [router]);

  // Mostrar estado de erro (sem redirecionar) ou loading
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <Image
          src={brainbuddyLogo}
          alt="BrainBuddy Logo"
          className="rounded-2xl"
          width={128}
          height={128}
        />
        {errorMsg ? (
          <>
            <p className="text-red-500 text-sm max-w-md">{errorMsg}</p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-white text-sm"
              onClick={() => router.push("/login")}
            >
              Voltar para login
            </button>
          </>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        )}
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

