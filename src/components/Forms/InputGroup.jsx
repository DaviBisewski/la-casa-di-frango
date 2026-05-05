export function InputGroup({ label, name, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <label className="text-[#1e392a] font-semibold text-sm">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#d9dbd2] border-none rounded-lg p-4 text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-[#1e392a] outline-none transition-all"
        type="number"
      />
    </div>
  );
}