import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com credenciais fixas
 * App interno — credenciais embutidas para funcionar sem .env
 */
const SUPABASE_URL = "https://jbhqtzbtzzalypkqtkek.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiaHF0emJ0enphbHlwa3F0a2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjExMjQsImV4cCI6MjA5MzgzNzEyNH0.uAH0JkQpnhjovx2j2eYPTf6aHxqJ4LoSirfN5XnO-cM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Sempre ativo — credenciais fixas no código
 */
export function supabaseAtivo() {
  return true;
}