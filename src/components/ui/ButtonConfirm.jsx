export function ButtonConfirm({ onClick, children = "Confirmar" }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-[#0F4C3A] text-white
                 text-2xl sm:text-3xl md:text-4xl font-bold
                 py-5 sm:py-7 md:py-13 rounded-2xl 
                 hover:bg-[#0a3528]
                 active:scale-[0.99] transition-all shadow-xl font-sans"
    >
      {children}
    </button>
  );
}