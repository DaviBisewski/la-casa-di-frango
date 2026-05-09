import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  marcarPendente,
  getPendenteCount,
  isOnline,
  sincronizarPendentes,
  doFormatoSupabase,
  baixarDoSupabase,
} from "../../../services/storage/syncService";
import * as supabaseModule from "../../../services/storage/supabaseClient";
import * as indexedDBModule from "../../../services/storage/indexedDB";

describe("SyncService - Sincronização com Supabase", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("marcarPendente", () => {
    it("deve adicionar id à lista de pendentes", () => {
      marcarPendente("exp-1");

      const pendentes = JSON.parse(localStorage.getItem("frango_sync_pendentes"));
      expect(pendentes).toContain("exp-1");
    });

    it("não deve duplicar o mesmo id", () => {
      marcarPendente("exp-1");
      marcarPendente("exp-1");
      marcarPendente("exp-1");

      const pendentes = JSON.parse(localStorage.getItem("frango_sync_pendentes"));
      expect(pendentes.filter((p) => p === "exp-1")).toHaveLength(1);
    });

    it("deve manter pendentes anteriores", () => {
      marcarPendente("exp-1");
      marcarPendente("exp-2");
      marcarPendente("exp-3");

      const pendentes = JSON.parse(localStorage.getItem("frango_sync_pendentes"));
      expect(pendentes).toHaveLength(3);
    });

    it("deve ser resiliente a erros de localStorage", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Erro de armazenamento");
      });

      expect(() => {
        marcarPendente("exp-1");
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("getPendenteCount", () => {
    it("deve retornar 0 se lista vazia", () => {
      const count = getPendenteCount();

      expect(count).toBe(0);
    });

    it("deve retornar quantidade correta de pendentes", () => {
      marcarPendente("exp-1");
      marcarPendente("exp-2");

      const count = getPendenteCount();

      expect(count).toBe(2);
    });

    it("deve retornar 0 se localStorage não tem pendentes", () => {
      localStorage.removeItem("frango_sync_pendentes");

      const count = getPendenteCount();

      expect(count).toBe(0);
    });
  });

  describe("isOnline", () => {
    it("deve refletir navigator.onLine", () => {
      expect(isOnline()).toBe(navigator.onLine);
    });

    it("deve retornar false quando offline", () => {
      navigator.onLine = false;

      expect(isOnline()).toBe(false);

      navigator.onLine = true; // Restaurar
    });

    it("deve retornar true quando online", () => {
      navigator.onLine = true;

      expect(isOnline()).toBe(true);
    });
  });

  describe("doFormatoSupabase", () => {
    it("deve converter campos snake_case para camelCase", () => {
      const row = {
        id: "1",
        date: "2024-01-15",
        status: "active",
        is_sunday: true,
        iniciado_em: 1234567890,
        encerrado_em: 1234567900,
        estoque: { frangosComRecheio: 10 },
        pedidos: [],
        vendas: [],
        updated_at: 1234567890,
      };

      const resultado = doFormatoSupabase(row);

      expect(resultado.isSunday).toBe(true);
      expect(resultado.iniciadoEm).toBe(1234567890);
      expect(resultado.encerradoEm).toBe(1234567900);
      expect(resultado._updatedAt).toBe(1234567890);
    });
  });

  describe("sincronizarPendentes", () => {
    it("deve retornar zeros se offline", async () => {
      navigator.onLine = false;
      marcarPendente("exp-1");

      const resultado = await sincronizarPendentes();

      expect(resultado.sincronizados).toBe(0);
      expect(resultado.erros).toBe(0);

      navigator.onLine = true;
    });

    it("deve retornar zeros se lista vazia", async () => {
      const resultado = await sincronizarPendentes();

      expect(resultado.sincronizados).toBe(0);
      expect(resultado.erros).toBe(0);
    });

    it("deve chamar supabase.upsert para cada pendente", async () => {
      navigator.onLine = true;
      marcarPendente("exp-1");
      marcarPendente("exp-2");

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: mockUpsert,
        })),
      };

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(supabaseModule, "supabase", "get").mockReturnValue(mockSupabase);

      const expedientes = [
        { id: "exp-1", date: "2024-01-15" },
        { id: "exp-2", date: "2024-01-16" },
      ];
      vi.spyOn(indexedDBModule, "getTodosExpedientesIDB").mockResolvedValue(
        expedientes
      );

      await sincronizarPendentes();

      expect(mockUpsert.mock.calls.length).toBeGreaterThan(0);
    });

    it("deve remover da lista após sync bem-sucedido", async () => {
      navigator.onLine = true;
      marcarPendente("exp-1");

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: mockUpsert,
        })),
      };

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(supabaseModule, "supabase", "get").mockReturnValue(mockSupabase);

      const expedientes = [{ id: "exp-1", date: "2024-01-15" }];
      vi.spyOn(indexedDBModule, "getTodosExpedientesIDB").mockResolvedValue(
        expedientes
      );
      vi.spyOn(indexedDBModule, "salvarMetaIDB").mockResolvedValue(undefined);

      await sincronizarPendentes();

      const pendentes = JSON.parse(
        localStorage.getItem("frango_sync_pendentes")
      );
      expect(pendentes).not.toContain("exp-1");
    });

    it("deve manter na lista se houver erro no supabase", async () => {
      navigator.onLine = true;
      marcarPendente("exp-1");

      const mockUpsert = vi
        .fn()
        .mockResolvedValue({ error: { message: "Erro de sync" } });
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: mockUpsert,
        })),
      };

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(supabaseModule, "supabase", "get").mockReturnValue(mockSupabase);

      const expedientes = [{ id: "exp-1" }];
      vi.spyOn(indexedDBModule, "getTodosExpedientesIDB").mockResolvedValue(
        expedientes
      );

      await sincronizarPendentes();

      const pendentes = JSON.parse(
        localStorage.getItem("frango_sync_pendentes")
      );
      expect(pendentes).toContain("exp-1");
    });

    it("deve retornar contagem correta de sincronizados e erros", async () => {
      navigator.onLine = true;
      marcarPendente("exp-1");
      marcarPendente("exp-2");
      marcarPendente("exp-3");

      let callCount = 0;
      const mockUpsert = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          error: callCount === 2 ? { message: "Erro" } : null,
        });
      });
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: mockUpsert,
        })),
      };

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(supabaseModule, "supabase", "get").mockReturnValue(mockSupabase);

      const expedientes = [
        { id: "exp-1" },
        { id: "exp-2" },
        { id: "exp-3" },
      ];
      vi.spyOn(indexedDBModule, "getTodosExpedientesIDB").mockResolvedValue(
        expedientes
      );
      vi.spyOn(indexedDBModule, "salvarMetaIDB").mockResolvedValue(undefined);

      const resultado = await sincronizarPendentes();

      expect(resultado.sincronizados).toBeGreaterThan(0);
      expect(resultado.erros).toBeGreaterThan(0);
    });
  });

  describe("baixarDoSupabase", () => {
    it("deve retornar erro se offline", async () => {
      navigator.onLine = false;

      const resultado = await baixarDoSupabase();

      expect(resultado.importados).toBe(0);
      expect(resultado.erro).toContain("conexão");

      navigator.onLine = true;
    });

    it("deve importar e retornar quantidade correta", async () => {
      navigator.onLine = true;

      const mockData = [
        { id: "1", date: "2024-01-15", is_sunday: false },
        { id: "2", date: "2024-01-16", is_sunday: false },
      ];
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          })),
        })),
      };

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(supabaseModule, "supabase", "get").mockReturnValue(mockSupabase);
      vi.spyOn(indexedDBModule, "importarExpedientesIDB").mockResolvedValue(
        undefined
      );

      const resultado = await baixarDoSupabase();

      expect(resultado.importados).toBe(2);
      expect(resultado.erro).toBeNull();
    });

    it("deve retornar erro se Supabase não configurado", async () => {
      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(false);

      const resultado = await baixarDoSupabase();

      expect(resultado.importados).toBe(0);
      expect(resultado.erro).toBeDefined();
    });

    it("deve atualizar localStorage se houver expediente ativo", async () => {
      navigator.onLine = true;

      const mockData = [
        { id: "1", date: "2024-01-15", status: "active", is_sunday: false },
      ];
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          })),
        })),
      };

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(supabaseModule, "supabase", "get").mockReturnValue(mockSupabase);
      vi.spyOn(indexedDBModule, "importarExpedientesIDB").mockResolvedValue(
        undefined
      );

      await baixarDoSupabase();

      const atual = JSON.parse(localStorage.getItem("expediente_atual"));
      expect(atual.id).toBe("1");
    });
  });

  describe("Casos de borda", () => {
    it("deve lidar com expediente não encontrado na sincronização", async () => {
      navigator.onLine = true;
      marcarPendente("exp-inexistente");

      vi.spyOn(supabaseModule, "supabaseAtivo").mockReturnValue(true);
      vi.spyOn(indexedDBModule, "getTodosExpedientesIDB").mockResolvedValue([]);
      vi.spyOn(indexedDBModule, "salvarMetaIDB").mockResolvedValue(undefined);

      const resultado = await sincronizarPendentes();

      expect(resultado).toBeDefined();
      expect(Array.isArray(JSON.parse(localStorage.getItem("frango_sync_pendentes")) || [])).toBe(
        true
      );
    });
  });
});
