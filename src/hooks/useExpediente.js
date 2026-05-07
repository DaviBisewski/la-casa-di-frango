import { useEffect, useState } from "react";
import { storage } from "../services/storage";
import { expedienteService } from "../services/expedienteService";

/**
 * Hook principal para gerenciar o estado do expediente
 * Responsável apenas pelo estado React — a lógica de negócio
 * fica no expedienteService e a persistência no storage
 */
export function useExpediente() {
  /** Estado do expediente atual carregado do localStorage */
  const [expediente, setExpediente] = useState(null);

  /**
   * Carrega o expediente salvo ao montar o componente
   * Garante que o estado seja restaurado após recarregar a página
   */
  useEffect(() => {
    const salvo = storage.getExpedienteAtual();
    if (salvo) setExpediente(salvo);
  }, []);

  /**
   * Inicia um novo expediente com as quantidades de estoque informadas
   * @param {Object} form - Dados do formulário de estoque inicial
   */
  function iniciarExpedienteComEstoque(form) {
    const novo = expedienteService.criar(form);
    setExpediente(novo);
  }

  /**
   * Adiciona uma encomenda ao expediente atual
   * @param {Object} dados - { nome, telefone, itens }
   */
  function adicionarEncomenda(dados) {
    const atualizado = expedienteService.adicionarEncomenda(expediente, dados);
    setExpediente(atualizado);
  }

  /**
   * Registra uma venda rápida no expediente atual
   * @param {Object} dados - { itens }
   */
  function adicionarVenda(dados) {
    const atualizado = expedienteService.adicionarVenda(expediente, dados);
    setExpediente(atualizado);
  }

  /**
   * Marca um pedido como retirado pelo cliente
   * @param {number} pedidoId - ID do pedido a ser marcado
   */
  function marcarRetirado(pedidoId) {
    const atualizado = expedienteService.marcarRetirado(expediente, pedidoId);
    setExpediente(atualizado);
  }

  /**
   * Carrega um expediente do histórico para visualização
   * Substitui o expediente atual no estado
   * @param {Object} exp - Expediente do histórico
   */
  function verExpediente(exp) {
    setExpediente(exp);
  }

  /**
   * Retorna todos os expedientes salvos em ordem decrescente
   * O mais recente aparece primeiro
   * @returns {Array} Lista de expedientes
   */
  function getHistorico() {
    return storage.getHistorico();
  }

  return {
    expediente,
    iniciarExpedienteComEstoque,
    adicionarEncomenda,
    adicionarVenda,
    marcarRetirado,
    verExpediente,
    getHistorico,
  };
} 