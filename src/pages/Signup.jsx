import { useState } from "react";

import { signup } from "../api/index.js";
import { Button } from "../components/Button.jsx";
import { TextInput } from "../components/TextInput.jsx";

export function Signup({ onAuthenticated, onSwitch }) {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await signup(form);
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
          <h1 className="mt-2 text-3xl font-black text-ink">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Create your PayChain account and secure wallet.</p>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            id="email"
            label="Email"
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
            type="email"
            value={form.email}
          />
          <TextInput
            id="username"
            label="Username"
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            required
            value={form.username}
          />
          <TextInput
            id="signup-password"
            label="Password"
            minLength={8}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            type="password"
            value={form.password}
          />
          {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
          <Button disabled={loading} type="submit">{loading ? "Creating..." : "Sign up"}</Button>
          <button className="text-sm font-bold text-emerald-700" onClick={onSwitch} type="button">
            Already have an account
          </button>
        </form>
      </section>
    </main>
  );
}
