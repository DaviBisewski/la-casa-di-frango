import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuantidadeCounter } from "../../components/Layout/QuantidadeCounter";

describe("QuantidadeCounter", () => {
  describe("Incremento", () => {
    it("deve incrementar valor ao clicar no botão +", async () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <QuantidadeCounter value={5} onChange={onChange} max={20} />
      );

      const botoesPlus = screen.getAllByRole("button");
      const botaoPlus = botoesPlus[1]; // O segundo botão é o +

      const user = userEvent.setup();
      await user.click(botaoPlus);

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it("não deve ultrapassar o valor de max ao clicar em +", async () => {
      const onChange = vi.fn();
      render(<QuantidadeCounter value={19} onChange={onChange} max={20} />);

      const botoesPlus = screen.getAllByRole("button");
      const botaoPlus = botoesPlus[1];

      const user = userEvent.setup();
      await user.click(botaoPlus);

      expect(onChange).toHaveBeenCalledWith(20);
    });

    it("deve ficar no max quando tentar ultrapassar", async () => {
      const onChange = vi.fn();
      render(<QuantidadeCounter value={20} onChange={onChange} max={20} />);

      const botoesPlus = screen.getAllByRole("button");
      const botaoPlus = botoesPlus[1];

      const user = userEvent.setup();
      await user.click(botaoPlus);

      expect(onChange).toHaveBeenCalledWith(20);
    });
  });

  describe("Decremento", () => {
    it("deve decrementar valor ao clicar no botão −", async () => {
      const onChange = vi.fn();
      render(<QuantidadeCounter value={5} onChange={onChange} max={20} />);

      const botoesMenos = screen.getAllByRole("button");
      const botaoMenos = botoesMenos[0]; // O primeiro botão é o −

      const user = userEvent.setup();
      await user.click(botaoMenos);

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("não deve ir abaixo de 0 ao clicar em −", async () => {
      const onChange = vi.fn();
      render(<QuantidadeCounter value={1} onChange={onChange} max={20} />);

      const botoesMenos = screen.getAllByRole("button");
      const botaoMenos = botoesMenos[0];

      const user = userEvent.setup();
      await user.click(botaoMenos);

      expect(onChange).toHaveBeenCalledWith(0);
    });

    it("deve ficar em 0 quando tentar decrementar de 0", async () => {
      const onChange = vi.fn();
      render(<QuantidadeCounter value={0} onChange={onChange} max={20} />);

      const botoesMenos = screen.getAllByRole("button");
      const botaoMenos = botoesMenos[0];

      const user = userEvent.setup();
      await user.click(botaoMenos);

      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe("Exibição", () => {
    it("deve exibir o valor atual corretamente", () => {
      render(<QuantidadeCounter value={7} onChange={() => {}} max={20} />);

      const numeroElement = screen.getByText("7");
      expect(numeroElement).toBeInTheDocument();
      expect(numeroElement).toHaveClass("text-3xl");
    });

    it("deve exibir 0 corretamente", () => {
      render(<QuantidadeCounter value={0} onChange={() => {}} max={20} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("deve exibir valor máximo corretamente", () => {
      render(<QuantidadeCounter value={100} onChange={() => {}} max={100} />);

      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  describe("Comportamento integrado", () => {
    it("deve permitir múltiplos cliques incrementais", async () => {
      let valor = 5;
      const onChange = vi.fn((novoValor) => {
        valor = novoValor;
      });

      const { rerender } = render(
        <QuantidadeCounter value={valor} onChange={onChange} max={20} />
      );

      const user = userEvent.setup();

      // Primeiro clique
      let botoesPlus = screen.getAllByRole("button");
      await user.click(botoesPlus[1]);
      
      rerender(
        <QuantidadeCounter value={6} onChange={onChange} max={20} />
      );

      // Segundo clique
      botoesPlus = screen.getAllByRole("button");
      await user.click(botoesPlus[1]);
      
      rerender(
        <QuantidadeCounter value={7} onChange={onChange} max={20} />
      );

      // Terceiro clique
      botoesPlus = screen.getAllByRole("button");
      await user.click(botoesPlus[1]);

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 6);
      expect(onChange).toHaveBeenNthCalledWith(2, 7);
      expect(onChange).toHaveBeenNthCalledWith(3, 8);
    });

    it("deve permitir múltiplos cliques decrementais", async () => {
      let valor = 5;
      const onChange = vi.fn((novoValor) => {
        valor = novoValor;
      });

      const { rerender } = render(
        <QuantidadeCounter value={valor} onChange={onChange} max={20} />
      );

      const user = userEvent.setup();

      // Primeiro clique
      let botoesMenos = screen.getAllByRole("button");
      await user.click(botoesMenos[0]);
      
      rerender(
        <QuantidadeCounter value={4} onChange={onChange} max={20} />
      );

      // Segundo clique
      botoesMenos = screen.getAllByRole("button");
      await user.click(botoesMenos[0]);

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, 4);
      expect(onChange).toHaveBeenNthCalledWith(2, 3);
    });
  });
});
