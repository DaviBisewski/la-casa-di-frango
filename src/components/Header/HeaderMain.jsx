import logo from '../../assets/logos/logo.svg';

export function HeaderMain() {
  return (
    <header className="w-full bg-[#0F4C3A] py-4 flex justify-center items-center">
      <img
        src={logo}
        alt="La Casa Di Frango"
        className="h-12 w-auto"
      />
    </header>
  );
}