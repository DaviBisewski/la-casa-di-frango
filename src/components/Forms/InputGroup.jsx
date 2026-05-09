export function InputGroup({ label, name, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-15 w-full">
      <label className="text-[#0F4C3A] text-2xl sm:text-4xl font-semibold">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type="number"
        className="w-full bg-[#D4F1E6] text-[#0F4C3A] text-xl sm:text-3xl p-5 sm:p-10 rounded-2xl 
                   placeholder:text-[#0F4C3A]/40 border-2 border-transparent 
                   focus:border-[#0F4C3A]/20 outline-none transition-all shadow-inner"
      />
    </div>
  );
}