import { useNavigate } from "react-router-dom";
import StartShift from '../components/ui/ButtonExpediente';
import { useExpediente } from '../hooks/useExpediente';
import { useToast } from '../contexts/ToastContext';
import { MENSAGENS } from '../services/toastService';
import HistoricoCard from '../components/Cards/HistoricoCard';
import calendarioIcon from '../assets/icons/calendario.svg';

export default function Home() {
  const { getHistorico, verExpediente } = useExpediente();
  const { mostrar } = useToast();
  const navigate = useNavigate();
  const historico = getHistorico();

  /**
   * Ao clicar em um card do histórico:
   * - Ativo → carrega no hook e vai pro dashboard
   * - Encerrado → vai para tela de histórico passando o expediente via state
   */
  function handleVerExpediente(exp) {
    const data = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short', day: 'numeric', month: 'short'
    }).format(new Date(exp.date + "T12:00:00")); // evita bug de fuso horário

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
                key={exp.id} // 🔥 agora é único: "2026-05-07-1746123456789"
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