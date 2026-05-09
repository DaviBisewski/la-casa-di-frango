import { EstoqueCard } from "../Cards/EstoqueCard";

export function EstoqueCarrossel({ items, expediente }) {
  return (
    <>
      <div className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-6 snap-x snap-mandatory
                      scroll-smooth scrollbar-hide -mr-4 sm:-mr-12 pr-4 sm:pr-12">
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