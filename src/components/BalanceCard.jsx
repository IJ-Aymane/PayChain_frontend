import { Button } from "./Button.jsx";

export function BalanceCard({ balance, claimLoading, claimStatus, loading, onClaim, onRefresh }) {
  const eth = balance?.eth?.balance ?? "0";
  const token = balance?.token?.balance ?? "0";
  const symbol = balance?.token?.symbol ?? "PAY";
  const isSandbox = balance?.mode === "demo";
  const subtitle = isSandbox ? "Sandbox ledger balance" : "Base Sepolia balance";
  const claimMessage = isSandbox ? "Adding 100 PAY to your account..." : "Claiming 100 PAY on Base Sepolia...";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">Main balance</p>
          <h2 className="mt-1 text-4xl font-black text-ink">{formatAmount(token)} {symbol}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={loading || claimLoading} onClick={onRefresh} variant="secondary">
            Refresh
          </Button>
          <Button disabled={claimLoading} onClick={onClaim}>
            {claimLoading ? "Adding 100 PAY..." : "Add 100 PAY"}
          </Button>
        </div>
      </div>
      {claimLoading ? (
        <p className="mt-4 rounded-md bg-cyan/10 p-3 text-sm font-medium text-ink">
          {claimMessage}
        </p>
      ) : null}
      {claimStatus ? <Message status={claimStatus} /> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="PAY token" value={`${formatAmount(token)} ${symbol}`} />
        <Metric label="ETH gas wallet" value={`${formatAmount(eth)} ETH`} />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function Message({ status }) {
  return (
    <p className={`mt-4 rounded-md p-3 text-sm ${status.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
      {status.text}
    </p>
  );
}

function formatAmount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(number);
}
