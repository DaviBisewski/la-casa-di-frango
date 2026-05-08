import { useEffect, useState } from "react";
import { storage } from "../services/storage";
import { expedienteService } from "../services/expedienteService";

export function useExpediente() {
  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    const salvo = storage.getExpedienteAtual();
    if (salvo) setExpediente(salvo);
  }, []);

  function iniciarExpedienteComEstoque(form) {
    const novo = expedienteService.criar(form);
    setExpediente(novo);
  }

  function adicionarEncomenda(dados) {
    const atualizado = expedienteService.adicionarEncomenda(expediente, dados);
    setExpediente(atualizado);
  }

  function adicionarVenda(dados) {
    const atualizado = expedienteService.adicionarVenda(expediente, dados);
    setExpediente(atualizado);
  }

  function marcarRetirado(pedidoId) {
    const atualizado = expedienteService.marcarRetirado(expediente, pedidoId);
    setExpediente(atualizado);
  }

  /**
   * Encerra o expediente ativo
   * Atualiza status para 'closed' no estado e no storage
   */
  function encerrarExpediente() {
    const atualizado = expedienteService.encerrar(expediente);
    setExpediente(atualizado);
  }

  function verExpediente(exp) {
    setExpediente(exp);
  }

  function getHistorico() {
    return storage.getHistorico();
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