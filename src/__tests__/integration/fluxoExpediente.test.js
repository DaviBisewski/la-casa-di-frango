import { describe, it, expect, beforeEach, vi } from "vitest";
import { expedienteService } from "../../services/expedienteService";
import { storage } from "../../services/storage";

// Mock do storage para integração completa
vi.mock("../../services/storage", () => ({
  storage: {
    getDB: vi.fn(() => ({ days: [] })),
    salvarDB: vi.fn(),
    getExpedienteAtual: vi.fn(() => null),
    salvarExpedienteAtual: vi.fn(),
    adicionarExpedienteToDB: vi.fn(),
    atualizarExpedienteNoDB: vi.fn(),
    getHistorico: vi.fn(() => []),
  },
}));

describe("Fluxo completo de expediente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("Criar expediente → adicionar 2 encomendas → verificar getTotalEncomendado", () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar expediente
    const form = {
      comRecheio: 20,
      semRecheio: 15,
      meio: 10,
    };
    const expediente = expedienteService.criar(form);

    expect(expediente).not.toBeNull();
    expect(expediente.status).toBe("active");

    // 2. Adicionar primeira encomenda
    const encomenda1 = {
      nome: "João",
      telefone: "11999999999",
      itens: [{ chave: "frangosComRecheio", quantidade: 5 }],
    };
    let expedienteAtualizado = expedienteService.adicionarEncomenda(
      expediente,
      encomenda1
    );

    expect(expedienteAtualizado.pedidos).toHaveLength(1);

    // 3. Adicionar segunda encomenda
    const encomenda2 = {
      nome: "Maria",
      telefone: "11988888888",
      itens: [{ chave: "frangosComRecheio", quantidade: 3 }],
    };
    expedienteAtualizado = expedienteService.adicionarEncomenda(
      expedienteAtualizado,
      encomenda2
    );

    expect(expedienteAtualizado.pedidos).toHaveLength(2);

    // 4. Verificar getTotalEncomendado
    const totalEncomendado = expedienteService.getTotalEncomendado(
      expedienteAtualizado,
      "frangosComRecheio"
    );
    expect(totalEncomendado).toBe(8); // 5 + 3
  });

  it("Criar expediente → adicionar venda → verificar getDisponivel decrementado", () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar expediente
    const form = {
      comRecheio: 20,
      semRecheio: 15,
      meio: 10,
    };
    const expediente = expedienteService.criar(form);

    // 2. Verificar disponível inicial
    let disponivel = expedienteService.getDisponivel(
      expediente,
      "frangosComRecheio"
    );
    expect(disponivel).toBe(20);

    // 3. Adicionar venda
    const venda = {
      itens: [{ chave: "frangosComRecheio", quantidade: 7 }],
    };
    let expedienteAtualizado = expedienteService.adicionarVenda(
      expediente,
      venda
    );

    // 4. Verificar disponível decrementado
    disponivel = expedienteService.getDisponivel(
      expedienteAtualizado,
      "frangosComRecheio"
    );
    expect(disponivel).toBe(13); // 20 - 7
  });

  it("Criar expediente → encerrar → tentar criar novo → deve funcionar normalmente", async () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar primeiro expediente
    const form = { comRecheio: 20, semRecheio: 15, meio: 10 };
    const expediente1 = expedienteService.criar(form);

    expect(expediente1).not.toBeNull();
    expect(expediente1.status).toBe("active");

    // 2. Encerrar primeiro expediente
    const expedienteEncerrado = expedienteService.encerrar(expediente1);
    expect(expedienteEncerrado.status).toBe("closed");

    // Simular que o expediente encerrado foi salvo no DB (status closed)
    storage.getDB.mockReturnValue({ days: [expedienteEncerrado] });

    // 3. Pequena pausa e tentar criar novo (deve funcionar porque o anterior está "closed")
    await new Promise(resolve => setTimeout(resolve, 10));
    const expediente2 = expedienteService.criar(form);

    expect(expediente2).not.toBeNull();
    expect(expediente2.status).toBe("active");
    // IDs devem ser diferentes pois o timestamp mudou
    expect(expediente2.id).not.toBe(expediente1.id);
  });

  it("Tentar criar dois expedientes ativos → segundo deve retornar null", () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar primeiro expediente
    const form = { comRecheio: 20, semRecheio: 15, meio: 10 };
    const expediente1 = expedienteService.criar(form);

    expect(expediente1).not.toBeNull();

    // 2. Simular que o primeiro expediente está salvo com status "active"
    storage.getDB.mockReturnValue({ days: [expediente1] });

    // 3. Tentar criar segundo expediente (deve retornar null)
    const expediente2 = expedienteService.criar(form);

    expect(expediente2).toBeNull();
  });

  it("Criar encomenda → marcar como retirada → verificar retirado: true no pedido correto", async () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar expediente
    const form = { comRecheio: 20, semRecheio: 15, meio: 10 };
    let expedienteAtualizado = expedienteService.criar(form);

    // 2. Adicionar primeira encomenda
    expedienteAtualizado = expedienteService.adicionarEncomenda(
      expedienteAtualizado,
      { nome: "João", telefone: "11999999999", itens: [] }
    );
    const idJoao = expedienteAtualizado.pedidos[0].id;

    // Aguardar para garantir ID diferente
    await new Promise(resolve => setTimeout(resolve, 2));

    // 3. Adicionar segunda encomenda
    expedienteAtualizado = expedienteService.adicionarEncomenda(
      expedienteAtualizado,
      { nome: "Maria", telefone: "11988888888", itens: [] }
    );
    const idMaria = expedienteAtualizado.pedidos[1].id;

    // Aguardar para garantir ID diferente
    await new Promise(resolve => setTimeout(resolve, 2));

    // 4. Adicionar terceira encomenda
    expedienteAtualizado = expedienteService.adicionarEncomenda(
      expedienteAtualizado,
      { nome: "Pedro", telefone: "11977777777", itens: [] }
    );

    expect(expedienteAtualizado.pedidos).toHaveLength(3);
    expect(idJoao).not.toBe(idMaria);

    // 5. Marcar segunda encomenda (Maria) como retirada
    expedienteAtualizado = expedienteService.marcarRetirado(
      expedienteAtualizado,
      idMaria
    );

    // 6. Verificar que apenas a segunda foi marcada como retirada
    const pedidoJoao = expedienteAtualizado.pedidos.find(p => p.id === idJoao);
    const pedidoMaria = expedienteAtualizado.pedidos.find(p => p.id === idMaria);
    const pedidoPedro = expedienteAtualizado.pedidos.find(p => p.nome === "Pedro");

    expect(pedidoJoao.retirado).toBe(false);
    expect(pedidoMaria.retirado).toBe(true);
    expect(pedidoPedro.retirado).toBe(false);
  });

  it("Fluxo completo: encomendas + vendas + cálculos de disponível", () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar expediente com estoque
    const form = { comRecheio: 30, semRecheio: 20, meio: 15 };
    const expediente = expedienteService.criar(form);

    // 2. Adicionar 2 encomendas de "comRecheio"
    let exp = expediente;
    exp = expedienteService.adicionarEncomenda(exp, {
      nome: "Cliente 1",
      telefone: "11111111111",
      itens: [{ chave: "frangosComRecheio", quantidade: 10 }],
    });
    exp = expedienteService.adicionarEncomenda(exp, {
      nome: "Cliente 2",
      telefone: "22222222222",
      itens: [{ chave: "frangosComRecheio", quantidade: 5 }],
    });

    // 3. Adicionar 1 venda de "comRecheio"
    exp = expedienteService.adicionarVenda(exp, {
      itens: [{ chave: "frangosComRecheio", quantidade: 8 }],
    });

    // 4. Verificar cálculos
    const totalEncomendado = expedienteService.getTotalEncomendado(
      exp,
      "frangosComRecheio"
    );
    expect(totalEncomendado).toBe(15); // 10 + 5

    const totalVendido = expedienteService.getTotalVendido(
      exp,
      "frangosComRecheio"
    );
    expect(totalVendido).toBe(8);

    const disponivel = expedienteService.getDisponivel(
      exp,
      "frangosComRecheio"
    );
    expect(disponivel).toBe(7); // 30 - 15 - 8

    // 5. Verificar que outros produtos não foram afetados
    const disponívelSemRecheio = expedienteService.getDisponivel(
      exp,
      "frangosSemRecheio"
    );
    expect(disponívelSemRecheio).toBe(20); // Sem alterações
  });

  it("Persistência: expediente deve ser salvo e recuperado corretamente", () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar expediente
    const form = { comRecheio: 20, semRecheio: 15, meio: 10 };
    const expediente = expedienteService.criar(form);

    // 2. Simular salvar
    expect(storage.salvarExpedienteAtual).toHaveBeenCalledWith(expediente);
    expect(storage.adicionarExpedienteToDB).toHaveBeenCalledWith(expediente);

    // 3. Simular recuperação
    storage.getExpedienteAtual.mockReturnValue(expediente);
    const recuperado = storage.getExpedienteAtual();

    expect(recuperado).toEqual(expediente);
    expect(recuperado.id).toBe(expediente.id);
  });

  it("Tempo ativo deve acumular corretamente", () => {
    storage.getDB.mockReturnValue({ days: [] });

    // 1. Criar expediente
    const form = { comRecheio: 20, semRecheio: 15, meio: 10 };
    const expediente = expedienteService.criar(form);

    // 2. Simular 2.5 horas depois
    const expedienteAfterTime = {
      ...expediente,
      iniciadoEm: Date.now() - 2.5 * 60 * 60 * 1000,
    };

    const tempoAtivo = expedienteService.getTempoAtivo(expedienteAfterTime);

    expect(tempoAtivo).toMatch(/^2h \d{2}min$/);
    expect(tempoAtivo).not.toBe("—");
  });
});
