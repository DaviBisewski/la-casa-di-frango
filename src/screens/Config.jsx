import { useState, useEffect, useRef } from "react";
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

import exportarIcon from "../assets/icons/exportar.svg";
import importarIcon from "../assets/icons/importar.svg";

export default function Config() {
  const { mostrar }  = useToast();
  const inputRef     = useRef(null);

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

    // monitora conexão
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  function formatarTS(ts) {
    if (!ts) return "Nunca";
    const date = typeof ts === "string" ? new Date(ts) : ts;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).format(date);
  }

  async function handleExportar() {
    try {
      await exportarJSON();
      setUltimoBackup(getUltimoBackupTimestamp());
      mostrar("Backup exportado com sucesso! 📦", "sucesso");
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
      mostrar(`${importados} expedientes importados! ✅`, "sucesso");
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
    if (erros > 0) mostrar(`${erros} erro(s) ao sincronizar`, "erro");
    else if (sincronizados > 0) mostrar(`${sincronizados} expediente(s) sincronizados ☁️`, "sucesso");
    else mostrar("Tudo já estava sincronizado ✅", "info");
  }

  async function handleSyncBaixar() {
    if (!online) { mostrar("Sem conexão com a internet", "aviso"); return; }
    setSyncLoading(true);
    const { importados, erro } = await baixarDoSupabase();
    setSyncLoading(false);
    if (erro) mostrar(erro, "erro");
    else {
      const todos = await getTodosExpedientesIDB();
      setTotalDias(todos.length);
      mostrar(`${importados} expedientes baixados da nuvem ☁️`, "sucesso");
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16 space-y-10">

      {/* Status de conexão */}
      <div className={`flex items-center gap-4 px-8 py-5 rounded-2xl text-2xl font-semibold
        ${online ? "bg-[#D4F1E6] text-[#0F4C3A]" : "bg-red-50 text-red-700"}`}>
        <div className={`w-4 h-4 rounded-full ${online ? "bg-[#0F4C3A]" : "bg-red-500"} animate-pulse`} />
        {online ? "Conectado à internet" : "Sem conexão — dados salvos localmente"}
      </div>

      {/* Card informativo */}
      <div className="bg-[#D4F1E6] rounded-2xl p-10">
        <p className="text-[#0F4C3A] text-2xl font-extrabold mb-6">
          Como sincronizar:
        </p>
        <div className="space-y-3">
          {["1 - Exporte o backup", "2 - Envie para outro dispositivo", "3 - Importe aqui"].map((l) => (
            <p key={l} className="text-[#0F4C3A] text-2xl font-medium">{l}</p>
          ))}
        </div>
      </div>

      {/* Metadados */}
      <div className="space-y-2">
        <p className="text-[#0F4C3A]/60 text-2xl font-medium">
          Último backup local: {formatarTS(ultimoBackup)}
          {totalDias > 0 && <span> • Total: {totalDias} {totalDias === 1 ? "dia" : "dias"}</span>}
        </p>
        {supabaseAtivo() && (
          <p className="text-[#0F4C3A]/60 text-2xl font-medium">
            Último sync na nuvem: {formatarTS(ultimoSync)}
            {pendentes > 0 && (
              <span className="text-amber-600 font-bold"> • {pendentes} pendente(s)</span>
            )}
          </p>
        )}
      </div>

      {/* Sync Supabase — só aparece se configurado */}
      {supabaseAtivo() && (
        <div className="space-y-4">
          <h3 className="text-[#0F4C3A] text-3xl font-extrabold">Nuvem</h3>

          <button
            onClick={handleSyncEnviar}
            disabled={syncLoading || !online}
            className="w-full flex items-center justify-center gap-6
                       bg-[#0F4C3A] text-white text-3xl font-bold
                       py-10 rounded-2xl hover:bg-[#0a3528]
                       active:scale-[0.99] transition-all shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ☁️ {syncLoading ? "Sincronizando..." : "Enviar para nuvem"}
          </button>

          <button
            onClick={handleSyncBaixar}
            disabled={syncLoading || !online}
            className="w-full flex items-center justify-center gap-6
                       border-2 border-[#0F4C3A]/20 text-[#0F4C3A] text-3xl font-bold
                       py-10 rounded-2xl hover:bg-[#0F4C3A]/5
                       active:scale-[0.99] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⬇️ {syncLoading ? "Baixando..." : "Baixar da nuvem"}
          </button>
        </div>
      )}

      {/* Backup local */}
      <div className="space-y-4">
        <h3 className="text-[#0F4C3A] text-3xl font-extrabold">Backup local</h3>

        <button
          onClick={handleExportar}
          className="w-full flex items-center justify-center gap-8
                     bg-[#0F4C3A] text-white text-4xl font-bold
                     py-12 rounded-2xl hover:bg-[#0a3528]
                     active:scale-[0.99] transition-all shadow-lg"
        >
          <img src={exportarIcon} alt="Exportar" className="w-14 h-14 brightness-0 invert" />
          Exportar
        </button>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-8
                     border-2 border-[#0F4C3A]/20 text-[#0F4C3A] text-4xl font-bold
                     py-12 rounded-2xl hover:bg-[#0F4C3A]/5
                     active:scale-[0.99] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src={importarIcon} alt="Importar" className="w-14 h-14" />
          {loading ? "Importando..." : "Importar"}
        </button>

        <input ref={inputRef} type="file" accept=".json" onChange={handleImportar} className="hidden" />
      </div>

    </div>
  );
}