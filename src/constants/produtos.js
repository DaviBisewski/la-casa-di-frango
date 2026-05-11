/**
 * Constantes e definições de produtos
 * Usado em Encomenda.jsx e Venda.jsx
 */

import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";

/**
 * Mapeamento de chaves para rótulos de exibição
 * Usado em EncomendaCard e ListaEncomendas
 */
export const LABEL_PRODUTOS = {
  frangosComRecheio: "C/R",
  frangosSemRecheio: "S/R",
  meioFrango: "Meio FR",
  maionese10: "Mai. P",
  maionese15: "Mai. G",
  costela: "Costela",
};

/**
 * Catálogo de produtos agrupados por categoria
 * Usado para renderizar listas de seleção em Encomenda e Venda
 */
export const PRODUTOS = {
  frangos: [
    { chave: "frangosSemRecheio", titulo: "Frango S/R", icone: frangoIcon },
    { chave: "frangosComRecheio", titulo: "Frango C/R", icone: frangoIcon },
    { chave: "meioFrango", titulo: "Meio Frango", icone: frangoIcon },
  ],
  maioneses: [
    { chave: "maionese10", titulo: "Maionese P", icone: maioneseIcon },
    { chave: "maionese15", titulo: "Maionese G", icone: maioneseIcon },
  ],
  costela: [
    { chave: "costela", titulo: "Costela", icone: costelaIcon },
  ],
};

/**
 * Filtros de categoria para exibição no Dashboard
 */
export const FILTROS_CATEGORIA = [
  { key: "frangos", label: "Frangos", icone: frangoIcon },
  { key: "maioneses", label: "Maioneses", icone: maioneseIcon },
  { key: "costela", label: "Costela", icone: costelaIcon },
];
