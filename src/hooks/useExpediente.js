import { useEffect, useState } from "react";
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
 * Hook central para gerenciar expedientes (dias de venda)
 * 
 * Responsabilidades:
 * - Manter estado do expediente atual em memória (expediente)
 * - Sincronizar com storage (localStorage + IndexedDB)
 * - Delegar lógica de negócio para expedienteService
 * - Delegar persistência para storageManager
 * 
 * @returns {Object} Objeto com estado e funções do expediente
 * @returns {Object|null} returns.expediente - Expediente atual ou null se não há ativo
 * @returns {Function} returns.iniciarExpedienteComEstoque - Abre novo expediente
 * @returns {Function} returns.adicionarEncomenda - Adiciona encomenda
 * @returns {Function} returns.adicionarVenda - Adiciona venda balcão
 * @returns {Function} returns.marcarRetirado - Marca pedido como retirado
 * @returns {Function} returns.encerrarExpediente - Fecha o dia
 * @returns {Function} returns.verExpediente - Alterna expediente em memória
 * @returns {Function} returns.getHistorico - Busca histórico de expedientes
 * 
 * @example
 * const {
 *   expediente,
 *   iniciarExpedienteComEstoque,
 *   adicionarEncomenda,
 *   getHistorico
 * } = useExpediente();
 */
export function useExpediente() {
  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    // 1. Migra dados antigos (primeira execução apenas)
    migrarDadosLegados();

    // 2. Carrega expediente atual do localStorage (cache rápido)
    const salvo = getExpedienteAtual();
    if (salvo) setExpediente(salvo);
  }, []);

  /**
   * Inicia um novo expediente (abre o dia de vendas)
   * Valida se já não há expediente ativo
   * 
   * @async
   * @param {Object} form - Estoque inicial do dia
   * @param {number} form.comRecheio - Frangos com recheio
   * @param {number} form.semRecheio - Frangos sem recheio
   * @param {number} form.meio - Meios-frangos
   * @param {number} [form.maionese10] - Maionese 10g (opcional, só domingos)
   * @param {number} [form.maionese15] - Maionese 15g (opcional, só domingos)
   * @param {number} [form.costela] - Costela (opcional, só domingos)
   * @returns {Promise<Object|null>} Novo expediente ou null se já houver ativo
   * 
   * @example
   * await iniciarExpedienteComEstoque({
   *   comRecheio: 50,
   *   semRecheio: 40,
   *   meio: 30,
   *   maionese10: 100,
   *   maionese15: 80,
   *   costela: 20,
   * });
   */
  async function iniciarExpedienteComEstoque(form) {
    const ativo = await temExpedienteAtivo();
    if (ativo) return null;
    const novo = expedienteService.criar(form);
    await adicionarExpediente(novo);
    setExpediente(novo);
    return novo;
  }

  /**
   * Adiciona uma encomenda (pedido por telefone/redes sociais)
   * 
   * @async
   * @param {Object} dados - Dados da encomenda
   * @param {string} dados.nome - Nome do cliente
   * @param {string} dados.telefone - Telefone de contato
   * @param {Array} dados.itens - Itens [{ chave, quantidade }, ...]
   * @returns {Promise<void>}
   * 
   * @example
   * await adicionarEncomenda({
   *   nome: "João Silva",
   *   telefone: "11987654321",
   *   itens: [{ chave: "frangosComRecheio", quantidade: 2 }]
   * });
   */
  async function adicionarEncomenda(dados) {
    const atualizado = expedienteService.adicionarEncomenda(expediente, dados);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  /**
   * Adiciona uma venda de balcão (venda rápida/balcão)
   * 
   * @async
   * @param {Object} dados - Dados da venda
   * @param {Array} dados.itens - Itens vendidos [{ chave, quantidade }, ...]
   * @returns {Promise<void>}
   * 
   * @example
   * await adicionarVenda({
   *   itens: [{ chave: "frangosComRecheio", quantidade: 1 }]
   * });
   */
  async function adicionarVenda(dados) {
    const atualizado = expedienteService.adicionarVenda(expediente, dados);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  /**
   * Marca um pedido/encomenda como retirado pelo cliente
   * 
   * @async
   * @param {string|number} pedidoId - ID do pedido a marcar
   * @returns {Promise<void>}
   * 
   * @example
   * await marcarRetirado("1234567890");
   */
  async function marcarRetirado(pedidoId) {
    const atualizado = expedienteService.marcarRetirado(expediente, pedidoId);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  /**
   * Encerra o expediente (fecha o dia de vendas)
   * Após isso, não é possível adicionar mais encomendas/vendas
   * 
   * ⭐ CORRIGIDO: Agora reseta expediente para null após encerrar
   * Isso evita que o dashboard mostre o expediente encerrado ao criar um novo
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * await encerrarExpediente();
   */
  async function encerrarExpediente() {
    const atualizado = expedienteService.encerrar(expediente);
    await atualizarExpediente(atualizado);
    // ⭐ CORREÇÃO: Reseta o expediente para null
    // Assim o Dashboard redireciona para Home quando tenta carregar
    setExpediente(null);
  }

  /**
   * Troca o expediente em memória (útil para visualizar histórico)
   * Não persiste automaticamente — use após buscar do histórico
   * 
   * @param {Object} exp - Expediente a visualizar
   * @returns {void}
   * 
   * @example
   * const historico = await getHistorico();
   * verExpediente(historico[0]); // visualiza primeiro expediente
   */
  function verExpediente(exp) {
    setExpediente(exp);
  }

  /**
   * Busca todos os expedientes do histórico (fechados)
   * Consulta IndexedDB, com fallback para backup de emergência
   * 
   * @async
   * @returns {Promise<Array>} Array de expedientes encerrados
   * 
   * @example
   * const expedientes = await getHistorico();
   * console.log(expedientes.length); // quantos dias foram fechados
   */
  async function getHistorico() {
    return getHistoricoManager();
  }

  return {
    expediente,
    iniciarExpedienteComEstoque,
    adicionarEncomenda,
    adicionarVenda,
    marcarRetirado,
    encerrarExpediente,
    verExpediente,
    getHistorico,
  };
}