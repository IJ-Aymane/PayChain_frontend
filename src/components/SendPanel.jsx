import { useState } from "react";

import { transferPayTokens } from "../api/index.js";
import { Button } from "./Button.jsx";
import { TextInput } from "./TextInput.jsx";

export function SendPanel({ onDone }) {
  const [form, setForm] = useState({ recipient: "", amount: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const result = await transferPayTokens(form);
      setStatus({ type: "success", text: `PAY transfer sent. Reference: ${result.transaction.tx_hash}` });
      setForm({ recipient: "", amount: "" });
      await onDone?.();
    } catch (error) {
      setStatus({ type: "error", text: error.message });
      await onDone?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Send PAY Tokens</h2>
      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <TextInput
          id="recipient"
          label="Recipient ID, username or email"
          onChange={(event) => setForm({ ...form, recipient: event.target.value })}
          placeholder="username or email"
          required
          value={form.recipient}
        />
        <TextInput
          id="send-amount"
          inputMode="decimal"
          label="Amount of PAY"
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          placeholder="25"
          required
          value={form.amount}
        />
        {status ? <Message status={status} /> : null}
        <Button disabled={loading} type="submit">
          {loading ? "Sending PAY..." : "Send PAY Tokens"}
        </Button>
      </form>
    </section>
  );
}

function Message({ status }) {
  return (
    <p className={`rounded-md p-3 text-sm ${status.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
      {status.text}
    </p>
  );
}
