import { useState } from "react";
import calendarioIcon from "../../assets/icons/calendario.svg";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * Retorna array de dias do mês com nulls para alinhar a grade
 */
function getDiasDoMes(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const dias = [];
  for (let i = 0; i < primeiroDia; i++) dias.push(null);
  for (let d = 1; d <= totalDias; d++) dias.push(d);
  return dias;
}

/**
 * Converte ano, mes (0-based) e dia para string YYYY-MM-DD
 */
function toISO(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/**
 * Tenta parsear input manual no formato DD/MM/AAAA
 * Retorna string ISO ou null se inválido
 */
function parsearInputManual(texto) {
  const limpo = texto.replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  const dia = parseInt(limpo.slice(0, 2));
  const mes = parseInt(limpo.slice(2, 4)) - 1;
  const ano = parseInt(limpo.slice(4, 8));
  if (mes < 0 || mes > 11 || dia < 1 || dia > 31) return null;
  return toISO(ano, mes, dia);
}

/**
 * Formata string ISO para exibição DD/MM/AAAA
 */
function formatarData(iso) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/**
 * Calendário fullscreen com animação, input manual e navegação com ícones SVG
 *
 * @param {string|null} dataSelecionada - YYYY-MM-DD ou null
 * @param {Function} onSelecionar - Callback ao selecionar dia
 * @param {Function} onLimpar - Callback ao limpar filtro
 * @param {Array} datasComExpediente - Datas YYYY-MM-DD com expedientes
 */
export function CalendarioFiltro({
  dataSelecionada,
  onSelecionar,
  onLimpar,
  datasComExpediente = [],
}) {
  const hoje = new Date();
  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [inputTexto, setInputTexto] = useState("");
  const [inputErro, setInputErro] = useState(false);
  const [direcao, setDirecao] = useState("right"); // para animação do mês

  const dias = getDiasDoMes(ano, mes);

  function mesAnterior() {
    setDirecao("left");
    setTimeout(() => {
      if (mes === 0) { setMes(11); setAno(ano - 1); }
      else setMes(mes - 1);
    }, 10);
  }

  function mesSeguinte() {
    setDirecao("right");
    setTimeout(() => {
      if (mes === 11) { setMes(0); setAno(ano + 1); }
      else setMes(mes + 1);
    }, 10);
  }

  function handleSelecionar(dia) {
    if (!dia) return;
    const iso = toISO(ano, mes, dia);
    onSelecionar(iso);
    setInputTexto(formatarData(iso));
    setAberto(false);
  }

  function handleLimpar() {
    onLimpar();
    setInputTexto("");
    setInputErro(false);
    setAberto(false);
  }

  /** Formata input automaticamente: 01/05/2026 */
  function handleInputChange(e) {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + "/" + val.slice(5);
    if (val.length > 10) val = val.slice(0, 10);
    setInputTexto(val);
    setInputErro(false);
  }

  /** Ao pressionar Enter no input, tenta aplicar a data */
  function handleInputConfirmar(e) {
    if (e.key !== "Enter") return;
    const iso = parsearInputManual(inputTexto);
    if (!iso) {
      setInputErro(true);
      return;
    }
    const temExpediente = datasComExpediente.includes(iso);
    if (!temExpediente) {
      setInputErro(true);
      return;
    }
    const [a, m] = iso.split("-");
    setAno(parseInt(a));
    setMes(parseInt(m) - 1);
    onSelecionar(iso);
    setAberto(false);
    setInputErro(false);
  }

  function labelBotao() {
    if (!dataSelecionada) return "Todos";
    return formatarData(dataSelecionada);
  }

  return (
    <div className="relative">

      {/* Botão de abrir */}
      <button
        onClick={() => setAberto(true)}
        className={`
          flex items-center gap-6 border-2 rounded-2xl px-15 py-6
          text-3xl font-semibold transition-all duration-200
          ${dataSelecionada
            ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-lg"
            : "border-[#0F4C3A]/20 text-[#0F4C3A] hover:bg-[#0F4C3A]/5"
          }
        `}
      >
        <img
          src={calendarioIcon}
          alt="Calendário"
          className={`w-10 h-10 transition-all ${dataSelecionada ? "brightness-0 invert" : ""}`}
        />
        {labelBotao()}
      </button>

      {/* Modal fullscreen */}
      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ animation: "fadeOverlay 0.25s ease-out" }}
        >
          {/* Overlay escuro */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAberto(false)}
          />

          {/* Painel do calendário */}
          <div
            className="relative bg-white z-10 w-full h-full flex flex-col
                       overflow-y-auto"
            style={{ animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
          >

            {/* Header */}
            <div className="flex items-center justify-between px-12 py-10
                            border-b border-[#0F4C3A]/10">
              <h2 className="text-[#0F4C3A] text-5xl font-extrabold">
                Filtrar por data
              </h2>
              <button
                onClick={() => setAberto(false)}
                className="w-16 h-16 rounded-full bg-[#0F4C3A]/10 flex items-center
                           justify-center hover:bg-[#0F4C3A]/20 transition-all"
              >
                {/* X icon */}
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M6 6l12 12M18 6L6 18"
                    stroke="#0F4C3A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Input de data manual */}
            <div className="px-12 pt-10 pb-6">
              <label className="text-[#0F4C3A] text-2xl font-semibold mb-3 block">
                Digite a data:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputTexto}
                  onChange={handleInputChange}
                  onKeyDown={handleInputConfirmar}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={`
                    w-full bg-[#D4F1E6] text-[#0F4C3A] text-3xl p-8 rounded-2xl
                    placeholder:text-[#0F4C3A]/30 outline-none transition-all
                    border-2 ${inputErro
                      ? "border-red-400 bg-red-50"
                      : "border-transparent focus:border-[#0F4C3A]/20"
                    }
                  `}
                />
                {inputErro && (
                  <p className="text-red-500 text-xl mt-2 ml-2">
                    Data inválida ou sem expediente registrado
                  </p>
                )}
                <p className="text-[#0F4C3A]/40 text-xl mt-2 ml-2">
                  Pressione Enter para confirmar
                </p>
              </div>
            </div>

            {/* Navegação mês/ano */}
            <div className="flex items-center justify-between px-12 py-8">
              <button
                onClick={mesAnterior}
                className="w-16 h-16 rounded-full bg-[#D4F1E6] flex items-center
                           justify-center hover:bg-[#0F4C3A]/20 active:scale-95
                           transition-all"
              >
                {/* Seta esquerda */}
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M15 18l-6-6 6-6"
                    stroke="#0F4C3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <span
                className="text-[#0F4C3A] text-4xl font-extrabold"
                key={`${mes}-${ano}`}
                style={{ animation: `mesEntrar 0.25s ease-out` }}
              >
                {MESES[mes]} {ano}
              </span>

              <button
                onClick={mesSeguinte}
                className="w-16 h-16 rounded-full bg-[#D4F1E6] flex items-center
                           justify-center hover:bg-[#0F4C3A]/20 active:scale-95
                           transition-all"
              >
                {/* Seta direita */}
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M9 18l6-6-6-6"
                    stroke="#0F4C3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 px-12 mb-2">
              {DIAS_SEMANA.map((d) => (
                <span key={d} className="text-center text-[#0F4C3A]/40 text-xl font-bold py-3">
                  {d}
                </span>
              ))}
            </div>

            {/* Grade de dias */}
            <div
              className="grid grid-cols-7 gap-3 px-12"
              key={`grade-${mes}-${ano}`}
              style={{ animation: "gradeEntrar 0.3s ease-out" }}
            >
              {dias.map((dia, i) => {
                if (!dia) return <div key={`v-${i}`} />;

                const iso = toISO(ano, mes, dia);
                const temExp = datasComExpediente.includes(iso);
                const selecionado = dataSelecionada === iso;
                const ehHoje = iso === toISO(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

                return (
                  <button
                    key={iso}
                    onClick={() => handleSelecionar(dia)}
                    disabled={!temExp}
                    className={`
                      relative aspect-square rounded-2xl flex flex-col items-center
                      justify-center transition-all duration-200 text-2xl font-bold
                      ${selecionado
                        ? "bg-[#0F4C3A] text-white scale-110 shadow-xl"
                        : temExp
                          ? "bg-[#D4F1E6] text-[#0F4C3A] hover:bg-[#0F4C3A] hover:text-white hover:scale-105 active:scale-95"
                          : "text-[#0F4C3A]/20 cursor-default"
                      }
                      ${ehHoje && !selecionado ? "ring-3 ring-[#0F4C3A]/40" : ""}
                    `}
                  >
                    {dia}
                    {/* Ponto indicador */}
                    {temExp && !selecionado && (
                      <span className="absolute bottom-2 w-2 h-2 rounded-full bg-[#0F4C3A]/50" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rodapé com botão limpar */}
            <div className="px-12 py-12 mt-auto">
              {dataSelecionada && (
                <button
                  onClick={handleLimpar}
                  className="w-full py-8 rounded-2xl border-2 border-[#0F4C3A]/20
                             text-[#0F4C3A] text-3xl font-semibold mb-6
                             hover:border-[#0F4C3A] hover:bg-[#0F4C3A]/5
                             active:scale-[0.99] transition-all"
                >
                  Limpar filtro — Ver todos
                </button>
              )}
              <button
                onClick={() => setAberto(false)}
                className="w-full py-8 rounded-2xl bg-[#0F4C3A] text-white
                           text-3xl font-bold hover:bg-[#0a3528]
                           active:scale-[0.99] transition-all shadow-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes mesEntrar {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes gradeEntrar {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}