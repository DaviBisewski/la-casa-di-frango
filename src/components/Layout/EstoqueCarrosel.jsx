import { EstoqueCard } from "../Cards/EstoqueCard";

export function EstoqueCarrossel({ items, expediente }) {
  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory
                      scroll-smooth scrollbar-hide -mr-12 pr-12">
        {items.map((item) => (
          <div key={item.chave} className="snap-start flex-shrink-0">
            <EstoqueCard
              titulo={item.titulo}
              icone={item.icone}
              expediente={expediente}
              chave={item.chave}
            />
          </div>
        ))}
      </div>
    </>
  );
}