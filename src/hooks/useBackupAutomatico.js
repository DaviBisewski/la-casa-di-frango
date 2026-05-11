/**
 * Hook que dispara backup automático a cada 5 minutos
 * e sincroniza com o servidor quando volta a ficar online
 * Deve ser usado no App.jsx para rodar durante toda a sessão
 */

import { useEffect } from "react";
import { fazerBackupEmergencia } from "../services/storageManager";
import { iniciarSync, sincronizarPendentes } from "../services/storage/syncService";
import { useToast } from "./useToast";

const INTERVALO_BACKUP_MS = 5 * 60 * 1000; // 5 minutos

export function useBackupAutomatico() {
  const { mostrar } = useToast();

  useEffect(() => {
    // backup imediato ao montar
    try {
      fazerBackupEmergencia();
    } catch (err) {
      console.error("❌ Erro no backup automático inicial:", err);
      mostrar("Erro ao fazer backup local", "erro");
    }

    // backup a cada 5 minutos
    const intervalo = setInterval(() => {
      try {
        fazerBackupEmergencia();
        console.log("💾 Backup automático realizado —", new Date().toLocaleTimeString());
      } catch (err) {
        console.error("❌ Erro no backup automático:", err);
      }
    }, INTERVALO_BACKUP_MS);

    // listener de sync ao voltar online
    iniciarSync((resultado) => {
      if (resultado.sincronizados > 0) {
        console.log(`🌐 ${resultado.sincronizados} expediente(s) sincronizados`);
      }
      if (resultado.erros > 0) {
        mostrar(`${resultado.erros} erro(s) ao sincronizar com nuvem`, "aviso");
      }
    });

    return () => clearInterval(intervalo);
  }, [mostrar]);
}