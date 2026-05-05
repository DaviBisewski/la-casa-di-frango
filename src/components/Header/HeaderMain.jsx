import logo from '../../assets/logos/logo.svg';
import { Link } from 'react-router-dom';

export function HeaderMain() {
  return (
    <header className="w-full bg-[#0F4C3A] py-15 px-10 shadow-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-center">
        
        {/* Container Centralizado: Logo e Nome da Marca */}
        <Link to="/">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Logo La Casa Di Frango" 
              className="w-28 h-28 object-contain"
            />
          </div>
          <h1 className="text-white text-5xl font-extrabold font-sans tracking-tight">
            La Casa Di Frango
          </h1>
        </div>
        </Link>

      </div>
    </header>
  );
}