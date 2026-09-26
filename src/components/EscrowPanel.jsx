import { useState } from "react";

import { createEscrow } from "../api/index.js";
import { Button } from "./Button.jsx";
import { TextInput } from "./TextInput.jsx";

export function EscrowPanel({ onDone }) {
  const [form, setForm] = useState({ seller: "", amount: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const result = await createEscrow({ ...form, asset: "ETH" });
      setStatus({ type: "success", text: `Escrow created. Reference: ${result.escrow.deposit_tx_hash}` });
      setForm({ seller: "", amount: "" });
      await onDone?.();
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Open escrow</h2>
      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <TextInput
          id="seller"
          label="Seller ID, username or email"
          onChange={(event) => setForm({ ...form, seller: event.target.value })}
          placeholder="seller username or email"
          required
          value={form.seller}
        />
        <TextInput
          id="escrow-amount"
          inputMode="decimal"
          label="ETH amount"
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          placeholder="0.1"
          required
          value={form.amount}
        />
        {status ? <Message status={status} /> : null}
        <Button disabled={loading} type="submit">{loading ? "Creating escrow..." : "Create escrow"}</Button>
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
