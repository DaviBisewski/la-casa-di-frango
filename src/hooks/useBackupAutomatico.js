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

  useEffect(() => {
    // backup imediato ao montar
    fazerBackupEmergencia();

    // backup a cada 5 minutos
    const intervalo = setInterval(() => {
      fazerBackupEmergencia();
      console.log("💾 Backup automático realizado —", new Date().toLocaleTimeString());
    }, INTERVALO_BACKUP_MS);

    // listener de sync ao voltar online
    iniciarSync((resultado) => {
      if (resultado.sincronizados > 0) {
        console.log(`🌐 ${resultado.sincronizados} expediente(s) sincronizados`);
      }
    });

    return () => clearInterval(intervalo);
  }, []);
}