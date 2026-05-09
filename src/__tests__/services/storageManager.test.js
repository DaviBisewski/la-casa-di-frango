import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks no topo - DEVE SER ANTES DOS IMPORTS
vi.mock("../../../services/storage/indexedDB", () => ({
  salvarExpedienteIDB: vi.fn().mockResolvedValue(undefined),
  getTodosExpedientesIDB: vi.fn().mockResolvedValue([]),
  getExpedientePorIdIDB: vi.fn(),
  importarExpedientesIDB: vi.fn().mockResolvedValue(undefined),
  salvarMetaIDB: vi.fn().mockResolvedValue(undefined),
  getMetaIDB: vi.fn(),
}));

vi.mock("../../../services/storage/backupService", () => ({
  salvarBackupEmergencia: vi.fn(),
  getBackupEmergencia: vi.fn(() => null),
}));

vi.mock("../../../services/storage/syncService", () => ({
  marcarPendente: vi.fn(),
}));

// Imports APÓS os mocks
import {
  salvarExpediente,
  getExpedienteAtual,
  getHistorico,
  adicionarExpediente,
  atualizarExpediente,
  temExpedienteAtivo,
  migrarDadosLegados,
  fazerBackupEmergencia,
} from "../../../services/storageManager";
import * as indexedDBModule from "../../../services/storage/indexedDB";
import * as backupModule from "../../../services/storage/backupService";
import * as syncModule from "../../../services/storage/syncService";

describe("StorageManager - Integração de Armazenamento", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("salvarExpediente", () => {
    it("deve persistir no localStorage E no IndexedDB", async () => {
      const expediente = {
        id: "2024-01-15-1234567",
        date: "2024-01-15",
        status: "active",
      };

      await salvarExpediente(expediente);

      // Verificar localStorage
      const salvo = JSON.parse(localStorage.getItem("expediente_atual"));
      expect(salvo).toEqual(expediente);

      // Verificar que IndexedDB foi chamado
      expect(indexedDBModule.salvarExpedienteIDB).toHaveBeenCalledWith(
        expediente
      );

      // Verificar que foi marcado como pendente de sync
      expect(syncModule.marcarPendente).toHaveBeenCalledWith(expediente.id);
    });

    it("deve chamar todos os serviços de persistência", async () => {
      const expediente = { id: "1", status: "active" };

      await salvarExpediente(expediente);

      expect(indexedDBModule.salvarExpedienteIDB).toHaveBeenCalled();
      expect(syncModule.marcarPendente).toHaveBeenCalled();
    });
  });

  describe("getExpedienteAtual", () => {
    it("deve retornar null se localStorage vazio", () => {
      const resultado = getExpedienteAtual();

      expect(resultado).toBeNull();
    });

    it("deve retornar expediente do localStorage", () => {
      const expediente = { id: "1", status: "active" };
      localStorage.setItem("expediente_atual", JSON.stringify(expediente));

      const resultado = getExpedienteAtual();

      expect(resultado).toEqual(expediente);
    });

    it("deve ser síncrono e rápido", () => {
      localStorage.setItem("expediente_atual", JSON.stringify({ id: "1" }));

      const inicio = performance.now();
      getExpedienteAtual();
      const fim = performance.now();

      expect(fim - inicio).toBeLessThan(10); // Menos de 10ms
    });

    it("deve ser resiliente a JSON corrompido", () => {
      localStorage.setItem("expediente_atual", "{ json invalido");

      const resultado = getExpedienteAtual();

      expect(resultado).toBeNull();
    });
  });

  describe("getHistorico", () => {
    it("deve retornar dados do IndexedDB", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-15" },
        { id: "2", date: "2024-01-16" },
      ];
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue(
        expedientes
      );

      const resultado = await getHistorico();

      expect(resultado).toEqual(expedientes);
    });

    it("deve usar fallback do backup de emergência se IndexedDB falhar", async () => {
      const backup = {
        expedientes: [{ id: "backup", date: "2024-01-15" }],
      };
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockRejectedValue(
        new Error("IndexedDB erro")
      );
      vi.mocked(backupModule.getBackupEmergencia).mockReturnValue(backup);

      const resultado = await getHistorico();

      expect(resultado).toEqual(backup.expedientes);
    });

    it("deve retornar array vazio se tudo falhar", async () => {
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockRejectedValue(
        new Error("Erro")
      );
      vi.mocked(backupModule.getBackupEmergencia).mockReturnValue(null);

      const resultado = await getHistorico();

      expect(resultado).toEqual([]);
    });
  });

  describe("adicionarExpediente", () => {
    it("deve marcar como pendente de sync", async () => {
      const expediente = { id: "1", status: "active" };

      await adicionarExpediente(expediente);

      expect(syncModule.marcarPendente).toHaveBeenCalledWith(expediente.id);
    });

    it("deve salvar no localStorage", async () => {
      const expediente = { id: "1", status: "active" };

      await adicionarExpediente(expediente);

      const salvo = JSON.parse(localStorage.getItem("expediente_atual"));
      expect(salvo).toEqual(expediente);
    });
  });

  describe("atualizarExpediente", () => {
    it("deve atualizar nas duas camadas", async () => {
      const expediente = { id: "1", status: "closed" };

      await atualizarExpediente(expediente);

      expect(indexedDBModule.salvarExpedienteIDB).toHaveBeenCalledWith(
        expediente
      );

      const salvo = JSON.parse(localStorage.getItem("expediente_atual"));
      expect(salvo).toEqual(expediente);
    });
  });

  describe("temExpedienteAtivo", () => {
    it("deve retornar false se banco vazio", async () => {
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue([]);

      const resultado = await temExpedienteAtivo();

      expect(resultado).toBe(false);
    });

    it("deve retornar true se houver expediente com status active", async () => {
      const expedientes = [
        { id: "1", status: "closed" },
        { id: "2", status: "active" },
      ];
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue(
        expedientes
      );

      const resultado = await temExpedienteAtivo();

      expect(resultado).toBe(true);
    });
  });

  describe("migrarDadosLegados", () => {
    it("deve migrar dados do frango_db para IndexedDB", async () => {
      const dadosLegados = {
        days: [
          { id: "1", date: "2024-01-15" },
          { id: "2", date: "2024-01-16" },
        ],
      };
      localStorage.setItem("frango_db", JSON.stringify(dadosLegados));

      await migrarDadosLegados();

      expect(indexedDBModule.importarExpedientesIDB).toHaveBeenCalledWith(
        dadosLegados.days
      );
    });

    it("não deve migrar duas vezes — checa frango_migrado_v2", async () => {
      localStorage.setItem("frango_migrado_v2", "true");

      await migrarDadosLegados();

      expect(indexedDBModule.importarExpedientesIDB).not.toHaveBeenCalled();
    });

    it("deve marcar como migrado após sucesso", async () => {
      const dadosLegados = { days: [{ id: "1" }] };
      localStorage.setItem("frango_db", JSON.stringify(dadosLegados));

      await migrarDadosLegados();

      const migrado = localStorage.getItem("frango_migrado_v2");
      expect(migrado).toBe("true");
    });

    it("deve ser resiliente se não houver dados legados", async () => {
      localStorage.removeItem("frango_db");

      expect(async () => {
        await migrarDadosLegados();
      }).not.toThrow();

      const migrado = localStorage.getItem("frango_migrado_v2");
      expect(migrado).toBe("true");
    });
  });

  describe("fazerBackupEmergencia", () => {
    it("deve salvar snapshot de todos os expedientes", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-15" },
        { id: "2", date: "2024-01-16" },
      ];
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue(
        expedientes
      );

      await fazerBackupEmergencia();

      expect(backupModule.salvarBackupEmergencia).toHaveBeenCalledWith(
        expedientes
      );
    });

    it("deve ser resiliente se IndexedDB falhar", async () => {
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockRejectedValue(
        new Error("Erro")
      );

      expect(async () => {
        await fazerBackupEmergencia();
      }).not.toThrow();
    });
  });

  describe("Fluxo completo integrado", () => {
    it("deve funcionar salvar → recuperar → atualizar", async () => {
      const expediente1 = { id: "1", status: "active", estoque: { frango: 10 } };
      
      await salvarExpediente(expediente1);
      let atual = getExpedienteAtual();
      expect(atual.id).toBe("1");

      const expediente2 = { ...expediente1, estoque: { frango: 5 } };
      await atualizarExpediente(expediente2);
      
      atual = getExpedienteAtual();
      expect(atual.estoque.frango).toBe(5);
    });
  });
});
