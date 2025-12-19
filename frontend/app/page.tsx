import { redirect } from "next/navigation";

/**
 * Página raiz da aplicação
 * 
 * Redireciona automaticamente para a página de login.
 * Esta é a primeira página que os usuários veem ao acessar a aplicação.
 * 
 * @returns Redireciona para /login
 */
export default function Home() {
  redirect("/login");
}
