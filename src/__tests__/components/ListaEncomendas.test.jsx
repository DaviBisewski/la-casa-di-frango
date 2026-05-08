import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListaEncomendas } from "../../components/Layout/ListaEncomendas";

describe("ListaEncomendas", () => {
  const pedidosPendentes = [
    {
      id: 1,
      nome: "João Silva",
      telefone: "11999999999",
      itens: [{ chave: "frangosComRecheio", quantidade: 2 }],
      retirado: false,
    },
    {
      id: 2,
      nome: "Maria Santos",
      telefone: "11988888888",
      itens: [{ chave: "frangosSemRecheio", quantidade: 1 }],
      retirado: false,
    },
  ];

  const pedidosRetirados = [
    {
      id: 3,
      nome: "Pedro Costa",
      telefone: "11977777777",
      itens: [{ chave: "meioFrango", quantidade: 3 }],
      retirado: true,
    },
  ];

  const todosPedidos = [...pedidosPendentes, ...pedidosRetirados];

  describe("Filtro de abas", () => {
    it("deve exibir apenas pedidos pendentes na aba 'Pendentes'", () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      // Por padrão começa em "pendentes"
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
      expect(screen.queryByText("Pedro Costa")).not.toBeInTheDocument();
    });

    it("deve exibir apenas pedidos retirados na aba 'Retirados'", async () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      const user = userEvent.setup();

      // Procurar pelo botão Retirados e clicar
      const buttons = screen.getAllByRole("button");
      const botaoRetirados = buttons.find(
        (btn) => btn.textContent.includes("Retirados")
      );

      if (botaoRetirados) {
        await user.click(botaoRetirados);
      }

      // Aguardar que o novo conteúdo apareça
      expect(await screen.findByText("Pedro Costa")).toBeInTheDocument();
      expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
    });
  });

  describe("Busca", () => {
    it("deve filtrar por nome corretamente", async () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      const input = screen.getByRole("textbox");
      const user = userEvent.setup();

      await user.type(input, "João");

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
    });

    it("deve filtrar por telefone corretamente", async () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      const input = screen.getByRole("textbox");
      const user = userEvent.setup();

      await user.type(input, "11999999999");

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
    });

    it("deve ser case-insensitive", async () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      const input = screen.getByRole("textbox");
      const user = userEvent.setup();

      await user.type(input, "JOÃO");

      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });

    it("deve limpar resultados quando busca não encontra nada", async () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      const input = screen.getByRole("textbox");
      const user = userEvent.setup();

      await user.type(input, "zzzzz");

      expect(screen.getByText(/Nenhuma encomenda pendente/i)).toBeInTheDocument();
    });
  });

  describe("Mensagens vazias", () => {
    it("deve mostrar 'Nenhuma encomenda pendente' quando lista vazia", () => {
      render(
        <ListaEncomendas pedidos={[]} onRetirar={() => {}} />
      );

      expect(screen.getByText("Nenhuma encomenda pendente")).toBeInTheDocument();
    });

    it("deve mostrar mensagem vazia correspondente à aba", async () => {
      render(
        <ListaEncomendas pedidos={pedidosPendentes} onRetirar={() => {}} />
      );

      const user = userEvent.setup();
      const buttons = screen.getAllByRole("button");
      const botaoRetirados = buttons.find(
        (btn) => btn.textContent.includes("Retirados")
      );

      if (botaoRetirados) {
        await user.click(botaoRetirados);
      }

      expect(
        await screen.findByText("Nenhuma encomenda retirada")
      ).toBeInTheDocument();
    });
  });

  describe("Paginação", () => {
    const pedidosGrande = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      nome: `Cliente ${i + 1}`,
      telefone: `1199999${String(i).padStart(3, "0")}`,
      itens: [{ chave: "frangosComRecheio", quantidade: 1 }],
      retirado: false,
    }));

    it("deve mostrar apenas 4 primeiros pedidos por padrão", () => {
      render(
        <ListaEncomendas pedidos={pedidosGrande} onRetirar={() => {}} />
      );

      expect(screen.getByText("Cliente 1")).toBeInTheDocument();
      expect(screen.getByText("Cliente 4")).toBeInTheDocument();
      expect(screen.queryByText("Cliente 5")).not.toBeInTheDocument();
    });

    it("deve mostrar botão 'Ver mais' quando há mais de 4 pedidos", () => {
      render(
        <ListaEncomendas pedidos={pedidosGrande} onRetirar={() => {}} />
      );

      const verMaisBotao = screen.queryByText((content) =>
        /Ver \+ \d+ encomendas/.test(content)
      );
      expect(verMaisBotao).toBeInTheDocument();
    });

    it("não deve mostrar botão 'Ver mais' quando há 4 ou menos pedidos", () => {
      render(
        <ListaEncomendas pedidos={pedidosPendentes} onRetirar={() => {}} />
      );

      const verMaisBotao = screen.queryByText((content) =>
        /Ver \+ \d+ encomendas/.test(content)
      );
      expect(verMaisBotao).not.toBeInTheDocument();
    });

    it("deve exibir todos os pedidos ao clicar em 'Ver mais'", async () => {
      render(
        <ListaEncomendas pedidos={pedidosGrande} onRetirar={() => {}} />
      );

      const user = userEvent.setup();
      const botaoVerMais = screen.queryByText((content) =>
        /Ver \+ \d+ encomendas/.test(content)
      );

      if (botaoVerMais) {
        await user.click(botaoVerMais);
      }

      // Aguardar que os novos itens apareçam
      for (let i = 1; i <= 10; i++) {
        expect(
          await screen.findByText(`Cliente ${i}`)
        ).toBeInTheDocument();
      }
    });

    it("deve sumir o botão 'Ver mais' após clicar", async () => {
      render(
        <ListaEncomendas pedidos={pedidosGrande} onRetirar={() => {}} />
      );

      const user = userEvent.setup();
      const botaoVerMais = screen.queryByText((content) =>
        /Ver \+ \d+ encomendas/.test(content)
      );

      if (botaoVerMais) {
        await user.click(botaoVerMais);
      }

      await screen.findByText("Cliente 10");
      const botaoVerMaisApos = screen.queryByText((content) =>
        /Ver \+ \d+ encomendas/.test(content)
      );
      expect(botaoVerMaisApos).not.toBeInTheDocument();
    });
  });

  describe("Comportamento integrado", () => {
    it("deve resetar paginação ao trocar de aba", async () => {
      const pedidosMuitos = [
        ...Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          nome: `Cliente ${i + 1}`,
          telefone: `1199999${String(i).padStart(3, "0")}`,
          itens: [],
          retirado: false,
        })),
        ...Array.from({ length: 3 }, (_, i) => ({
          id: i + 100,
          nome: `Retirado ${i + 1}`,
          telefone: `1188888${String(i).padStart(3, "0")}`,
          itens: [],
          retirado: true,
        })),
      ];

      render(
        <ListaEncomendas pedidos={pedidosMuitos} onRetirar={() => {}} />
      );

      const user = userEvent.setup();

      // Clicar em "Ver mais" em pendentes
      const botaoVerMaisPendentes = screen.getByText(/Ver \+ \d+ encomendas/);
      await user.click(botaoVerMaisPendentes);

      // Trocar de aba
      const buttons = screen.getAllByRole("button");
      const botaoRetirados = buttons.find(
        (btn) => btn.textContent.includes("Retirados")
      );

      if (botaoRetirados) {
        await user.click(botaoRetirados);
      }

      // Deve mostrar apenas 3 primeiro (sem "Ver mais")
      expect(await screen.findByText("Retirado 1")).toBeInTheDocument();
      expect(screen.queryByText(/Ver \+ \d+ encomendas/)).not.toBeInTheDocument();
    });

    it("deve filtrar corretamente após trocar de aba", async () => {
      render(
        <ListaEncomendas pedidos={todosPedidos} onRetirar={() => {}} />
      );

      const user = userEvent.setup();

      // Adicionar texto de busca
      const input = screen.getByRole("textbox");
      await user.type(input, "Pedro");

      // Ainda em pendentes - não deve encontrar
      expect(screen.getByText(/Nenhuma encomenda pendente/i)).toBeInTheDocument();

      // Trocar para aba Retirados
      const buttons = screen.getAllByRole("button");
      const botaoRetirados = buttons.find(
        (btn) => btn.textContent.includes("Retirados")
      );

      if (botaoRetirados) {
        await user.click(botaoRetirados);
      }

      // Agora deve encontrar Pedro
      expect(
        await screen.findByText("Pedro Costa")
      ).toBeInTheDocument();
    });
  });
});
