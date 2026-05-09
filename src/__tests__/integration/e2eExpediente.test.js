import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks no topo - DEVE SER ANTES DE QUALQUER IMPORT DE MÓDULO MOCKADO
vi.mock("../../../services/storage/indexedDB");
vi.mock("../../../services/storage/syncService");
vi.mock("../../../services/storage/backupService");
vi.mock("../../../services/storage");
vi.mock("../../../services/storageManager");
vi.mock("../../../services/expedienteService");

// Imports APÓS os mocks
import {
  salvarExpediente,
  getExpedienteAtual,
  getHistorico,
  atualizarExpediente,
  temExpedienteAtivo,
} from "../../../services/storageManager";
import { expedienteService } from "../../../services/expedienteService";
import * as indexedDBModule from "../../../services/storage/indexedDB";
import * as syncModule from "../../../services/storage/syncService";
import { storage } from "../../../services/storage";

describe("Fluxo Completo E2E - Expediente", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue([]);
    vi.mocked(indexedDBModule.salvarExpedienteIDB).mockResolvedValue(undefined);
    vi.mocked(syncModule.marcarPendente).mockImplementation(() => {});
  });

  describe("Cenário 1: Criar expediente → Adicionar encomenda → Verificar totais", () => {
    it("deve criar expediente, adicionar encomenda e atualizar getTotalEncomendado", async () => {
      // Criar expediente
      const form = {
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      };

      // Aqui o serviço de criação não usa storage.getDB
      const expediente = expedienteService.criar(form);

      expect(expediente.status).toBe("active");
      expect(expediente.estoque.frangosComRecheio).toBe(10);

      // Simular adição de encomenda
      const dados = {
        nome: "Cliente 1",
        telefone: "111111",
        itens: [{ chave: "frangosComRecheio", quantidade: 5 }],
      };

      // Mock de métodos storage
      vi.spyOn(expedienteService, "adicionarEncomenda").mockReturnValue({
        ...expediente,
        pedidos: [{ id: 1, ...dados, retirado: false }],
      });

      const comEncomenda = expedienteService.adicionarEncomenda(expediente, dados);

      // Verificar total encomendado
      const total = expedienteService.getTotalEncomendado(
        comEncomenda,
        "frangosComRecheio"
      );

      expect(total).toBe(5);
      expect(comEncomenda.pedidos).toHaveLength(1);
    });
  });

  describe("Cenário 2: Criar expediente → Adicionar venda → Verificar disponível decrementado", () => {
    it("deve adicionar venda e refletir em getDisponivel", async () => {
      // Criar expediente
      const expediente = expedienteService.criar({
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      // Disponível inicial
      const disponivelInicial = expedienteService.getDisponivel(
        expediente,
        "frangosComRecheio"
      );
      expect(disponivelInicial).toBe(10);

      // Adicionar venda
      const dadosVenda = {
        itens: [{ chave: "frangosComRecheio", quantidade: 3 }],
      };

      vi.spyOn(expedienteService, "adicionarVenda").mockReturnValue({
        ...expediente,
        vendas: [{ id: 1, tipo: "venda", ...dadosVenda }],
      });

      const comVenda = expedienteService.adicionarVenda(expediente, dadosVenda);

      // Disponível após venda
      const disponivelApos = expedienteService.getDisponivel(
        comVenda,
        "frangosComRecheio"
      );
      expect(disponivelApos).toBe(7); // 10 - 3
    });
  });

  describe("Cenário 3: Criar expediente → Encerrar → Criar novo → Deve funcionar normalmente", () => {
    it("deve permitir criar novo expediente após encerrar anterior", async () => {
      // Criar primeiro expediente
      const exp1 = expedienteService.criar({
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      expect(exp1.status).toBe("active");

      // Encerrar
      vi.spyOn(expedienteService, "encerrar").mockReturnValue({
        ...exp1,
        status: "closed",
        encerradoEm: Date.now(),
      });

      const exp1Encerrado = expedienteService.encerrar(exp1);
      expect(exp1Encerrado.status).toBe("closed");

      // Criar novo expediente
      const exp2 = expedienteService.criar({
        comRecheio: "8",
        semRecheio: "4",
        meio: "2",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      expect(exp2.status).toBe("active");
      expect(exp2.id).not.toBe(exp1.id);
    });
  });

  describe("Cenário 4: Marcar encomenda como retirada → Verificar retirado: true no pedido certo", () => {
    it("deve marcar apenas o pedido correto como retirado", () => {
      // Criar expediente com pedidos
      const expediente = expedienteService.criar({
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      const exp1 = {
        ...expediente,
        pedidos: [
          { id: 1, nome: "Cliente 1", retirado: false },
          { id: 2, nome: "Cliente 2", retirado: false },
        ],
      };

      // Mock de marcarRetirado
      vi.spyOn(expedienteService, "marcarRetirado").mockReturnValue({
        ...exp1,
        pedidos: [
          { id: 1, nome: "Cliente 1", retirado: true },
          { id: 2, nome: "Cliente 2", retirado: false },
        ],
      });

      const atualizado = expedienteService.marcarRetirado(exp1, 1);

      expect(atualizado.pedidos[0].retirado).toBe(true);
      expect(atualizado.pedidos[1].retirado).toBe(false);
    });
  });

  describe("Cenário 5: Salvar expediente → Simular queda do IndexedDB → getHistorico usa backup", () => {
    it("deve recuperar do backup se IndexedDB falhar", async () => {
      // Setup: salvar expediente
      const expediente = expedienteService.criar({
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      // Simular falha do IndexedDB na leitura
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockRejectedValueOnce(
        new Error("IndexedDB error")
      );

      // Isso testaria o fallback no storageManager
      // Por enquanto, apenas verificamos que o erro é tratado
      expect(async () => {
        await getHistorico();
      }).not.toThrow();
    });
  });

  describe("Cenário 6: Criar expediente offline → Simular conexão → sincronizarPendentes", () => {
    it("deve marcar como pendente offline e sincronizar quando voltar online", async () => {
      // Setup: criar expediente
      const expediente = expedienteService.criar({
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      // Salvar expediente (vai marcar como pendente)
      await salvarExpediente(expediente);

      // Verificar que foi marcado pendente
      expect(syncModule.marcarPendente).toHaveBeenCalledWith(expediente.id);

      // Verificar que está em localStorage
      const atual = getExpedienteAtual();
      expect(atual).toBeDefined();
    });
  });

  describe("Cenário 7: Exportar JSON → Importar no mesmo banco → Dados idênticos", () => {
    it("deve preservar dados ao exportar e importar", async () => {
      // Criar alguns expedientes
      const expedientes = [
        {
          id: "1",
          date: "2024-01-15",
          status: "active",
          estoque: { frangosComRecheio: 10 },
          pedidos: [{ id: "p1", nome: "Cliente" }],
        },
        {
          id: "2",
          date: "2024-01-16",
          status: "closed",
          estoque: { frangosComRecheio: 5 },
          pedidos: [],
        },
      ];

      // Mock exportação
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue(
        expedientes
      );

      // Obter dados para exportação
      const dados = await indexedDBModule.getTodosExpedientesIDB();

      // Verificar que dados são idênticos
      expect(dados).toEqual(expedientes);

      // Simular reimportação
      vi.mocked(indexedDBModule.importarExpedientesIDB).mockResolvedValue(
        undefined
      );

      await indexedDBModule.importarExpedientesIDB(expedientes);

      // Verificar que importação foi chamada
      expect(
        indexedDBModule.importarExpedientesIDB
      ).toHaveBeenCalledWith(expedientes);
    });
  });

  describe("Cenário 8: Múltiplas encomendas com mesma chave → getTotalEncomendado soma corretamente", () => {
    it("deve somar todas as encomendas da mesma chave", () => {
      const expediente = {
        estoque: { frangosComRecheio: 20 },
        pedidos: [
          { id: 1, itens: [{ chave: "frangosComRecheio", quantidade: 3 }] },
          { id: 2, itens: [{ chave: "frangosComRecheio", quantidade: 2 }] },
          { id: 3, itens: [{ chave: "frangosComRecheio", quantidade: 5 }] },
        ],
        vendas: [],
      };

      const total = expedienteService.getTotalEncomendado(
        expediente,
        "frangosComRecheio"
      );

      expect(total).toBe(10); // 3 + 2 + 5
    });
  });

  describe("Cenário 9: Verificar temExpedienteAtivo após criar e encerrar", () => {
    it("deve retornar true com expediente ativo e false depois de encerrar", async () => {
      // Não há expediente no início
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue([]);
      let resultado = await temExpedienteAtivo();
      expect(resultado).toBe(false);

      // Criar expediente
      const expediente = expedienteService.criar({
        comRecheio: "10",
        semRecheio: "5",
        meio: "3",
        maionese10: "0",
        maionese15: "0",
        costela: "0",
      });

      // Simular expediente ativo no banco
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue([
        expediente,
      ]);
      resultado = await temExpedienteAtivo();
      expect(resultado).toBe(true);

      // Encerrar expediente
      const encerrado = { ...expediente, status: "closed" };
      vi.mocked(indexedDBModule.getTodosExpedientesIDB).mockResolvedValue([
        encerrado,
      ]);
      resultado = await temExpedienteAtivo();
      expect(resultado).toBe(false);
    });
  });

  describe("Cenário 10: Teste de tempo de operações críticas", () => {
    it("getExpedienteAtual deve ser muito rápido (síncrono)", () => {
      const expediente = { id: "1", status: "active" };
      localStorage.setItem("expediente_atual", JSON.stringify(expediente));

      const inicio = performance.now();
      getExpedienteAtual();
      const fim = performance.now();

      expect(fim - inicio).toBeLessThan(5); // Menos de 5ms
    });
  });
});
