import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StartShift from '../components/ui/ButtonExpediente';
import { useExpediente } from '../hooks/useExpediente';
import { useToast } from '../contexts/ToastContext';
import { MENSAGENS } from '../services/toastService';
import HistoricoCard from '../components/Cards/HistoricoCard';
import { CalendarioFiltro } from '../components/Layout/CalendarioFiltro';

export default function Home() {
  const { getHistorico, verExpediente } = useExpediente();
  const { mostrar } = useToast();
  const navigate = useNavigate();

  /** Data selecionada no calendário no formato YYYY-MM-DD ou null */
  const [dataFiltro, setDataFiltro] = useState(null);

  const historico = getHistorico();

  /**
   * Lista de datas que possuem expediente — usada para destacar no calendário
   * Usa expediente.date que já está no formato YYYY-MM-DD
   */
  const datasComExpediente = historico.map((exp) => exp.date);

  /**
   * Filtra o histórico pela data selecionada
   * Se nenhuma data selecionada, mostra todos
   */
  const historicoFiltrado = dataFiltro
    ? historico.filter((exp) => exp.date === dataFiltro)
    : historico;

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

      {/* Botão de iniciar novo expediente */}
      <StartShift onStart={() => navigate("/estoque")} />

      {/* Histórico de vendas */}
      {historico.length > 0 && (
        <section className="px-12 mt-20 pb-20">

          {/* Cabeçalho com título e filtro de calendário */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#0F4C3A] text-4xl font-extrabold uppercase tracking-tight">
              Histórico de Vendas
            </h2>

            <CalendarioFiltro
              dataSelecionada={dataFiltro}
              onSelecionar={setDataFiltro}
              onLimpar={() => setDataFiltro(null)}
              datasComExpediente={datasComExpediente}
            />
          </div>

          {/* Lista filtrada */}
          {historicoFiltrado.length === 0 ? (
            <p className="text-[#0F4C3A]/40 text-2xl text-center py-16">
              Nenhum expediente encontrado nessa data
            </p>
          ) : (
            <div className="space-y-6">
              {historicoFiltrado.map((exp) => (
                <HistoricoCard
                  key={exp.id}
                  expediente={exp}
                  onClick={() => handleVerExpediente(exp)}
                />
              ))}
            </div>
          )}

        </section>
      )}

    </div>
  );
}