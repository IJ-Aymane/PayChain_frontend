import { useCallback, useEffect, useState } from "react";

import {
  getAdminEscrows,
  getAdminSummary,
  getAdminTransactions,
  getAdminUsers,
  refundEscrow,
  resetUserSandboxBalance,
  setUserSandboxBalance,
  suspendAdminUser,
  unsuspendAdminUser
} from "../api/index.js";
import { Button } from "./Button.jsx";
import { TextInput } from "./TextInput.jsx";

export function AdminPanel({ currentUser }) {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [search, setSearch] = useState("");
  const [amountByUser, setAmountByUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [message, setMessage] = useState(null);

  const loadAdminData = useCallback(async (query = "") => {
    setLoading(true);
    setMessage(null);

    try {
      const [summaryData, userData, transactionData, escrowData] = await Promise.all([
        getAdminSummary(),
        getAdminUsers({ search: query }),
        getAdminTransactions({ limit: 50 }),
        getAdminEscrows({ limit: 50 })
      ]);
      setSummary(summaryData);
      setUsers(userData.users ?? []);
      setTransactions(transactionData.transactions ?? []);
      setEscrows(escrowData.escrows ?? []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData("");
  }, [loadAdminData]);

  async function runAction(label, action) {
    setBusyAction(label);
    setMessage(null);

    try {
      await action();
      setMessage({ type: "success", text: "Admin action completed." });
      await loadAdminData(search);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusyAction(null);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadAdminData(search);
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">Sandbox administration</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Operations console</h2>
          </div>
          <Button disabled={loading} onClick={() => loadAdminData(search)} variant="secondary">
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {message ? <Message status={message} /> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Users" value={summary?.users ?? 0} />
          <Metric label="Transactions" value={summary?.transactions?.total ?? 0} />
          <Metric label="PAY in ledger" value={`${formatAmount(summary?.ledgerTotals?.pay ?? 0)} PAY`} />
          <Metric label="ETH in ledger" value={`${formatAmount(summary?.ledgerTotals?.eth ?? 0)} ETH`} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-black text-ink">Users and balances</h2>
          <form className="flex w-full gap-2 sm:w-auto" onSubmit={handleSearch}>
            <TextInput
              className="min-w-0 flex-1 sm:w-72"
              id="admin-search"
              label="Search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="username or email"
              value={search}
            />
            <Button className="self-end" disabled={loading} type="submit">Find</Button>
          </form>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">User</th>
                <th>PAY</th>
                <th>ETH</th>
                <th>Sessions</th>
                <th>Lock</th>
                <th>Set PAY</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const locked = isLocked(user.lockedUntil);
                const userAmount = amountByUser[user.id] ?? "";

                return (
                  <tr key={user.id}>
                    <td className="py-3">
                      <p className="font-semibold text-ink">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <p className="max-w-[250px] truncate font-mono text-[11px] text-slate-400">{user.walletAddress}</p>
                    </td>
                    <td className="font-semibold text-ink">{formatAmount(user.balances?.pay ?? 0)} PAY</td>
                    <td>{formatAmount(user.balances?.eth ?? 0)} ETH</td>
                    <td>{user.activeSessions ?? 0}</td>
                    <td><LockStatus locked={locked} /></td>
                    <td>
                      <div className="flex gap-2">
                        <input
                          className="h-10 w-24 rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          inputMode="decimal"
                          onChange={(event) => setAmountByUser({ ...amountByUser, [user.id]: event.target.value })}
                          placeholder="100"
                          value={userAmount}
                        />
                        <Button
                          disabled={Boolean(busyAction)}
                          onClick={() => runAction(`set-${user.id}`, () => setUserSandboxBalance(user.id, userAmount || "0"))}
                          type="button"
                          variant="secondary"
                        >
                          Set
                        </Button>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button disabled={Boolean(busyAction)} onClick={() => runAction(`reset-${user.id}`, () => resetUserSandboxBalance(user.id))} type="button" variant="secondary">Reset</Button>
                        {locked ? (
                          <Button disabled={Boolean(busyAction)} onClick={() => runAction(`unlock-${user.id}`, () => unsuspendAdminUser(user.id))} type="button" variant="secondary">Unsuspend</Button>
                        ) : (
                          <Button disabled={Boolean(busyAction) || isSelf} onClick={() => runAction(`lock-${user.id}`, () => suspendAdminUser(user.id))} type="button" variant="danger">Suspend</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 ? <tr><td className="py-5 text-center text-slate-500" colSpan={7}>No users found</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Escrow control</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Buyer</th>
                <th>Seller</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Escrow ID</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {escrows.map((escrow) => {
                const canRefund = escrow.status === "DISPUTED";

                return (
                  <tr key={escrow.id}>
                    <td className="py-3 font-semibold text-ink">{escrow.buyer_username ?? escrow.buyer_email ?? escrow.buyer_user_id}</td>
                    <td>{escrow.seller_username ?? escrow.seller_email ?? escrow.seller_user_id}</td>
                    <td>{escrow.amount} {escrow.asset}</td>
                    <td><Status value={escrow.status} /></td>
                    <td className="max-w-[180px] truncate font-mono text-xs">{escrow.onchain_escrow_id ?? escrow.id}</td>
                    <td>{formatDate(escrow.created_at)}</td>
                    <td>
                      <Button
                        disabled={!canRefund || Boolean(busyAction)}
                        onClick={() => runAction(`refund-${escrow.id}`, () => refundEscrow(escrow.id))}
                        type="button"
                        variant="danger"
                      >
                        {busyAction === `refund-${escrow.id}` ? "Refunding..." : "Refund"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {escrows.length === 0 ? <tr><td className="py-5 text-center text-slate-500" colSpan={7}>No escrows found</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Recent platform transactions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Type</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-semibold text-ink">{item.type}</td>
                  <td>{item.amount} {item.asset}</td>
                  <td>{item.from_username ?? item.from_email ?? "Treasury"}</td>
                  <td>{item.to_username ?? item.to_email ?? "Treasury"}</td>
                  <td><Status value={item.status} /></td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
              {transactions.length === 0 ? <tr><td className="py-5 text-center text-slate-500" colSpan={6}>No transactions found</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xl font-black text-ink">{value}</p>
    </div>
  );
}

function Message({ status }) {
  const adminHint = status.type === "error" && status.text.includes("ADMIN_IDENTIFIERS");

  return (
    <p className={`mt-4 rounded-md p-3 text-sm ${status.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
      {status.text}
      {adminHint ? " Set your username, email, or user id in the backend .env and restart the server." : ""}
    </p>
  );
}

function Status({ value }) {
  const normalized = value === "CONFIRMED" || value === "COMPLETED" ? "SUCCESS" : value;
  const color = normalized === "SUCCESS" || normalized === "AWAITING_DELIVERY"
    ? "bg-emerald-50 text-emerald-700"
    : normalized === "FAILED"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{normalized}</span>;
}

function LockStatus({ locked }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${locked ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{locked ? "Locked" : "Active"}</span>;
}

function isLocked(value) {
  return value ? new Date(value).getTime() > Date.now() : false;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function formatAmount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(number);
}
