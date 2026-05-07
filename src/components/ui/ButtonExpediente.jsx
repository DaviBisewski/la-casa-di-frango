import plusIcon from '../../assets/icons/plus.svg';

const StartShift = ({ onStart }) => {
  return (
    <section className="px-12 mt-20 w-full max-w-[1400px] mx-auto">

      <h2 className="text-[#0F4C3A] text-4xl font-bold mb-10 tracking-tight uppercase">
        INICIAR NOVO EXPEDIENTE?
      </h2>

      <button 
        onClick={onStart}
        className="w-full bg-[#0F4C3A] hover:bg-[#0a3528] active:scale-[0.98] transition-all 
                   rounded-[20px] py-20 flex items-center justify-center gap-20 shadow-lg group mt-20"
      >
        <div className="flex items-center justify-center w-24 h-24 bg-black/20 rounded-full">
          <img 
            src={plusIcon} 
            alt="Ícone de mais" 
            className="w-12 h-12 brightness-0 invert" 
          />
        </div>

        <span className="text-white text-5xl font-medium tracking-tight">
          Começar expediente
        </span>
      </button>
    </section>
  );
};

export default StartShift;