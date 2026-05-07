import { useNavigate } from "react-router-dom";
import StartShift from '../components/ui/ButtonExpediente';
import { useExpediente } from '../hooks/useExpediente';
import HistoricoCard from '../components/Cards/HistoricoCard';
import { notificarInfo, MENSAGENS } from '../utils/toastConfig';
import calendarioIcon from '../assets/icons/calendario.svg';

export default function Home() {
  const { expediente, getHistorico, verExpediente } = useExpediente();
  const navigate = useNavigate();
  const historico = getHistorico();

  /**
   * Muda o expediente visualizado para o selecionado no histórico
   * Notifica ao usuário qual expediente está sendo visualizado
   * @param {Object} exp - Objeto do expediente a visualizar
   */
  function handleVerExpediente(exp) {
    verExpediente(exp);
    const data = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short', day: 'numeric', month: 'short'
    }).format(new Date(exp.data));
    notificarInfo(`Visualizando expediente de ${data}`);
    navigate("/dashboard");
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <StartShift onStart={() => navigate("/estoque")} />

      {historico.length > 0 && (
        <section className="px-12 mt-20 pb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#0F4C3A] text-4xl font-extrabold uppercase tracking-tight">
              Histórico de Vendas
            </h2>
            <button className="flex items-center gap-3 border-2 border-[#0F4C3A]/20
                               rounded-2xl px-8 py-4 text-[#0F4C3A] text-2xl font-semibold
                               hover:bg-[#0F4C3A]/5 transition-all">
              <img src={calendarioIcon} alt="Filtrar" className="w-8 h-8" />
              Todos
            </button>
          </div>

          <div className="space-y-6">
            {historico.map((exp) => (
              <HistoricoCard
                key={exp.id}
                expediente={exp}
                onClick={() => handleVerExpediente(exp)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}