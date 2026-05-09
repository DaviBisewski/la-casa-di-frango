/**
 * Cliente Supabase configurado com as variáveis de ambiente
 * Exporta instância única reutilizada em todo o app
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("⚠️ Supabase não configurado — funcionando só offline");
}

/**
 * Cliente Supabase — null se não configurado
 * Todos os serviços checam se é null antes de usar
 */
export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/**
 * Verifica se o Supabase está configurado e acessível
 * @returns {boolean}
 */
export function supabaseAtivo() {
  return supabase !== null;
}