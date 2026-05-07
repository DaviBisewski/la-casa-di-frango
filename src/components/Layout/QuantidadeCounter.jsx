export function QuantidadeCounter({ value, onChange, max }) {
  return (
    <div className="flex items-center gap-0 bg-[#0F4C3A] rounded-full overflow-hidden">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-14 h-14 text-white text-3xl font-bold flex items-center 
                   justify-center hover:bg-[#0a3528] transition-colors active:scale-95"
      >
        −
      </button>
      <span className="text-white text-2xl font-bold w-12 text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-14 h-14 text-white text-3xl font-bold flex items-center 
                   justify-center hover:bg-[#0a3528] transition-colors active:scale-95"
      >
        +
      </button>
    </div>
  );
}