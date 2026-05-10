import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logos/logo.svg';
import gearIcon from '../../assets/icons/config.svg';

/**
 * Header principal usado na tela Home
 * Logo + nome da marca à esquerda
 * Ícone de configurações à direita — navega para /config
 */
const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#0F4C3A] py-5 sm:py-15 px-4 sm:px-10 shadow-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">

        {/* Lado Esquerdo: Logo e Nome da Marca — clica para ir à home */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 sm:gap-6 hover:opacity-80 transition-opacity min-w-0"
        >
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Logo La Casa Di Frango"
              className="w-14 h-14 sm:w-28 sm:h-28 object-contain"
            />
          </div>

          <h1 className="text-white text-1xl sm:text-4xl font-extrabold truncate">
            La Casa Di Frango
          </h1>
        </button>

        {/* Lado Direito: Ícone de Configurações — navega para /config */}
        <button
          onClick={() => navigate("/config")}
          className="p-2 sm:p-4 rounded-full hover:bg-white/10
                     active:scale-95 transition-all flex-shrink-0"
          aria-label="Configurações"
        >
          <img
            src={gearIcon}
            alt="Configurações"
            className="w-8 h-8 sm:w-20 sm:h-20 brightness-0 invert"
          />
        </button>

      </div>
    </header>
  );
};

export default Header;