import { useState } from "react";

import { disputeEscrow, releaseEscrow } from "../api/index.js";
import { Button } from "./Button.jsx";

const BASE_SEPOLIA_TX_URL = "https://sepolia.basescan.org/tx";

export function HistoryTable({ compact = false, history, onReceipt, user, onRefresh }) {
  const transactions = history?.transactions ?? [];
  const escrows = history?.escrows ?? [];

  if (compact) {
    return <TransactionTable compact onReceipt={onReceipt} transactions={transactions} user={user} />;
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Transaction history</h2>
        <TransactionTable onReceipt={onReceipt} transactions={transactions} user={user} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Escrows</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Role</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Escrow ID</th>
                <th>Deposit Tx</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {escrows.map((escrow) => (
                <EscrowRow key={escrow.id} escrow={escrow} onRefresh={onRefresh} user={user} />
              ))}
              {escrows.length === 0 ? <EmptyRow columns={6} text="No escrows yet" /> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TransactionTable({ compact = false, onReceipt, transactions, user }) {
  const showReceipt = typeof onReceipt === "function";
  const columns = showReceipt ? 6 : 5;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className={`w-full text-left text-sm ${compact ? "min-w-[760px]" : "min-w-[820px]"}`}>
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Tx Hash</th>
            {showReceipt ? <th>Receipt</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((item) => (
            <tr key={item.id}>
              <td className="py-3 font-medium text-ink">{displayType(item, user)}</td>
              <td>{item.amount} {item.asset}</td>
              <td>{formatDate(item.created_at)}</td>
              <td><Status value={normalizeStatus(item.status)} /></td>
              <td className="max-w-[240px] truncate font-mono text-xs">
                {isSandboxTransaction(item) ? (
                  <span className="font-sans text-slate-500">Sandbox ref</span>
                ) : item.tx_hash ? (
                  <a
                    className="text-grape underline-offset-2 hover:underline"
                    href={`${BASE_SEPOLIA_TX_URL}/${item.tx_hash}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {shortHash(item.tx_hash)}
                  </a>
                ) : item.error ? (
                  <span className="text-rose-700">{item.error}</span>
                ) : "-"}
              </td>
              {showReceipt ? (
                <td>
                  <Button onClick={() => onReceipt(item.id)} type="button" variant="secondary">Receipt</Button>
                </td>
              ) : null}
            </tr>
          ))}
          {transactions.length === 0 ? <EmptyRow columns={columns} text="No transactions yet" /> : null}
        </tbody>
      </table>
    </div>
  );
}

function EscrowRow({ escrow, user, onRefresh }) {
  const [busyAction, setBusyAction] = useState(null);
  const [error, setError] = useState(null);
  const isBuyer = escrow.buyer_user_id === user?.id;
  const canRelease = isBuyer && escrow.status === "AWAITING_DELIVERY";
  const canDispute = escrow.status === "AWAITING_DELIVERY";

  async function runAction(name, action) {
    setBusyAction(name);
    setError(null);

    try {
      await action(escrow.id);
      await onRefresh?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <tr>
        <td className="py-3 font-medium text-ink">{isBuyer ? "Buyer" : "Seller"}</td>
        <td>{escrow.amount} {escrow.asset}</td>
        <td><Status value={normalizeStatus(escrow.status)} /></td>
        <td className="max-w-[150px] truncate font-mono text-xs">{escrow.onchain_escrow_id ?? "-"}</td>
        <td className="max-w-[180px] truncate font-mono text-xs">
          {isSandboxEscrow(escrow) ? (
            <span className="font-sans text-slate-500">Sandbox ref</span>
          ) : escrow.deposit_tx_hash ? (
            <a
              className="text-grape underline-offset-2 hover:underline"
              href={`${BASE_SEPOLIA_TX_URL}/${escrow.deposit_tx_hash}`}
              rel="noreferrer"
              target="_blank"
            >
              {shortHash(escrow.deposit_tx_hash)}
            </a>
          ) : escrow.error ?? "-"}
        </td>
        <td>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!canRelease || Boolean(busyAction)} onClick={() => runAction("release", releaseEscrow)} variant="secondary">
              {busyAction === "release" ? "..." : "Release"}
            </Button>
            <Button disabled={!canDispute || Boolean(busyAction)} onClick={() => runAction("dispute", disputeEscrow)} variant="secondary">
              {busyAction === "dispute" ? "..." : "Dispute"}
            </Button>
          </div>
        </td>
      </tr>
      {error ? (
        <tr>
          <td className="pb-3 text-sm text-rose-700" colSpan={6}>{error}</td>
        </tr>
      ) : null}
    </>
  );
}

function isSandboxTransaction(item) {
  return parseMetadata(item.metadata_json).mode === "demo" || String(item.tx_hash ?? "").startsWith("demo-");
}

function isSandboxEscrow(escrow) {
  return String(escrow.onchain_escrow_id ?? "").startsWith("demo-");
}

function parseMetadata(value) {
  if (!value) {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function displayType(item, user) {
  if (item.type === "TRANSFER") {
    return item.from_user_id === user?.id ? "TRANSFER_SENT" : "TRANSFER_RECEIVED";
  }

  return item.type;
}

function normalizeStatus(status) {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "SUCCESS";
  }

  return status;
}

function Status({ value }) {
  const color = value === "SUCCESS" || value === "AWAITING_DELIVERY"
    ? "bg-emerald-50 text-emerald-700"
    : value === "FAILED"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{value}</span>;
}

function EmptyRow({ columns, text }) {
  return (
    <tr>
      <td className="py-5 text-center text-slate-500" colSpan={columns}>{text}</td>
    </tr>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function shortHash(value) {
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}
