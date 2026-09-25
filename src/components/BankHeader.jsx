export function BankHeader({ activeLabel, balance, onMenuClick, user }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button aria-label="Open menu" className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-ink shadow-sm lg:hidden" onClick={onMenuClick} type="button">
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{activeLabel}</p>
            <h1 className="truncate text-xl font-black text-ink sm:text-2xl">Good day, {user?.username}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <span className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide ${balance?.mode === "demo" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
            {balance?.mode === "demo" ? "Demo Mode" : "Base Sepolia"}
          </span>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
            <p className="text-xs font-bold text-slate-500">User ID</p>
            <p className="max-w-[180px] truncate font-mono text-xs text-ink">{user?.id}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}
