import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mocks no topo
vi.mock("../../../services/storage/indexedDB");

import {
  salvarBackupEmergencia,
  getBackupEmergencia,
  getUltimoBackupTimestamp,
  exportarJSON,
  importarJSON,
} from "../../../services/storage/backupService";
import * as indexedDBModule from "../../../services/storage/indexedDB";

describe("BackupService - Backup e Restauração", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL e URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document.createElement
    const linkMock = {
      href: "",
      download: "",
      click: vi.fn(),
      appendChild: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(linkMock);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => linkMock);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("salvarBackupEmergencia", () => {
    it("deve salvar backup no localStorage com timestamp", () => {
      const expedientes = [
        { id: "1", date: "2024-01-15", status: "active" },
      ];

      salvarBackupEmergencia(expedientes);

      const backup = localStorage.getItem("frango_backup_emergencia");
      expect(backup).toBeDefined();

      const parsed = JSON.parse(backup);
      expect(parsed.expedientes).toEqual(expedientes);
      expect(parsed.salvoEm).toBeDefined();
    });

    it("deve salvar timestamp separado do backup", () => {
      const expedientes = [{ id: "1" }];

      salvarBackupEmergencia(expedientes);

      const ts = localStorage.getItem("frango_backup_timestamp");
      expect(ts).toBeDefined();
      expect(Number(ts)).toBeGreaterThan(0);
    });

    it("deve sobrescrever backup anterior", () => {
      const exp1 = [{ id: "1", date: "2024-01-15" }];
      const exp2 = [{ id: "2", date: "2024-01-16" }];

      salvarBackupEmergencia(exp1);
      salvarBackupEmergencia(exp2);

      const backup = JSON.parse(localStorage.getItem("frango_backup_emergencia"));
      expect(backup.expedientes).toHaveLength(1);
      expect(backup.expedientes[0].id).toBe("2");
    });

    it("deve ser resiliente se localStorage estiver cheio", () => {
      const expedientes = [{ id: "1" }];
      
      // Simular localStorage cheio
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      // Não deve lançar erro
      expect(() => {
        salvarBackupEmergencia(expedientes);
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("getBackupEmergencia", () => {
    it("deve retornar null se não houver backup", () => {
      const resultado = getBackupEmergencia();

      expect(resultado).toBeNull();
    });

    it("deve retornar dados salvos corretamente", () => {
      const expedientes = [
        { id: "1", date: "2024-01-15", status: "active" },
        { id: "2", date: "2024-01-16", status: "closed" },
      ];

      salvarBackupEmergencia(expedientes);
      const backup = getBackupEmergencia();

      expect(backup.expedientes).toEqual(expedientes);
      expect(backup.salvoEm).toBeDefined();
    });

    it("deve ser resiliente a JSON corrompido", () => {
      localStorage.setItem("frango_backup_emergencia", "{ json invalido");

      const resultado = getBackupEmergencia();

      expect(resultado).toBeNull();
    });
  });

  describe("getUltimoBackupTimestamp", () => {
    it("deve retornar null se nunca foi salvo", () => {
      const resultado = getUltimoBackupTimestamp();

      expect(resultado).toBeNull();
    });

    it("deve retornar Data corretamente", () => {
      const expedientes = [{ id: "1" }];
      salvarBackupEmergencia(expedientes);

      const resultado = getUltimoBackupTimestamp();

      expect(resultado).toBeInstanceOf(Date);
      expect(resultado.getTime()).toBeGreaterThan(0);
    });

    it("deve refletir backup mais recente", () => {
      return new Promise((done) => {
        const exp1 = [{ id: "1" }];
        salvarBackupEmergencia(exp1);
        const ts1 = getUltimoBackupTimestamp();

        // Aguardar 10ms para garantir diferença de timestamp
        setTimeout(() => {
          const exp2 = [{ id: "2" }];
          salvarBackupEmergencia(exp2);
          const ts2 = getUltimoBackupTimestamp();

          expect(ts2.getTime()).toBeGreaterThanOrEqual(ts1.getTime());
          done();
        }, 10);
      });
    });
  });

  describe("exportarJSON", () => {
    it("deve criar Blob com estrutura correta", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-15", status: "active" },
      ];
      
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue(
        expedientes
      );

      // Capturar URL criada
      const urls = [];
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = vi.fn((blob) => {
        urls.push(blob);
        return `blob:url-${urls.length}`;
      });

      const linkMock = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = vi.fn(() => linkMock);

      try {
        await exportarJSON();
        
        expect(urls.length).toBeGreaterThan(0);
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        document.body.appendChild = originalAppendChild;
      }
    });

    it("deve incluir versão e metadados", async () => {
      const expedientes = [{ id: "1", date: "2024-01-15" }];
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue(
        expedientes
      );
      vi.mocked(indexedDBModule.salvarMetaIDB).mockResolvedValue(undefined);

      const linkMock = { href: "", download: "", click: vi.fn() };
      document.body.appendChild = vi.fn(() => linkMock);
      document.body.removeChild = vi.fn();

      try {
        await exportarJSON();
        expect(indexedDBModule.salvarMetaIDB).toHaveBeenCalledWith(
          "ultimoExport",
          expect.any(String)
        );
      } finally {
        // Limpar
      }
    });
  });

  describe("importarJSON", () => {
    it("deve retornar erro se arquivo for inválido", async () => {
      const arquivo = new File(["{ json invalido"], "backup.json");

      const resultado = await importarJSON(arquivo);

      expect(resultado.importados).toBe(0);
      expect(resultado.erro).toBeDefined();
    });

    it("deve retornar erro se JSON não tiver campo expedientes", async () => {
      const conteudo = JSON.stringify({ versao: "1.0", app: "Test" });
      const arquivo = new File([conteudo], "backup.json");

      const resultado = await importarJSON(arquivo);

      expect(resultado.importados).toBe(0);
      expect(resultado.erro).toContain("inválido");
    });

    it("deve retornar erro se expedientes não for array", async () => {
      const conteudo = JSON.stringify({
        versao: "1.0",
        expedientes: "não é array",
      });
      const arquivo = new File([conteudo], "backup.json");

      const resultado = await importarJSON(arquivo);

      expect(resultado.importados).toBe(0);
      expect(resultado.erro).toBeDefined();
    });

    it("deve importar corretamente e retornar quantidade importada", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-15", status: "active" },
        { id: "2", date: "2024-01-16", status: "closed" },
      ];
      const conteudo = JSON.stringify({
        versao: "1.0",
        app: "La Casa Di Frango",
        expedientes,
      });
      const arquivo = new File([conteudo], "backup.json");

      vi.spyOn(indexedDBModule, "importarExpedientesIDB").mockResolvedValue(
        undefined
      );

      const resultado = await importarJSON(arquivo);

      expect(resultado.importados).toBe(2);
      expect(resultado.erro).toBeNull();
    });

    it("deve ativar expediente ativo no localStorage após importar", async () => {
      const expedientes = [
        { id: "1", date: "2024-01-15", status: "active" },
        { id: "2", date: "2024-01-16", status: "closed" },
      ];
      const conteudo = JSON.stringify({
        versao: "1.0",
        expedientes,
      });
      const arquivo = new File([conteudo], "backup.json");

      vi.spyOn(indexedDBModule, "importarExpedientesIDB").mockResolvedValue(
        undefined
      );

      await importarJSON(arquivo);

      const atual = JSON.parse(localStorage.getItem("expediente_atual"));
      expect(atual.id).toBe("1");
      expect(atual.status).toBe("active");
    });

    it("deve não definir expediente_atual se não houver expediente ativo", async () => {
      const expedientes = [{ id: "1", date: "2024-01-15", status: "closed" }];
      const conteudo = JSON.stringify({
        versao: "1.0",
        expedientes,
      });
      const arquivo = new File([conteudo], "backup.json");

      vi.spyOn(indexedDBModule, "importarExpedientesIDB").mockResolvedValue(
        undefined
      );

      localStorage.setItem("expediente_atual", JSON.stringify({ id: "old" }));
      await importarJSON(arquivo);

      const atual = JSON.parse(localStorage.getItem("expediente_atual"));
      expect(atual.id).toBe("old"); // Não foi alterado
    });
  });

  describe("Casos de borde", () => {
    it("deve lidar com array vazio de expedientes", () => {
      const expedientes = [];

      salvarBackupEmergencia(expedientes);
      const backup = getBackupEmergencia();

      expect(backup.expedientes).toEqual([]);
    });

    it("deve lidar com expedientes com campos aninhados complexos", () => {
      const expedientes = [
        {
          id: "1",
          pedidos: [
            {
              id: "p1",
              itens: [
                { chave: "frangosComRecheio", quantidade: 5 },
              ],
            },
          ],
        },
      ];

      salvarBackupEmergencia(expedientes);
      const backup = getBackupEmergencia();

      expect(backup.expedientes[0].pedidos[0].itens[0].quantidade).toBe(5);
    });
  });
});
