import { useState } from "react";

import { login } from "../api/index.js";
import { Button } from "../components/Button.jsx";
import { TextInput } from "../components/TextInput.jsx";

export function Login({ onAuthenticated, onSwitch }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(form);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-5 py-10">
      <section className="grid w-full max-w-md gap-6 rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">PayChain</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your PayChain banking console.</p>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            id="identifier"
            label="Email or username"
            onChange={(event) => setForm({ ...form, identifier: event.target.value })}
            required
            value={form.identifier}
          />
          <TextInput
            id="password"
            label="Password"
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            type="password"
            value={form.password}
          />
          {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
          <Button disabled={loading} type="submit">{loading ? "Signing in..." : "Login"}</Button>
          <button className="text-sm font-bold text-emerald-700" onClick={onSwitch} type="button">
            Create an account
          </button>
        </form>
      </section>
    </main>
  );
}
