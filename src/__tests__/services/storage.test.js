import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "../../services/storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("salvarExpedienteAtual() e getExpedienteAtual()", () => {
    it("deve persistir e recuperar expediente corretamente", () => {
      const expediente = {
        id: "2026-05-08-123456",
        status: "active",
        pedidos: [],
        vendas: [],
      };

      storage.salvarExpedienteAtual(expediente);
      const recuperado = storage.getExpedienteAtual();

      expect(recuperado).toEqual(expediente);
    });

    it("deve retornar null quando não houver expediente salvo", () => {
      const resultado = storage.getExpedienteAtual();
      expect(resultado).toBeNull();
    });

    it("deve sobrescrever expediente anterior", () => {
      const expediente1 = { id: "1", status: "active" };
      const expediente2 = { id: "2", status: "closed" };

      storage.salvarExpedienteAtual(expediente1);
      storage.salvarExpedienteAtual(expediente2);

      const recuperado = storage.getExpedienteAtual();
      expect(recuperado.id).toBe("2");
    });

    it("deve persistir expedientes com estrutura complexa", () => {
      const expediente = {
        id: "2026-05-08-123456",
        status: "active",
        date: "2026-05-08",
        isSunday: false,
        iniciadoEm: 1715167800000,
        estoque: {
          frangosComRecheio: 20,
          frangosSemRecheio: 15,
          meioFrango: 10,
        },
        pedidos: [
          {
            id: 1,
            tipo: "encomenda",
            nome: "João",
            telefone: "123456789",
            itens: [{ chave: "frangosComRecheio", quantidade: 5 }],
            retirado: false,
          },
        ],
        vendas: [
          {
            id: 1,
            tipo: "venda",
            itens: [{ chave: "frangosSemRecheio", quantidade: 2 }],
          },
        ],
      };

      storage.salvarExpedienteAtual(expediente);
      const recuperado = storage.getExpedienteAtual();

      expect(recuperado).toEqual(expediente);
      expect(recuperado.pedidos[0].nome).toBe("João");
      expect(recuperado.vendas[0].tipo).toBe("venda");
    });
  });

  describe("adicionarExpedienteToDB()", () => {
    it("deve adicionar expediente ao array days", () => {
      const expediente = {
        id: "2026-05-08-123456",
        status: "active",
      };

      storage.adicionarExpedienteToDB(expediente);
      const db = storage.getDB();

      expect(db.days).toHaveLength(1);
      expect(db.days[0]).toEqual(expediente);
    });

    it("deve adicionar múltiplos expedientes", () => {
      const expediente1 = { id: "1", status: "active" };
      const expediente2 = { id: "2", status: "closed" };

      storage.adicionarExpedienteToDB(expediente1);
      storage.adicionarExpedienteToDB(expediente2);
      const db = storage.getDB();

      expect(db.days).toHaveLength(2);
      expect(db.days[0].id).toBe("1");
      expect(db.days[1].id).toBe("2");
    });
  });

  describe("atualizarExpedienteNoDB()", () => {
    it("deve atualizar o expediente correto pelo id", () => {
      const expediente1 = { id: "1", status: "active", pedidos: [] };
      const expediente2 = { id: "2", status: "closed", vendas: [] };

      storage.adicionarExpedienteToDB(expediente1);
      storage.adicionarExpedienteToDB(expediente2);

      const expediente1Atualizado = {
        id: "1",
        status: "closed",
        pedidos: [{ id: 1, nome: "João" }],
      };

      storage.atualizarExpedienteNoDB(expediente1Atualizado);
      const db = storage.getDB();

      expect(db.days).toHaveLength(2);
      expect(db.days[0]).toEqual(expediente1Atualizado);
      expect(db.days[1]).toEqual(expediente2);
    });

    it("não deve duplicar ao atualizar", () => {
      const expediente = { id: "1", status: "active", contador: 1 };

      storage.adicionarExpedienteToDB(expediente);
      const expedienteAtualizado = { ...expediente, contador: 2 };
      storage.atualizarExpedienteNoDB(expedienteAtualizado);
      const expedienteAtualizado2 = { ...expediente, contador: 3 };
      storage.atualizarExpedienteNoDB(expedienteAtualizado2);

      const db = storage.getDB();
      expect(db.days).toHaveLength(1);
      expect(db.days[0].contador).toBe(3);
    });

    it("deve atualizar múltiplos campos", () => {
      const expediente = {
        id: "1",
        status: "active",
        pedidos: [],
        vendas: [],
      };

      storage.adicionarExpedienteToDB(expediente);

      const atualizado = {
        id: "1",
        status: "closed",
        pedidos: [{ id: 1, nome: "João" }],
        vendas: [{ id: 1, itens: [] }],
        encerradoEm: 1715180000000,
      };

      storage.atualizarExpedienteNoDB(atualizado);
      const db = storage.getDB();

      expect(db.days[0]).toEqual(atualizado);
    });
  });

  describe("getHistorico()", () => {
    it("deve retornar expedientes em ordem decrescente (mais recente primeiro)", () => {
      const expediente1 = { id: "1", data: "2026-05-06" };
      const expediente2 = { id: "2", data: "2026-05-07" };
      const expediente3 = { id: "3", data: "2026-05-08" };

      storage.adicionarExpedienteToDB(expediente1);
      storage.adicionarExpedienteToDB(expediente2);
      storage.adicionarExpedienteToDB(expediente3);

      const historico = storage.getHistorico();

      expect(historico).toHaveLength(3);
      expect(historico[0].id).toBe("3");
      expect(historico[1].id).toBe("2");
      expect(historico[2].id).toBe("1");
    });

    it("deve retornar array vazio quando não houver histórico", () => {
      const historico = storage.getHistorico();
      expect(historico).toEqual([]);
    });

    it("não deve modificar dados ao retornar histórico", () => {
      const expediente = { id: "1", status: "closed", pedidos: [] };
      storage.adicionarExpedienteToDB(expediente);

      const historico = storage.getHistorico();
      historico[0].pedidos.push({ id: 1 });

      const db = storage.getDB();
      expect(db.days[0].pedidos).toHaveLength(0);
    });
  });

  describe("getDB() e salvarDB()", () => {
    it("deve retornar objeto com array 'days' vazio por padrão", () => {
      const db = storage.getDB();
      expect(db).toHaveProperty("days");
      expect(Array.isArray(db.days)).toBe(true);
      expect(db.days).toHaveLength(0);
    });

    it("deve salvar e recuperar dados complexos", () => {
      const db = {
        days: [
          { id: "1", status: "closed" },
          { id: "2", status: "closed" },
        ],
        metadata: { version: "1.0" },
      };

      storage.salvarDB(db);
      const recuperado = storage.getDB();

      expect(recuperado).toEqual(db);
      expect(recuperado.metadata.version).toBe("1.0");
    });

    it("deve limpar dados corretamente", () => {
      storage.adicionarExpedienteToDB({ id: "1", status: "closed" });
      
      localStorage.clear();
      const db = storage.getDB();

      expect(db.days).toHaveLength(0);
    });
  });
});
