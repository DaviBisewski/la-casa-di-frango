import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useExpediente } from "../../hooks/useExpediente";
import * as expedienteServiceModule from "../../services/expedienteService";
import * as storageModule from "../../services/storage";

// Mock dos serviços
vi.mock("../../services/expedienteService");
vi.mock("../../services/storage");

describe("useExpediente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Carregamento inicial", () => {
    it("deve carregar expediente do localStorage ao montar", async () => {
      const expedienteNoDB = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteNoDB
      );

      const { result } = renderHook(() => useExpediente());

      await waitFor(() => {
        expect(result.current.expediente).toEqual(expedienteNoDB);
      });
    });

    it("deve ter expediente como null se não houver no localStorage", async () => {
      storageModule.storage.getExpedienteAtual.mockReturnValue(null);

      const { result } = renderHook(() => useExpediente());

      await waitFor(() => {
        expect(result.current.expediente).toBeNull();
      });
    });
  });

  describe("iniciarExpedienteComEstoque()", () => {
    it("deve atualizar o estado com o novo expediente", () => {
      const novoExpediente = {
        id: "2026-05-08-123456",
        status: "active",
        estoque: { frangosComRecheio: 20 },
        pedidos: [],
        vendas: [],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(null);
      expedienteServiceModule.expedienteService.criar.mockReturnValue(
        novoExpediente
      );

      const { result } = renderHook(() => useExpediente());

      const form = {
        comRecheio: 20,
        semRecheio: 10,
        meio: 5,
      };

      act(() => {
        result.current.iniciarExpedienteComEstoque(form);
      });

      expect(result.current.expediente).toEqual(novoExpediente);
      expect(expedienteServiceModule.expedienteService.criar).toHaveBeenCalledWith(
        form
      );
    });

    it("não deve atualizar estado se criar retornar null", () => {
      storageModule.storage.getExpedienteAtual.mockReturnValue(null);
      expedienteServiceModule.expedienteService.criar.mockReturnValue(null);

      const { result } = renderHook(() => useExpediente());

      const form = { comRecheio: 20, semRecheio: 10, meio: 5 };

      act(() => {
        result.current.iniciarExpedienteComEstoque(form);
      });

      expect(result.current.expediente).toBeNull();
    });
  });

  describe("adicionarEncomenda()", () => {
    it("deve refletir no estado imediatamente", () => {
      const expedienteInicial = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [],
        vendas: [],
      };

      const expedienteAtualizado = {
        ...expedienteInicial,
        pedidos: [
          {
            id: 1,
            nome: "João",
            telefone: "123456789",
            tipo: "encomenda",
            retirado: false,
            itens: [{ chave: "frangosComRecheio", quantidade: 5 }],
          },
        ],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteInicial
      );
      expedienteServiceModule.expedienteService.adicionarEncomenda.mockReturnValue(
        expedienteAtualizado
      );

      const { result } = renderHook(() => useExpediente());

      const dados = {
        nome: "João",
        telefone: "123456789",
        itens: [{ chave: "frangosComRecheio", quantidade: 5 }],
      };

      act(() => {
        result.current.adicionarEncomenda(dados);
      });

      expect(result.current.expediente.pedidos).toHaveLength(1);
      expect(result.current.expediente.pedidos[0].nome).toBe("João");
    });

    it("deve manter encomendas anteriores", () => {
      const expedienteInicial = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [
          { id: 1, nome: "Maria", tipo: "encomenda", retirado: false, itens: [] },
        ],
        vendas: [],
      };

      const expedienteAtualizado = {
        ...expedienteInicial,
        pedidos: [
          { id: 1, nome: "Maria", tipo: "encomenda", retirado: false, itens: [] },
          {
            id: 2,
            nome: "João",
            tipo: "encomenda",
            retirado: false,
            itens: [],
          },
        ],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteInicial
      );
      expedienteServiceModule.expedienteService.adicionarEncomenda.mockReturnValue(
        expedienteAtualizado
      );

      const { result } = renderHook(() => useExpediente());

      act(() => {
        result.current.adicionarEncomenda({
          nome: "João",
          telefone: "987654321",
          itens: [],
        });
      });

      expect(result.current.expediente.pedidos).toHaveLength(2);
      expect(result.current.expediente.pedidos[0].nome).toBe("Maria");
      expect(result.current.expediente.pedidos[1].nome).toBe("João");
    });
  });

  describe("adicionarVenda()", () => {
    it("deve refletir no estado imediatamente", () => {
      const expedienteInicial = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [],
        vendas: [],
        estoque: { frangosComRecheio: 20 },
      };

      const expedienteAtualizado = {
        ...expedienteInicial,
        vendas: [
          {
            id: 1,
            tipo: "venda",
            itens: [{ chave: "frangosComRecheio", quantidade: 3 }],
          },
        ],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteInicial
      );
      expedienteServiceModule.expedienteService.adicionarVenda.mockReturnValue(
        expedienteAtualizado
      );

      const { result } = renderHook(() => useExpediente());

      act(() => {
        result.current.adicionarVenda({
          itens: [{ chave: "frangosComRecheio", quantidade: 3 }],
        });
      });

      expect(result.current.expediente.vendas).toHaveLength(1);
      expect(result.current.expediente.vendas[0].itens[0].quantidade).toBe(3);
    });
  });

  describe("marcarRetirado()", () => {
    it("deve atualizar o pedido correto no estado", () => {
      const expedienteInicial = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [
          { id: 1, nome: "João", retirado: false },
          { id: 2, nome: "Maria", retirado: false },
        ],
        vendas: [],
      };

      const expedienteAtualizado = {
        ...expedienteInicial,
        pedidos: [
          { id: 1, nome: "João", retirado: false },
          { id: 2, nome: "Maria", retirado: true },
        ],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteInicial
      );
      expedienteServiceModule.expedienteService.marcarRetirado.mockReturnValue(
        expedienteAtualizado
      );

      const { result } = renderHook(() => useExpediente());

      act(() => {
        result.current.marcarRetirado(2);
      });

      expect(result.current.expediente.pedidos[0].retirado).toBe(false);
      expect(result.current.expediente.pedidos[1].retirado).toBe(true);
    });

    it("não deve afetar pedidos que já estavam retirados", () => {
      const expedienteInicial = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [
          { id: 1, nome: "João", retirado: true },
          { id: 2, nome: "Maria", retirado: false },
        ],
        vendas: [],
      };

      const expedienteAtualizado = {
        ...expedienteInicial,
        pedidos: [
          { id: 1, nome: "João", retirado: true },
          { id: 2, nome: "Maria", retirado: true },
        ],
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteInicial
      );
      expedienteServiceModule.expedienteService.marcarRetirado.mockReturnValue(
        expedienteAtualizado
      );

      const { result } = renderHook(() => useExpediente());

      act(() => {
        result.current.marcarRetirado(2);
      });

      expect(result.current.expediente.pedidos[0].retirado).toBe(true);
      expect(result.current.expediente.pedidos[1].retirado).toBe(true);
    });
  });

  describe("encerrarExpediente()", () => {
    it("deve mudar status no estado para 'closed'", () => {
      const expedienteInicial = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [],
        vendas: [],
      };

      const expedienteAtualizado = {
        ...expedienteInicial,
        status: "closed",
        encerradoEm: 1715180000000,
      };

      storageModule.storage.getExpedienteAtual.mockReturnValue(
        expedienteInicial
      );
      expedienteServiceModule.expedienteService.encerrar.mockReturnValue(
        expedienteAtualizado
      );

      const { result } = renderHook(() => useExpediente());

      act(() => {
        result.current.encerrarExpediente();
      });

      expect(result.current.expediente.status).toBe("closed");
      expect(result.current.expediente.encerradoEm).toBeDefined();
    });
  });

  describe("getHistorico()", () => {
    it("deve retornar os dados do storage", () => {
      const historico = [
        { id: "3", status: "closed" },
        { id: "2", status: "closed" },
        { id: "1", status: "closed" },
      ];

      storageModule.storage.getExpedienteAtual.mockReturnValue(null);
      storageModule.storage.getHistorico.mockReturnValue(historico);

      const { result } = renderHook(() => useExpediente());

      const resultado = result.current.getHistorico();

      expect(resultado).toEqual(historico);
      expect(storageModule.storage.getHistorico).toHaveBeenCalled();
    });

    it("deve retornar array vazio quando não houver histórico", () => {
      storageModule.storage.getExpedienteAtual.mockReturnValue(null);
      storageModule.storage.getHistorico.mockReturnValue([]);

      const { result } = renderHook(() => useExpediente());

      const resultado = result.current.getHistorico();

      expect(resultado).toEqual([]);
    });
  });

  describe("verExpediente()", () => {
    it("deve atualizar o expediente no estado", () => {
      const expediente1 = { id: "1", status: "closed" };
      const expediente2 = { id: "2", status: "active" };

      storageModule.storage.getExpedienteAtual.mockReturnValue(expediente1);

      const { result } = renderHook(() => useExpediente());

      expect(result.current.expediente).toEqual(expediente1);

      act(() => {
        result.current.verExpediente(expediente2);
      });

      expect(result.current.expediente).toEqual(expediente2);
    });
  });
});
