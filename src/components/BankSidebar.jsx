const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: OverviewIcon },
  { id: "send", label: "Send", icon: SendIcon },
  { id: "escrow", label: "Escrow", icon: ShieldIcon },
  { id: "statement", label: "Statement", icon: StatementIcon },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "localChain", label: "Local Chain", icon: ChainIcon },
  { id: "wallet", label: "Wallet", icon: WalletIcon },
  { id: "security", label: "Security", icon: LockIcon },
  { id: "admin", label: "Admin", icon: AdminIcon }
];

export function BankSidebar({ activeView, balance, mobileOpen, onClose, onLogout, onNavigate, user }) {
  const tokenBalance = balance?.token?.balance ?? "0";
  const symbol = balance?.token?.symbol ?? "PAY";

  return (
    <>
      {mobileOpen ? <button aria-label="Close menu" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} type="button" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[292px] transform flex-col border-r border-slate-200 bg-white transition lg:static lg:z-auto lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-ink text-sm font-black text-white">PC</div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-ink">PayChain</p>
                <p className="text-xs font-medium text-slate-500">Sandbox Banking Console</p>
              </div>
            </div>
            <button aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 lg:hidden" onClick={onClose} type="button">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Available balance</p>
            <p className="mt-2 text-2xl font-black text-ink">{formatAmount(tokenBalance)} {symbol}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{balance?.mode === "blockchain" ? "Base Sepolia" : "Sandbox ledger"}</p>
          </div>
        </div>

        <nav className="grid gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;

            return (
              <button
                className={`flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-bold transition ${active ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"}`}
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                type="button"
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 p-5">
          <div className="mb-4 min-w-0">
            <p className="truncate text-sm font-black text-ink">{user?.username}</p>
            <p className="truncate text-xs font-medium text-slate-500">{user?.email}</p>
          </div>
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white text-sm font-bold text-ink transition hover:bg-slate-50" onClick={onLogout} type="button">
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function formatAmount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(number);
}

function IconBase({ children }) {
  return <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">{children}</svg>;
}

function OverviewIcon() {
  return <IconBase><path d="M4 13h6V4H4v9Z" /><path d="M14 20h6V4h-6v16Z" /><path d="M4 20h6v-3H4v3Z" /></IconBase>;
}

function SendIcon() {
  return <IconBase><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></IconBase>;
}

function ShieldIcon() {
  return <IconBase><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></IconBase>;
}

function StatementIcon() {
  return <IconBase><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v5h5" /><path d="M10 12h6" /><path d="M10 16h6" /></IconBase>;
}

function HistoryIcon() {
  return <IconBase><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v6h6" /><path d="M12 7v5l3 2" /></IconBase>;
}

function ChainIcon() {
  return <IconBase><path d="M6 7h12" /><path d="M6 12h12" /><path d="M6 17h12" /><path d="M4 7h.01" /><path d="M4 12h.01" /><path d="M4 17h.01" /></IconBase>;
}

function WalletIcon() {
  return <IconBase><path d="M4 7h16v13H4z" /><path d="M4 7V5h14" /><path d="M16 14h4" /></IconBase>;
}

function LockIcon() {
  return <IconBase><rect height="10" rx="2" width="16" x="4" y="11" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></IconBase>;
}

function AdminIcon() {
  return <IconBase><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4 21a8 8 0 0 1 16 0" /><path d="m16 11 2 2 4-4" /></IconBase>;
}

function LogoutIcon() {
  return <IconBase><path d="M10 17 15 12 10 7" /><path d="M15 12H3" /><path d="M21 19V5" /></IconBase>;
}

function CloseIcon() {
  return <IconBase><path d="m6 6 12 12" /><path d="m18 6-12 12" /></IconBase>;
}
