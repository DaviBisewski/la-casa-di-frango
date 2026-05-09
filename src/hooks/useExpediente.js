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

export function useExpediente() {
  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    // migra dados legados na primeira execução
    migrarDadosLegados();

    // carrega expediente atual do localStorage
    const salvo = getExpedienteAtual();
    if (salvo) setExpediente(salvo);
  }, []);

  async function iniciarExpedienteComEstoque(form) {
    const ativo = await temExpedienteAtivo();
    if (ativo) return null;
    const novo = expedienteService.criar(form);
    await adicionarExpediente(novo);
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

  async function encerrarExpediente() {
    const atualizado = expedienteService.encerrar(expediente);
    await atualizarExpediente(atualizado);
    setExpediente(atualizado);
  }

  function verExpediente(exp) {
    setExpediente(exp);
  }

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