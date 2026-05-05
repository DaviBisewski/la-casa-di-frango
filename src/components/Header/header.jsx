import logo from '../../assets/logos/logo.svg';
import gearIcon from '../../assets/icons/config.svg';

const Header = () => {
  return (
    <header className="w-full bg-[#0F4C3A] py-15 px-10 shadow-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo e Nome da Marca */}
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Logo La Casa Di Frango" 
              className="w-28 h-28 object-contain"
            />
          </div>
          <h1 className="text-white text-5xl font-extrabold">
            La Casa Di Frango
          </h1>
        </div>

        {/* Lado Direito: Ícone de Configurações */}
        <button 
          className="p-4" 
          aria-label="Configurações"
        >
          <img 
            src={gearIcon} 
            alt="Configurações" 
            className="w-20 h-20 brightness-0 invert" 
          />
        </button>

      </div>
    </header>
  );
};

export default Header;