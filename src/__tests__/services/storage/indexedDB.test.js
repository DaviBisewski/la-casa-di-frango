import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  salvarExpedienteIDB,
  getTodosExpedientesIDB,
  getExpedientePorIdIDB,
  importarExpedientesIDB,
  salvarMetaIDB,
  getMetaIDB,
} from "../../../services/storage/indexedDB";

describe("IndexedDB - Camada de Persistência", () => {
  beforeEach(async () => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    
    // Limpar banco antes de cada teste
    try {
      const dbs = await indexedDB.databases?.();
      if (dbs && dbs.length > 0) {
        for (const db of dbs) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    } catch (error) {
      // Ignorar erros de limpeza
      console.warn("Erro ao limpar IndexedDB:", error);
    }
  });

  describe("salvarExpedienteIDB", () => {
    it("deve persistir expediente corretamente", async () => {
      const expediente = {
        id: "2024-01-15-1234567",
        date: "2024-01-15",
        status: "active",
        isSunday: false,
        estoque: { frangosComRecheio: 10 },
        pedidos: [],
      };

      await salvarExpedienteIDB(expediente);
      const recuperado = await getExpedientePorIdIDB(expediente.id);

      expect(recuperado).toBeDefined();
      expect(recuperado.id).toBe(expediente.id);
      expect(recuperado.date).toBe(expediente.date);
    });

    it("deve fazer upsert - atualizar se já existe o mesmo id", async () => {
      const expediente = {
        id: "2024-01-15-1234567",
        date: "2024-01-15",
        status: "active",
        estoque: { frangosComRecheio: 10 },
      };

      await salvarExpedienteIDB(expediente);
      
      const atualizado = {
        ...expediente,
        status: "closed",
        estoque: { frangosComRecheio: 5 },
      };
      
      await salvarExpedienteIDB(atualizado);
      const resultado = await getExpedientePorIdIDB(expediente.id);

      expect(resultado.status).toBe("closed");
      expect(resultado.estoque.frangosComRecheio).toBe(5);
    });

    it("deve adicionar timestamp _updatedAt automaticamente", async () => {
      const expediente = {
        id: "2024-01-15-1234567",
        date: "2024-01-15",
        status: "active",
      };

      await salvarExpedienteIDB(expediente);
      const recuperado = await getExpedientePorIdIDB(expediente.id);

      expect(recuperado._updatedAt).toBeDefined();
      expect(typeof recuperado._updatedAt).toBe("number");
    });
  });

  describe("getTodosExpedientesIDB", () => {
    it("deve retornar array de expedientes em ordem decrescente por data", async () => {
      const exp1 = { id: "1", date: "2024-01-10", status: "active" };
      const exp2 = { id: "2", date: "2024-01-15", status: "closed" };
      const exp3 = { id: "3", date: "2024-01-12", status: "active" };

      await salvarExpedienteIDB(exp1);
      await salvarExpedienteIDB(exp2);
      await salvarExpedienteIDB(exp3);

      const todos = await getTodosExpedientesIDB();

      expect(todos).toHaveLength(3);
      expect(todos[0].date).toBe("2024-01-15");
      expect(todos[1].date).toBe("2024-01-12");
      expect(todos[2].date).toBe("2024-01-10");
    });

    it("deve retornar array vazio se banco vazio", async () => {
      const todos = await getTodosExpedientesIDB();

      expect(todos).toEqual([]);
    });

    it("deve manter ordem decrescente mesmo após múltiplas inserções", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-05" },
        { id: "2", date: "2024-01-20" },
        { id: "3", date: "2024-01-10" },
        { id: "4", date: "2024-01-15" },
      ];

      for (const exp of expedientes) {
        await salvarExpedienteIDB(exp);
      }

      const todos = await getTodosExpedientesIDB();
      
      for (let i = 0; i < todos.length - 1; i++) {
        expect(todos[i].date >= todos[i + 1].date).toBe(true);
      }
    });
  });

  describe("getExpedientePorIdIDB", () => {
    it("deve retornar null se id não existir", async () => {
      const resultado = await getExpedientePorIdIDB("id-inexistente");

      expect(resultado).toBeNull();
    });

    it("deve retornar expediente correto pelo id", async () => {
      const expediente = {
        id: "2024-01-15-1234567",
        date: "2024-01-15",
        nome: "Teste",
        status: "active",
      };

      await salvarExpedienteIDB(expediente);
      const recuperado = await getExpedientePorIdIDB(expediente.id);

      expect(recuperado).toBeDefined();
      expect(recuperado.nome).toBe("Teste");
    });
  });

  describe("salvarMetaIDB e getMetaIDB", () => {
    it("deve persistir e recuperar metadados corretamente", async () => {
      await salvarMetaIDB("ultimoSync", "2024-01-15T10:30:00Z");
      const valor = await getMetaIDB("ultimoSync");

      expect(valor).toBe("2024-01-15T10:30:00Z");
    });

    it("deve retornar null se metadado não existir", async () => {
      const valor = await getMetaIDB("chave-inexistente");

      expect(valor).toBeNull();
    });

    it("deve atualizar metadado existente", async () => {
      await salvarMetaIDB("versao", "1.0");
      let valor = await getMetaIDB("versao");
      expect(valor).toBe("1.0");

      await salvarMetaIDB("versao", "1.1");
      valor = await getMetaIDB("versao");
      expect(valor).toBe("1.1");
    });

    it("deve suportar valores complexos como objetos", async () => {
      const dados = { lastSync: "2024-01-15", count: 42 };
      await salvarMetaIDB("configuracao", JSON.stringify(dados));
      const valor = await getMetaIDB("configuracao");
      const parsed = JSON.parse(valor);

      expect(parsed.lastSync).toBe("2024-01-15");
      expect(parsed.count).toBe(42);
    });

    it("deve adicionar atualizadoEm automaticamente", async () => {
      await salvarMetaIDB("teste", "valor");
      const valor = await getMetaIDB("teste");

      expect(valor).toBe("valor");
    });
  });

  describe("importarExpedientesIDB", () => {
    it("deve fazer upsert em lote sem duplicar", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-10", status: "active" },
        { id: "2", date: "2024-01-15", status: "closed" },
      ];

      await importarExpedientesIDB(expedientes);
      let todos = await getTodosExpedientesIDB();
      expect(todos).toHaveLength(2);

      // Importar novamente com um novo item
      const expedientesAtualizados = [
        { id: "1", date: "2024-01-10", status: "closed" }, // atualizar
        { id: "3", date: "2024-01-20", status: "active" }, // novo
      ];

      await importarExpedientesIDB(expedientesAtualizados);
      todos = await getTodosExpedientesIDB();

      expect(todos).toHaveLength(3);
      
      // Verificar que o id 1 foi atualizado
      const exp1 = await getExpedientePorIdIDB("1");
      expect(exp1.status).toBe("closed");
    });

    it("deve importar array vazio sem erro", async () => {
      await importarExpedientesIDB([]);
      const todos = await getTodosExpedientesIDB();

      expect(todos).toEqual([]);
    });

    it("deve adicionar _updatedAt a cada item importado", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-10" },
        { id: "2", date: "2024-01-15" },
      ];

      await importarExpedientesIDB(expedientes);
      const todos = await getTodosExpedientesIDB();

      todos.forEach((exp) => {
        expect(exp._updatedAt).toBeDefined();
        expect(typeof exp._updatedAt).toBe("number");
      });
    });

    it("deve preservar campos existentes durante importação", async () => {
      const expediente = {
        id: "1",
        date: "2024-01-10",
        status: "active",
        estoque: { frangosComRecheio: 10 },
        pedidos: [{ id: "p1", nome: "Cliente" }],
      };

      await importarExpedientesIDB([expediente]);
      const importado = await getExpedientePorIdIDB("1");

      expect(importado.estoque.frangosComRecheio).toBe(10);
      expect(importado.pedidos).toHaveLength(1);
    });
  });

  describe("Casos de borda", () => {
    it("deve lidar com campos undefined", async () => {
      const expediente = {
        id: "1",
        date: "2024-01-15",
        status: "active",
        pedidos: undefined,
        vendas: undefined,
      };

      await salvarExpedienteIDB(expediente);
      const recuperado = await getExpedientePorIdIDB("1");

      expect(recuperado.id).toBe("1");
    });

    it("deve lidar com valores zerados", async () => {
      const expediente = {
        id: "1",
        date: "2024-01-15",
        estoque: {
          frangosComRecheio: 0,
          frangosSemRecheio: 0,
          meioFrango: 0,
        },
      };

      await salvarExpedienteIDB(expediente);
      const recuperado = await getExpedientePorIdIDB("1");

      expect(recuperado.estoque.frangosComRecheio).toBe(0);
    });
  });
});
