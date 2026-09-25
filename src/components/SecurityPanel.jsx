import { useCallback, useEffect, useState } from "react";

import { changePassword, getSessions, logoutOtherSessions } from "../api/index.js";
import { Button } from "./Button.jsx";
import { TextInput } from "./TextInput.jsx";

export function SecurityPanel({ user }) {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const loadSessions = useCallback(async () => {
    setSessionLoading(true);

    try {
      const data = await getSessions();
      setSessions(data.sessions ?? []);
      setCurrentSessionId(data.currentSessionId);
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setStatus({ type: "success", text: "Password updated and other sessions revoked." });
      await loadSessions();
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoutOthers() {
    setSessionLoading(true);
    setStatus(null);

    try {
      await logoutOtherSessions();
      setStatus({ type: "success", text: "Other sessions revoked." });
      await loadSessions();
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setSessionLoading(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Account security</h2>
        <div className="mt-4 rounded-md border border-slate-200">
          <InfoRow label="Username" value={user?.username ?? "-"} />
          <InfoRow label="Email" value={user?.email ?? "-"} />
          <InfoRow label="User ID" value={user?.id ?? "-"} monospace />
          <InfoRow label="Wallet" value={user?.walletAddress ?? "-"} monospace />
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handlePasswordSubmit}>
          <TextInput
            autoComplete="current-password"
            id="current-password"
            label="Current password"
            onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
            required
            type="password"
            value={passwordForm.currentPassword}
          />
          <TextInput
            autoComplete="new-password"
            id="new-password"
            label="New password"
            onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
            required
            type="password"
            value={passwordForm.newPassword}
          />
          {status ? <Message status={status} /> : null}
          <Button disabled={loading} type="submit">{loading ? "Updating..." : "Change password"}</Button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-ink">Active sessions</h2>
          <div className="flex flex-wrap gap-2">
            <Button disabled={sessionLoading} onClick={loadSessions} variant="secondary">Refresh</Button>
            <Button disabled={sessionLoading} onClick={handleLogoutOthers} variant="danger">Logout others</Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Session</th>
                <th>IP</th>
                <th>Last seen</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="py-3">
                    <p className="font-semibold text-ink">{session.id === currentSessionId ? "Current session" : "Browser session"}</p>
                    <p className="max-w-[260px] truncate text-xs text-slate-500">{session.user_agent ?? "Unknown device"}</p>
                  </td>
                  <td>{session.ip_address ?? "-"}</td>
                  <td>{formatDate(session.last_seen_at)}</td>
                  <td>{formatDate(session.expires_at)}</td>
                  <td><SessionStatus session={session} /></td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr><td className="py-5 text-center text-slate-500" colSpan={5}>No sessions found</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value, monospace = false }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[120px_1fr]">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`break-words text-sm font-semibold text-ink ${monospace ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

function Message({ status }) {
  return (
    <p className={`rounded-md p-3 text-sm ${status.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
      {status.text}
    </p>
  );
}

function SessionStatus({ session }) {
  const revoked = Boolean(session.revoked_at);
  const expired = session.expires_at ? new Date(session.expires_at).getTime() < Date.now() : false;
  const text = revoked ? "Revoked" : expired ? "Expired" : "Active";
  const color = revoked || expired ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{text}</span>;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}
