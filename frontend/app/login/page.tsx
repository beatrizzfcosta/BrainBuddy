"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import GoogleIcon from "@/app/components/GoogleIcon";
import brainbuddyLogo from "@/public/BrainBuddy.png";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login with:", email, password);
    window.location.href = "/homepage";
  };

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
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-start">
                <span className="bg-card pr-4 text-sm text-muted-foreground">
                  Or continue with
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

            {/* Login Button */}
            <Button type="submit" size="lg" className="w-full">
              Log in
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
