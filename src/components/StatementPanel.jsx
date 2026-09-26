import { useCallback, useEffect, useMemo, useState } from "react";

import { getStatement } from "../api/index.js";
import { Button } from "./Button.jsx";
import { HistoryTable } from "./HistoryTable.jsx";
import { TextInput } from "./TextInput.jsx";

const EMPTY_HISTORY = { transactions: [], escrows: [] };

export function StatementPanel({ onReceipt, user }) {
  const [filters, setFilters] = useState({ from: "", to: "", type: "", status: "" });
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const history = useMemo(() => ({
    ...EMPTY_HISTORY,
    transactions: statement?.transactions ?? []
  }), [statement]);

  const loadStatement = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      setStatement(await getStatement(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatement({});
  }, [loadStatement]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadStatement(filters);
  }

  function clearFilters() {
    const empty = { from: "", to: "", type: "", status: "" };
    setFilters(empty);
    loadStatement(empty);
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">Account statement</p>
            <h2 className="mt-1 text-2xl font-black text-ink">PAY account movements</h2>
          </div>
          <Button disabled={loading} onClick={() => loadStatement(filters)} variant="secondary">
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]" onSubmit={handleSubmit}>
          <TextInput id="statement-from" label="From" onChange={(event) => updateFilter("from", event.target.value)} type="date" value={filters.from} />
          <TextInput id="statement-to" label="To" onChange={(event) => updateFilter("to", event.target.value)} type="date" value={filters.to} />
          <SelectInput id="statement-type" label="Type" onChange={(event) => updateFilter("type", event.target.value)} value={filters.type}>
            <option value="">All</option>
            <option value="FAUCET_CLAIM">Faucet</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ESCROW_DEPOSIT">Escrow deposit</option>
            <option value="ESCROW_RELEASE">Escrow release</option>
            <option value="ESCROW_REFUND">Escrow refund</option>
          </SelectInput>
          <SelectInput id="statement-status" label="Status" onChange={(event) => updateFilter("status", event.target.value)} value={filters.status}>
            <option value="">All</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="AWAITING_DELIVERY">Awaiting delivery</option>
            <option value="DISPUTED">Disputed</option>
          </SelectInput>
          <Button className="self-end" disabled={loading} type="submit">Apply</Button>
          <Button className="self-end" disabled={loading} onClick={clearFilters} type="button" variant="secondary">Clear</Button>
        </form>

        {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Transactions" value={statement?.summary?.count ?? 0} />
        <Metric label="Credits" value={`${formatAmount(statement?.summary?.payCredits ?? 0)} PAY`} />
        <Metric label="Debits" value={`${formatAmount(statement?.summary?.payDebits ?? 0)} PAY`} />
        <Metric label="Net" value={`${formatAmount(statement?.summary?.netPay ?? 0)} PAY`} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Statement lines</h2>
        <HistoryTable compact history={history} onReceipt={onReceipt} user={user} />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function SelectInput({ children, id, label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <select
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-ink outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        id={id}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

function formatAmount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(number);
}
