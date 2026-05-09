import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StartShift from '../components/ui/ButtonExpediente';
import { useExpediente } from '../hooks/useExpediente';
import { useToast } from '../contexts/ToastContext';
import { MENSAGENS } from '../services/toastService';
import HistoricoCard from '../components/Cards/HistoricoCard';
import { CalendarioFiltro } from '../components/Layout/CalendarioFiltro';

/** Quantidade de cards visíveis antes do "Ver mais" */
const LIMITE_INICIAL = 5;

export default function Home() {
  const { getHistorico, verExpediente } = useExpediente();
  const { mostrar } = useToast();
  const navigate = useNavigate();

  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(null);
  const [verTodos, setVerTodos] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const dados = await getHistorico();

      /**
       * Ordena: ativo sempre primeiro, depois por data decrescente
       * Garante que o expediente do dia aparece no topo
       */
      const ordenado = (dados || []).sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (b.status === "active" && a.status !== "active") return 1;
        return b.date.localeCompare(a.date);
      });

      setHistorico(ordenado);
      setCarregando(false);
    }
    carregar();
  }, []);

  const datasComExpediente = historico.map((exp) => exp.date);

  /** Filtra por data e reseta paginação ao trocar filtro */
  const historicoFiltrado = dataFiltro
    ? historico.filter((exp) => exp.date === dataFiltro)
    : historico;

  /** Aplica limite ou mostra todos */
  const historicoVisivel = verTodos
    ? historicoFiltrado
    : historicoFiltrado.slice(0, LIMITE_INICIAL);

  const restantes = historicoFiltrado.length - LIMITE_INICIAL;

  function handleFiltro(data) {
    setDataFiltro(data);
    setVerTodos(false);
  }

  function handleVerExpediente(exp) {
    const data = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short', day: 'numeric', month: 'short'
    }).format(new Date(exp.date + "T12:00:00"));

    if (exp.status === "active") {
      verExpediente(exp);
      mostrar(MENSAGENS.EXPEDIENTE_VISUALIZADO(data), "info");
      navigate("/dashboard");
    } else {
      mostrar(MENSAGENS.EXPEDIENTE_VISUALIZADO(data), "info");
      navigate("/historico", { state: { expediente: exp } });
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto">

      <StartShift onStart={() => navigate("/estoque")} />

      {/* Loading */}
      {carregando && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-[#0F4C3A]/20
                          border-t-[#0F4C3A] animate-spin" />
        </div>
      )}

      {/* Histórico */}
      {!carregando && historico.length > 0 && (
        <section className="px-12 mt-20 pb-20">

          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#0F4C3A] text-4xl font-extrabold uppercase tracking-tight">
              Histórico de Vendas
            </h2>
            <CalendarioFiltro
              dataSelecionada={dataFiltro}
              onSelecionar={handleFiltro}
              onLimpar={() => { setDataFiltro(null); setVerTodos(false); }}
              datasComExpediente={datasComExpediente}
            />
          </div>

          {historicoFiltrado.length === 0 ? (
            <p className="text-[#0F4C3A]/40 text-2xl text-center py-16">
              Nenhum expediente encontrado nessa data
            </p>
          ) : (
            <>
              <div className="space-y-6">
                {historicoVisivel.map((exp) => (
                  <HistoricoCard
                    key={exp.id}
                    expediente={exp}
                    onClick={() => handleVerExpediente(exp)}
                  />
                ))}
              </div>

              {/* Botão Ver mais — só aparece quando há itens ocultos */}
              {!verTodos && restantes > 0 && (
                <button
                  onClick={() => setVerTodos(true)}
                  className="w-full mt-8 py-9 rounded-4xl border-2 border-[#0F4C3A]
                             text-[#0F4C3A] text-3xl font-bold
                             hover:border-[#0F4C3A]/50 hover:bg-[#0F4C3A]/5
                             active:scale-[0.99] transition-all"
                >
                  Ver + {restantes} {restantes === 1 ? "expediente" : "expedientes"}
                </button>
              )}
            </>
          )}

        </section>
      )}

    </div>
  );
}