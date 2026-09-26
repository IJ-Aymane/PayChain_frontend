export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-ink text-white shadow-sm hover:bg-slate-950 disabled:bg-slate-300",
    secondary: "border border-slate-300 bg-white text-ink shadow-sm hover:border-slate-400 hover:bg-slate-50 disabled:text-slate-400",
    danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-200"
  };

  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
