import { Button } from "./Button.jsx";

const BASE_SEPOLIA_TX_URL = "https://sepolia.basescan.org/tx";

export function ReceiptModal({ receipt, onClose }) {
  if (!receipt) {
    return null;
  }

  const reference = receipt.reference ?? `demo-receipt-${receipt.id}`;
  const isBlockchain = receipt.mode === "blockchain" && receipt.reference;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">PayChain receipt</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{displayType(receipt.type, receipt.direction)}</h2>
          </div>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>

        <div className="grid gap-4 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Amount" value={`${receipt.amount} ${receipt.asset}`} />
            <Metric label="Status" value={normalizeStatus(receipt.status)} />
            <Metric label="Mode" value={receipt.mode === "blockchain" ? "Base Sepolia" : "Demo ledger"} />
          </div>

          <div className="rounded-md border border-slate-200">
            <InfoRow label="Reference" value={shortReference(reference)} />
            <InfoRow label="Date" value={formatDate(receipt.date)} />
            <InfoRow label="From" value={formatParty(receipt.from)} />
            <InfoRow label="To" value={formatParty(receipt.to)} />
            <InfoRow label="Wallet from" value={receipt.from?.address ?? "-"} monospace />
            <InfoRow label="Wallet to" value={receipt.to?.address ?? "-"} monospace />
            <InfoRow label="Local block" value={receipt.localBlock ? `#${receipt.localBlock.number}` : "-"} />
            <InfoRow label="Block hash" value={receipt.localBlock?.hash ?? "-"} monospace />
          </div>

          {isBlockchain ? (
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-ink transition hover:bg-slate-50"
              href={`${BASE_SEPOLIA_TX_URL}/${receipt.reference}`}
              rel="noreferrer"
              target="_blank"
            >
              Open on BaseScan
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, monospace = false }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[140px_1fr]">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`break-words text-sm font-semibold text-ink ${monospace ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

function displayType(type, direction) {
  if (type === "TRANSFER") {
    return direction === "debit" ? "TRANSFER_SENT" : "TRANSFER_RECEIVED";
  }

  return type;
}

function normalizeStatus(status) {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "SUCCESS";
  }

  return status;
}

function formatParty(party) {
  if (!party?.userId) {
    return "PayChain demo treasury";
  }

  return `${party.username ?? "User"} (${party.email ?? party.userId})`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function shortReference(value) {
  if (!value || value.length <= 24) {
    return value ?? "-";
  }

  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}
