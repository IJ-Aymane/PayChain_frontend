import { useCallback, useEffect, useState } from "react";

import { getLocalChainStatus } from "../api/index.js";
import { Button } from "./Button.jsx";

export function LocalChainPanel() {
  const [chain, setChain] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChain = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLocalChainStatus({ limit: 25 });
      setChain(data.status);
      setBlocks(data.blocks ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChain();
  }, [loadChain]);

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">Custom local blockchain</p>
            <h2 className="mt-1 text-2xl font-black text-ink">SHA-256 integrity chain</h2>
          </div>
          <Button disabled={loading} onClick={loadChain} variant="secondary">
            {loading ? "Verifying..." : "Verify chain"}
          </Button>
        </div>

        {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Integrity" value={chain?.valid ? "Verified" : "Tampered"} tone={chain?.valid ? "good" : "bad"} />
          <Metric label="Blocks" value={chain?.blockCount ?? 0} />
          <Metric label="Latest block" value={chain?.latestBlockNumber ?? "-"} />
          <Metric label="Mode" value={chain?.enabled === false ? "Disabled" : "Enabled"} />
        </div>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Latest hash</p>
          <p className="mt-2 break-all font-mono text-xs font-semibold text-ink">{chain?.latestHash ?? "-"}</p>
          <p className="mt-3 text-sm font-medium text-slate-600">{chain?.message ?? "Waiting for verification"}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Recent blocks</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Block</th>
                <th>Event</th>
                <th>Source</th>
                <th>Previous Hash</th>
                <th>Hash</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blocks.map((block) => (
                <tr key={block.hash}>
                  <td className="py-3 font-black text-ink">#{block.block_number}</td>
                  <td className="font-semibold text-ink">{block.event_type}</td>
                  <td>
                    <p>{block.source_table}</p>
                    <p className="max-w-[210px] truncate font-mono text-[11px] text-slate-500">{block.source_id}</p>
                  </td>
                  <td className="max-w-[180px] truncate font-mono text-xs">{block.previous_hash}</td>
                  <td className="max-w-[220px] truncate font-mono text-xs">{block.hash}</td>
                  <td>{formatDate(block.block_timestamp)}</td>
                </tr>
              ))}
              {blocks.length === 0 ? <tr><td className="py-5 text-center text-slate-500" colSpan={6}>No blocks yet</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-ink",
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    bad: "border-rose-200 bg-rose-50 text-rose-700"
  };

  return (
    <div className={`rounded-md border p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}
