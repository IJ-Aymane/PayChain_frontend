export function WalletCard({ user }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">Custodial wallet</p>
      <p className="mt-2 break-all rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-ink">
        {user?.walletAddress}
      </p>
      <p className="mt-3 text-sm text-slate-500">
        Wallet generated for this account and managed by the backend.
      </p>
    </section>
  );
}
