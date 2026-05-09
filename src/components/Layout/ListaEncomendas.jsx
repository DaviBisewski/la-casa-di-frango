import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BuscaEncomenda } from "../Layout/BuscaEncomenda";
import { FiltroAba } from "../Layout/FiltroAba";
import { EncomendaCard } from "../Cards/EncomendaCard";

const LIMITE_INICIAL = 4;

/**
 * Lista de encomendas com animação de fade+slide ao trocar de aba ou filtrar
 * Inclui busca, paginação e transição suave entre conteúdos
 */
export function ListaEncomendas({ pedidos, onRetirar }) {
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState("pendentes");
  const [verTodos, setVerTodos] = useState(false);

  /** Controla a animação de saída/entrada ao trocar conteúdo */
  const [visivel, setVisivel] = useState(true);
  const timeoutRef = useRef(null);

  /**
   * Anima a troca — fade out, troca estado, fade in
   * @param {Function} trocar - Função que muda o estado
   */
  function animarTroca(trocar) {
    setVisivel(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      trocar();
      setVisivel(true);
    }, 220);
  }

  // useCallback para evitar recriação da função a cada render
  // Importante porque é passada como prop para FiltroAba
  const trocarAba = useCallback((nova) => {
    animarTroca(() => {
      setAba(nova);
      setVerTodos(false);
    });
  }, []);

  /** Anima ao digitar na busca também */
  useEffect(() => {
    setVisivel(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisivel(true), 180);
  }, [busca]);

  // useMemo para evitar recalcular filtrados a cada render
  // Depende de pedidos, aba, busca
  const filtrados = useMemo(() => (
    pedidos
      .filter((p) => aba === "pendentes" ? !p.retirado : p.retirado)
      .filter((p) => {
        const texto = busca.toLowerCase();
        return (
          p.nome?.toLowerCase().includes(texto) ||
          p.telefone?.toLowerCase().includes(texto)
        );
      })
  ), [pedidos, aba, busca]);

  // useMemo para evitar recalcular visiveis a cada render
  const visiveis = useMemo(
    () => verTodos ? filtrados : filtrados.slice(0, LIMITE_INICIAL),
    [filtrados, verTodos]
  );

  const restantes = filtrados.length - LIMITE_INICIAL;

  return (
    <div className="mt-20">

      {/* Título */}
      <h3 className="text-[#0F4C3A] text-5xl font-extrabold mb-15">
        Lista de Encomendas
      </h3>

      {/* Busca */}
      <BuscaEncomenda valor={busca} onChange={setBusca} />

      {/* Abas */}
      <FiltroAba abaAtiva={aba} onChange={trocarAba} />

      {/* Conteúdo com animação fade + slide */}
      <div
        className="transition-all duration-200"
        style={{
          opacity: visivel ? 1 : 0,
          transform: visivel ? "translateY(0px)" : "translateY(12px)",
        }}
      >
        {visiveis.length === 0 ? (
          <p className="text-[#0F4C3A]/40 text-3xl text-center py-20">
            {aba === "pendentes"
              ? "Nenhuma encomenda pendente"
              : "Nenhuma encomenda retirada"}
          </p>
        ) : (
          <div className="space-y-8">
            {visiveis.map((pedido) => (
              <EncomendaCard
                key={pedido.id}
                pedido={pedido}
                onRetirar={onRetirar}
                retirado={pedido.retirado}
              />
            ))}
          </div>
        )}

        {/* Ver mais */}
        {!verTodos && restantes > 0 && (
          <button
            onClick={() => setVerTodos(true)}
            className="w-full mt-10 py-9 rounded-full border-2 border-[#0F4C3A]
                       text-[#0F4C3A] text-3xl font-bold
                       hover:border-[#0F4C3A]/60 hover:bg-[#0F4C3A]/5
                       transition-all duration-200"
          >
            Ver + {restantes} encomendas
          </button>
        )}
      </div>

    </div>
  );
}