import { useCallback, useEffect, useMemo, useState } from "react";

import { claimFaucet, clearToken, getBalance, getHistory, getReceipt, logout } from "../api/index.js";
import { AdminPanel } from "../components/AdminPanel.jsx";
import { BalanceCard } from "../components/BalanceCard.jsx";
import { BankHeader } from "../components/BankHeader.jsx";
import { BankSidebar } from "../components/BankSidebar.jsx";
import { Button } from "../components/Button.jsx";
import { EscrowPanel } from "../components/EscrowPanel.jsx";
import { HistoryTable } from "../components/HistoryTable.jsx";
import { LocalChainPanel } from "../components/LocalChainPanel.jsx";
import { ReceiptModal } from "../components/ReceiptModal.jsx";
import { SecurityPanel } from "../components/SecurityPanel.jsx";
import { SendPanel } from "../components/SendPanel.jsx";
import { StatementPanel } from "../components/StatementPanel.jsx";
import { WalletCard } from "../components/WalletCard.jsx";

const VIEW_LABELS = {
  overview: "Overview",
  send: "Send PAY",
  escrow: "Escrow",
  statement: "Statement",
  history: "History",
  localChain: "Local Chain",
  wallet: "Wallet",
  security: "Security",
  admin: "Admin"
};

export function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState({ transactions: [], escrows: [] });
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null);
  const [error, setError] = useState(null);

  const recentTransactions = useMemo(() => ({
    transactions: history.transactions.slice(0, 5),
    escrows: []
  }), [history.transactions]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [balanceData, historyData] = await Promise.all([getBalance(), getHistory()]);
      setBalance(balanceData);
      setHistory(historyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleClaimFaucet() {
    setClaimLoading(true);
    setClaimStatus(null);
    setError(null);

    try {
      const result = await claimFaucet();
      if (result.balance) {
        setBalance(result.balance);
      }
      await refresh();
      setClaimStatus({ type: "success", text: "100 demo PAY claimed successfully." });
    } catch (err) {
      setClaimStatus({ type: "error", text: err.message });
      await refresh().catch(() => {});
    } finally {
      setClaimLoading(false);
    }
  }

  async function handleOpenReceipt(transactionId) {
    setReceiptLoading(true);
    setError(null);

    try {
      const data = await getReceipt(transactionId);
      setReceipt(data.receipt);
    } catch (err) {
      setError(err.message);
    } finally {
      setReceiptLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Local logout still clears the stale browser token if the API is unreachable.
    } finally {
      clearToken();
      onLogout();
    }
  }

  function openView(view) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-ink">
      <div className="lg:flex lg:min-h-screen">
        <BankSidebar
          activeView={activeView}
          balance={balance}
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onLogout={handleLogout}
          onNavigate={openView}
          user={user}
        />

        <section className="min-w-0 flex-1">
          <BankHeader
            activeLabel={VIEW_LABELS[activeView]}
            balance={balance}
            onMenuClick={() => setMobileMenuOpen(true)}
            user={user}
          />

          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
            {error ? <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p> : null}
            {receiptLoading ? <ReceiptLoading /> : null}
            {renderView({
              activeView,
              balance,
              claimLoading,
              claimStatus,
              history,
              loading,
              onClaim: handleClaimFaucet,
              onReceipt: handleOpenReceipt,
              onRefresh: refresh,
              onView: openView,
              recentTransactions,
              user
            })}
          </div>
        </section>
      </div>
      <ReceiptModal onClose={() => setReceipt(null)} receipt={receipt} />
    </main>
  );
}

function renderView(props) {
  switch (props.activeView) {
    case "send":
      return <SendView onDone={props.onRefresh} />;
    case "escrow":
      return <EscrowView onDone={props.onRefresh} />;
    case "statement":
      return <StatementPanel onReceipt={props.onReceipt} user={props.user} />;
    case "history":
      return <HistoryTable history={props.history} onReceipt={props.onReceipt} onRefresh={props.onRefresh} user={props.user} />;
    case "localChain":
      return <LocalChainPanel />;
    case "wallet":
      return <WalletView balance={props.balance} user={props.user} />;
    case "security":
      return <SecurityPanel user={props.user} />;
    case "admin":
      return <AdminPanel currentUser={props.user} />;
    default:
      return <OverviewView {...props} />;
  }
}

function OverviewView({ balance, claimLoading, claimStatus, loading, onClaim, onReceipt, onRefresh, onView, recentTransactions, user }) {
  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <BalanceCard
          balance={balance}
          claimLoading={claimLoading}
          claimStatus={claimStatus}
          loading={loading}
          onClaim={onClaim}
          onRefresh={onRefresh}
        />
        <AccountPanel balance={balance} user={user} />
      </section>

      <QuickActions onView={onView} />

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <SendPanel onDone={onRefresh} />
        <EscrowPanel onDone={onRefresh} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-ink">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-500">Latest account movements</p>
          </div>
          <Button onClick={() => onView("history")} variant="secondary">View all</Button>
        </div>
        <HistoryTable compact history={recentTransactions} onReceipt={onReceipt} onRefresh={onRefresh} user={user} />
      </section>
    </>
  );
}

function SendView({ onDone }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <SendPanel onDone={onDone} />
      <BankInfoPanel
        rows={[
          ["Recipient", "ID / Username / Email"],
          ["Asset", "PAY demo token"],
          ["Execution", "Backend session protected"],
          ["Money risk", "No real funds in demo mode"]
        ]}
        title="Transfer details"
      />
    </section>
  );
}

function EscrowView({ onDone }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <EscrowPanel onDone={onDone} />
      <BankInfoPanel
        rows={[
          ["Buyer", "Demo ETH is held internally"],
          ["Seller", "Receives funds after release"],
          ["Refund", "Returns the hold after dispute"],
          ["Mode", "MySQL ledger only"]
        ]}
        title="Escrow controls"
      />
    </section>
  );
}

function WalletView({ balance, user }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <WalletCard user={user} />
      <BankInfoPanel
        rows={[
          ["Network", balance?.mode === "demo" ? "Demo ledger" : "Base Sepolia"],
          ["ETH", `${formatAmount(balance?.eth?.balance ?? "0")} ETH`],
          ["PAY", `${formatAmount(balance?.token?.balance ?? "0")} ${balance?.token?.symbol ?? "PAY"}`],
          ["Private key", "Encrypted and never shown in the UI"]
        ]}
        title="Account balances"
      />
    </section>
  );
}

function AccountPanel({ balance, user }) {
  const mode = balance?.mode === "blockchain" ? "Live" : "Demo";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">Primary account</p>
          <h2 className="mt-1 text-2xl font-black text-ink">{user?.username}</h2>
        </div>
        <span className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide ${mode === "Demo" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          {mode}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniMetric label="PAY" value={`${formatAmount(balance?.token?.balance ?? "0")} ${balance?.token?.symbol ?? "PAY"}`} />
        <MiniMetric label="ETH" value={`${formatAmount(balance?.eth?.balance ?? "0")} ETH`} />
      </div>
      <div className="mt-4 rounded-md bg-slate-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Wallet</p>
        <p className="mt-1 break-all font-mono text-xs text-ink">{user?.walletAddress}</p>
      </div>
    </section>
  );
}

function QuickActions({ onView }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <QuickAction label="Send PAY" onClick={() => onView("send")} tone="emerald" />
      <QuickAction label="Open Escrow" onClick={() => onView("escrow")} tone="amber" />
      <QuickAction label="Statement" onClick={() => onView("statement")} tone="cyan" />
      <QuickAction label="Local Chain" onClick={() => onView("localChain")} tone="slate" />
    </section>
  );
}

function QuickAction({ label, onClick, tone }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    amber: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
    slate: "border-slate-200 bg-white text-ink hover:bg-slate-50"
  };

  return (
    <button className={`h-16 rounded-lg border px-4 text-left text-sm font-black shadow-sm transition ${tones[tone]}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

function BankInfoPanel({ rows, title }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200">
        {rows.map(([label, value]) => (
          <div className="grid gap-1 p-4 sm:grid-cols-[150px_1fr]" key={label}>
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="break-words text-sm font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function ReceiptLoading() {
  return <p className="rounded-md border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600 shadow-sm">Loading receipt...</p>;
}

function formatAmount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(number);
}
