import plusIcon from '../../assets/icons/plus.svg';

const StartShift = ({ onStart }) => {
  return (
    <section className="px-4 sm:px-6 md:px-12 mt-10 md:mt-20 w-full max-w-[1400px] mx-auto">

      <h2 className="text-[#0F4C3A]
                     text-2xl sm:text-3xl md:text-4xl
                     font-bold mb-6 md:mb-10 tracking-tight uppercase">
        INICIAR NOVO EXPEDIENTE?
      </h2>

      <button 
        onClick={onStart}
        className="w-full bg-[#0F4C3A] hover:bg-[#0a3528] active:scale-[0.98] transition-all 
                   rounded-[20px]
                   py-10 sm:py-14 md:py-20
                   flex items-center justify-center
                   gap-5 sm:gap-8 md:gap-20
                   shadow-lg group mt-8 md:mt-20"
      >
        <div className="flex items-center justify-center
                        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                        bg-black/20 rounded-full">
          <img 
            src={plusIcon} 
            alt="Ícone de mais" 
            className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 brightness-0 invert" 
          />
        </div>

        <span className="text-white
                         text-2xl sm:text-1xl md:text-5xl
                         font-medium tracking-tight text-center">
          Começar expediente
        </span>
      </button>
    </section>
  );
};

export default StartShift;