import searchIcon from '../../assets/icons/search.svg';

/**
 * Campo de busca grande para uso em tablet
 * Filtra encomendas por nome ou telefone em tempo real
 */
export function BuscaEncomenda({ valor, onChange }) {
  return (
    <div className="relative w-full mb-20">
      <img
        src={searchIcon}
        alt="Buscar"
        className="absolute left-9 top-1/2 -translate-y-1/2 w-12 h-12 opacity-40"
      />
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome ou telefone..."
        className="w-full bg-[#D4F1E6] text-[#0F4C3A] text-3xl
                   pl-24 pr-10 py-9 rounded-3xl
                   placeholder:text-[#0F4C3A]/40
                   border-2 border-transparent
                   focus:border-[#0F4C3A]/20 outline-none
                   transition-all duration-200"
      />
    </div>
  );
}