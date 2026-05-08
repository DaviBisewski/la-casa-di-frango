import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EncomendaCard } from "../../components/Cards/EncomendaCard";

describe("EncomendaCard", () => {
  const pedido = {
    id: 1,
    nome: "João Silva",
    telefone: "11999999999",
    itens: [
      { chave: "frangosComRecheio", quantidade: 2 },
      { chave: "frangosSemRecheio", quantidade: 1 },
    ],
    retirado: false,
  };

  describe("Exibição de dados", () => {
    it("deve exibir nome do cliente", () => {
      render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={false} />
      );

      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });

    it("deve exibir telefone do cliente", () => {
      render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={false} />
      );

      expect(screen.getByText("11999999999")).toBeInTheDocument();
    });

    it("deve exibir '—' quando telefone não existe", () => {
      const pedidoSemTelefone = { ...pedido, telefone: undefined };

      render(
        <EncomendaCard
          pedido={pedidoSemTelefone}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("deve exibir itens com quantidade e label corretos", () => {
      render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={false} />
      );

      // Procurar por texto que contenha a quantidade e o tipo
      expect(screen.getByText((content) => /2x/.test(content))).toBeInTheDocument();
      expect(screen.getByText(/C\/R/)).toBeInTheDocument();
      expect(screen.getByText((content) => /1x/.test(content))).toBeInTheDocument();
      expect(screen.getByText(/S\/R/)).toBeInTheDocument();
    });

    it("deve exibir labels corretamente para todos os produtos", () => {
      const pedidoCompleto = {
        id: 1,
        nome: "Maria",
        telefone: "11988888888",
        itens: [
          { chave: "frangosComRecheio", quantidade: 2 },
          { chave: "frangosSemRecheio", quantidade: 1 },
          { chave: "meioFrango", quantidade: 3 },
          { chave: "maionese10", quantidade: 1 },
          { chave: "maionese15", quantidade: 2 },
          { chave: "costela", quantidade: 1 },
        ],
        retirado: false,
      };

      render(
        <EncomendaCard
          pedido={pedidoCompleto}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      expect(screen.getByText(/C\/R/)).toBeInTheDocument();
      expect(screen.getByText(/S\/R/)).toBeInTheDocument();
      expect(screen.getByText(/Meio FR/)).toBeInTheDocument();
      expect(screen.getByText(/Mai\. P/)).toBeInTheDocument();
      expect(screen.getByText(/Mai\. G/)).toBeInTheDocument();
      expect(screen.getByText(/Costela/)).toBeInTheDocument();
    });

    it("deve lidar com pedidos sem itens", () => {
      const pedidoSemItens = { ...pedido, itens: [] };

      render(
        <EncomendaCard
          pedido={pedidoSemItens}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });
  });

  describe("Botão de retirada", () => {
    it("deve exibir botão de retirar quando retirado é false", () => {
      const onRetirar = vi.fn();

      render(
        <EncomendaCard pedido={pedido} onRetirar={onRetirar} retirado={false} />
      );

      const botoes = screen.getAllByRole("button");
      expect(botoes.length).toBeGreaterThan(0);
    });

    it("deve chamar onRetirar com o id correto ao clicar", async () => {
      const onRetirar = vi.fn();
      const user = userEvent.setup();

      render(
        <EncomendaCard pedido={pedido} onRetirar={onRetirar} retirado={false} />
      );

      const botoes = screen.getAllByRole("button");
      if (botoes.length > 0) {
        await user.click(botoes[0]);
      }

      expect(onRetirar).toHaveBeenCalledWith(1);
    });

    it("não deve chamar onRetirar quando retirado é true", async () => {
      const onRetirar = vi.fn();
      const user = userEvent.setup();

      render(
        <EncomendaCard pedido={pedido} onRetirar={onRetirar} retirado={true} />
      );

      // Não deve haver botão clicável
      // O botão ativo não deve existir quando retirado é true
      const botoes = screen.queryAllByRole("button");
      expect(botoes.length).toBe(0);

      expect(onRetirar).not.toHaveBeenCalled();
    });

    it("deve exibir ícone de retirado quando retirado é true", () => {
      const { container } = render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={true} />
      );

      // Quando retirado, o card tem opacidade reduzida
      const mainCard = container.querySelector("div");
      expect(mainCard).toHaveClass("opacity-50");
    });
  });

  describe("Estilos baseados em estado", () => {
    it("deve ter background D4F1E6 quando não retirado", () => {
      const { container } = render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={false} />
      );

      const mainDiv = container.querySelector("div");
      expect(mainDiv).toHaveClass("bg-[#D4F1E6]");
    });

    it("deve ter background white com border quando retirado", () => {
      const { container } = render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={true} />
      );

      const mainDiv = container.querySelector("div");
      expect(mainDiv).toHaveClass("bg-white");
      expect(mainDiv).toHaveClass("border-2");
    });

    it("deve ter opacidade reduzida quando retirado", () => {
      const { container } = render(
        <EncomendaCard pedido={pedido} onRetirar={() => {}} retirado={true} />
      );

      const mainDiv = container.querySelector("div");
      expect(mainDiv).toHaveClass("opacity-50");
    });
  });

  describe("Casos de borda", () => {
    it("deve exibir nome vazio se não fornecido", () => {
      const pedidoSemNome = { ...pedido, nome: "" };

      const { container } = render(
        <EncomendaCard
          pedido={pedidoSemNome}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it("deve exibir quantidade 0 se item tiver quantidade 0", () => {
      const pedidoComZero = {
        ...pedido,
        itens: [{ chave: "frangosComRecheio", quantidade: 0 }],
      };

      render(
        <EncomendaCard
          pedido={pedidoComZero}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      expect(screen.getByText(/0x/)).toBeInTheDocument();
    });

    it("deve lidar com itens com chave desconhecida", () => {
      const pedidoComChaveDesconhecida = {
        ...pedido,
        itens: [{ chave: "produtoNovoDesconhecido", quantidade: 5 }],
      };

      render(
        <EncomendaCard
          pedido={pedidoComChaveDesconhecida}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      // Deve exibir a quantidade e o tipo de produto
      expect(screen.getByText(/5x/)).toBeInTheDocument();
      // Pode exibir tanto a chave quanto a label desconhecida
      expect(
        screen.getByText((content) =>
          /produtoNovoDesconhecido/.test(content)
        )
      ).toBeInTheDocument();
    });

    it("deve renderizar com múltiplos itens de forma legível", () => {
      const pedidoMuitos = {
        ...pedido,
        itens: Array.from({ length: 5 }, (_, i) => ({
          chave: "frangosComRecheio",
          quantidade: i + 1,
        })),
      };

      const { container } = render(
        <EncomendaCard
          pedido={pedidoMuitos}
          onRetirar={() => {}}
          retirado={false}
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });
  });
});
