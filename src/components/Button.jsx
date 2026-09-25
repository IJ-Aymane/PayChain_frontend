export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-ink text-white hover:bg-black disabled:bg-slate-300",
    secondary: "border border-slate-300 bg-white text-ink hover:bg-slate-50 disabled:text-slate-400",
    danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-200"
  };

  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
