import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import {
  exportarJSON,
  importarJSON,
  getUltimoBackupTimestamp,
} from "../services/storage/backupService";
import { getTodosExpedientesIDB } from "../services/storage/indexedDB";
import {
  sincronizarPendentes,
  baixarDoSupabase,
  getUltimoSync,
  isOnline,
  getPendenteCount,
} from "../services/storage/syncService";
import { supabaseAtivo } from "../services/storage/supabaseClient";

import { StatusConexao }    from "../components/Layout/StatusConexao";
import { CardComoSincronizar } from "../components/Cards/CardComoSincronizar";
import { MetadadosBackup }  from "../components/Layout/MetadadosBackup";
import { SecaoNuvem }       from "../components/Layout/SecaoNuvem";
import { SecaoBackupLocal } from "../components/Layout/SecaoBackupLocal";

/**
 * Tela de configurações
 * Orquestra backup local, sync com Supabase e status de conexão
 */
export default function Config() {
  const { mostrar } = useToast();

  const [loading, setLoading]           = useState(false);
  const [syncLoading, setSyncLoading]   = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState(null);
  const [ultimoSync, setUltimoSync]     = useState(null);
  const [totalDias, setTotalDias]       = useState(0);
  const [pendentes, setPendentes]       = useState(0);
  const [online, setOnline]             = useState(isOnline());

  useEffect(() => {
    async function carregar() {
      const ts    = getUltimoBackupTimestamp();
      const sync  = await getUltimoSync();
      const todos = await getTodosExpedientesIDB();
      setUltimoBackup(ts);
      setUltimoSync(sync);
      setTotalDias(todos.length);
      setPendentes(getPendenteCount());
    }
    carregar();

    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function handleExportar() {
    try {
      await exportarJSON();
      setUltimoBackup(getUltimoBackupTimestamp());
      mostrar("Backup exportado com sucesso!", "sucesso");
    } catch {
      mostrar("Erro ao exportar backup", "erro");
    }
  }

  async function handleImportar(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setLoading(true);
    const { importados, erro } = await importarJSON(arquivo);
    setLoading(false);
    if (erro) {
      mostrar(erro, "erro");
    } else {
      const todos = await getTodosExpedientesIDB();
      setTotalDias(todos.length);
      mostrar(`${importados} expedientes importados!`, "sucesso");
    }
    e.target.value = "";
  }

  async function handleSyncEnviar() {
    if (!online) { mostrar("Sem conexão com a internet", "aviso"); return; }
    setSyncLoading(true);
    const { sincronizados, erros } = await sincronizarPendentes();
    setUltimoSync(await getUltimoSync());
    setPendentes(getPendenteCount());
    setSyncLoading(false);
    if (erros > 0)          mostrar(`${erros} erro(s) ao sincronizar`, "erro");
    else if (sincronizados > 0) mostrar(`${sincronizados} expediente(s) sincronizados`, "sucesso");
    else                    mostrar("Tudo já estava sincronizado", "info");
  }

  async function handleSyncBaixar() {
    if (!online) { mostrar("Sem conexão com a internet", "aviso"); return; }
    setSyncLoading(true);
    const { importados, erro } = await baixarDoSupabase();
    setSyncLoading(false);
    if (erro) {
      mostrar(erro, "erro");
    } else {
      const todos = await getTodosExpedientesIDB();
      setTotalDias(todos.length);
      mostrar(`${importados} expedientes baixados da nuvem`, "sucesso");
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16 space-y-10">

      <StatusConexao online={online} />

      <CardComoSincronizar />

      <MetadadosBackup
        ultimoBackup={ultimoBackup}
        ultimoSync={ultimoSync}
        totalDias={totalDias}
        pendentes={pendentes}
        supabaseAtivo={supabaseAtivo()}
      />

      {supabaseAtivo() && (
        <SecaoNuvem
          online={online}
          loading={syncLoading}
          onEnviar={handleSyncEnviar}
          onBaixar={handleSyncBaixar}
        />
      )}

      <SecaoBackupLocal
        loading={loading}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

    </div>
  );
}