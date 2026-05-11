import { createContext, useContext, useState, useEffect } from "react";
import {
  getExpedienteAtual,
  adicionarExpediente,
  atualizarExpediente,
  temExpedienteAtivo,
  migrarDadosLegados,
  getHistorico as getHistoricoManager,
} from "../services/storageManager";
import { expedienteService } from "../services/expedienteService";

/**
 * Context global do expediente
 * Garante que TODOS os componentes compartilham o mesmo estado
 * Resolve o bug de Dashboard abrir com expediente antigo após criar novo
 */
const ExpedienteContext = createContext(null);

/**
 * Provider que envolve o app inteiro
 * Estado do expediente vive aqui — único, compartilhado, sempre atualizado
 */
export function ExpedienteProvider({ children }) {
  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    // Migra dados legados na primeira execução
    migrarDadosLegados();

    // Carrega expediente atual do localStorage (cache rápido)
    const salvo = getExpedienteAtual();
    if (salvo) setExpediente(salvo);
  }, []);

  /**
   * Inicia novo expediente — aguarda persistência antes de retornar
   * Retorna o novo expediente para quem chamou poder navegar com segurança
   * @param {Object} form - Dados do formulário de estoque inicial
   * @returns {Promise<Object|null>} Novo expediente ou null se já houver ativo
   */
  async function iniciarExpedienteComEstoque(form) {
    const ativo = await temExpedienteAtivo();
    if (ativo) return null;

    const novo = expedienteService.criar(form);
    await adicionarExpediente(novo);

    // Atualiza estado ANTES de retornar — Dashboard já vai encontrar o novo
    setExpediente(novo);
    return novo;
  }

  async function adicionarEncomenda(dados) {
    const atualizado = expedienteService.adicionarEncomenda(expediente, dados);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  async function adicionarVenda(dados) {
    const atualizado = expedienteService.adicionarVenda(expediente, dados);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  async function marcarRetirado(pedidoId) {
    const atualizado = expedienteService.marcarRetirado(expediente, pedidoId);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  /**
   * Encerra expediente — limpa estado após encerrar
   * Ao voltar para home e criar novo, o estado começa limpo
   */
  async function encerrarExpediente() {
    const atualizado = expedienteService.encerrar(expediente);
    await atualizarExpediente(atualizado);

    // Limpa o estado — próxima tela não vai encontrar expediente antigo
    setExpediente(null);
  }

  /**
   * Carrega um expediente do histórico para visualização
   * Não persiste — só muda o estado local para visualização
   */
  function verExpediente(exp) {
    setExpediente(exp);
  }

  async function getHistorico() {
    return getHistoricoManager();
  }

  return (
    <ExpedienteContext.Provider value={{
      expediente,
      iniciarExpedienteComEstoque,
      adicionarEncomenda,
      adicionarVenda,
      marcarRetirado,
      encerrarExpediente,
      verExpediente,
      getHistorico,
    }}>
      {children}
    </ExpedienteContext.Provider>
  );
}

/**
 * Hook para acessar o context do expediente
 * Substitui o useExpediente em todos os componentes
 */
export function useExpediente() {
  const context = useContext(ExpedienteContext);
  if (!context) {
    throw new Error("useExpediente deve ser usado dentro de ExpedienteProvider");
  }
  return context;
}