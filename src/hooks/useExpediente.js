import { useEffect, useState } from "react";
import { storage } from "../services/storage";
import { expedienteService } from "../services/expedienteService";

/**
 * Hook para gerenciar o expediente (operação do dia)
 * Mantém estado do expediente ativo e fornece funções para manipulá-lo
 * 
 * @returns {
 *   expediente: Object|null - Expediente atual ou null se não existe
 *   iniciarExpedienteComEstoque: Function - Cria novo expediente
 *   adicionarEncomenda: Function - Adiciona encomenda ao expediente
 *   adicionarVenda: Function - Adiciona venda ao expediente
 *   verExpediente: Function - Muda expediente visualizado
 *   getHistorico: Function - Retorna histórico de expedientes
 * }
 */
export function useExpediente() {
  const [expediente, setExpediente] = useState(null);

  // Carrega expediente do localStorage ao montar o componente
  useEffect(() => {
    const salvo = storage.getExpedienteAtual();
    if (salvo) setExpediente(salvo);
  }, []);

  /**
   * Inicia um novo expediente com o estãgio de produtos do dia
   * Cria registro único e salva em histórico
   * @param {Object} form - Quantidades iniciais de cada produto
   */
  function iniciarExpedienteComEstoque(form) {
    const novo = expedienteService.criar(form);
    setExpediente(novo);
  }

  /**
   * Adiciona uma encomenda (pedido do cliente) ao expediente
   * Não desconta do estãgio, apenas registra o pedido
   * @param {Object} dados - Nome, telefone e itens da encomenda
   */
  function adicionarEncomenda(dados) {
    const atualizado = expedienteService.adicionarEncomenda(expediente, dados);
    setExpediente(atualizado);
  }

  /**
   * Registra uma venda (venda rápida/balcão) no expediente
   * Não desconta do estãgio, apenas registra a venda
   * @param {Object} dados - Itens vendidos e quantidade de cada
   */
  function adicionarVenda(dados) {
    const atualizado = expedienteService.adicionarVenda(expediente, dados);
    setExpediente(atualizado);
  }

  /**
   * Muda o expediente visualizado (para ver histórico)
   * @param {Object} exp - Expediente a visualizar
   */
  function verExpediente(exp) {
    setExpediente(exp);
  }

  /**
   * Retorna o histórico de todos os expedientes
   * @returns {Array} Lista de expedientes em ordem decrescente (mais recente primeiro)
   */
  function getHistorico() {
    return storage.getHistorico();
  }

  return {
    expediente,
    iniciarExpedienteComEstoque,
    adicionarEncomenda,
    adicionarVenda,
    verExpediente,
    getHistorico,
  };
}