import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar classes CSS do Tailwind
 * 
 * Combina e mescla classes CSS de forma inteligente, resolvendo conflitos
 * entre classes do Tailwind (ex: p-4 e p-2 -> mantém apenas p-4).
 * 
 * @param inputs - Classes CSS a serem combinadas (strings, objetos, arrays, etc.)
 * @returns String com classes CSS mescladas
 * 
 * @example
 * ```ts
 * cn("p-4", "bg-red-500", { "text-white": true }) // "p-4 bg-red-500 text-white"
 * cn("p-4", "p-2") // "p-2" (p-2 sobrescreve p-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
