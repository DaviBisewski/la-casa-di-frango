export function QuantidadeCounter({ value, onChange, max }) {
  return (
    <div className="flex items-center bg-[#0F4C3A] rounded-full overflow-hidden h-20">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="px-8 h-full text-white text-4xl font-light
                   hover:bg-[#0a3528] transition-colors active:scale-95 flex items-center"
      >
        −
      </button>

      <div className="w-16 h-16 rounded-full bg-[#D4F1E6] flex items-center justify-center mx-1 flex-shrink-0">
        <span className="text-[#0F4C3A] text-3xl font-bold">
          {value}
        </span>
      </div>

      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-8 h-full text-white text-4xl font-light
                   hover:bg-[#0a3528] transition-colors active:scale-95 flex items-center"
      >
        +
      </button>
    </div>
  );
}