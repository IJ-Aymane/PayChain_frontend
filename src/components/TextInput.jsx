export function TextInput({ label, id, className = "", inputClassName = "", ...props }) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-slate-700 ${className}`} htmlFor={id}>
      {label}
      <input
        id={id}
        className={`h-11 rounded-md border border-slate-300 bg-white px-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500 ${inputClassName}`}
        {...props}
      />
    </label>
  );
}
