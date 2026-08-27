export default function AdvisoryBox({ latest, selectedData }) {
  const data = selectedData || latest;

  return (
    <aside className="h-full rounded-lg border border-cardBorder bg-darkCard p-5">
      <p className="text-sm text-slate-400">Advisory for zone {data.zone}</p>
      <h2 className="mt-1 text-lg font-semibold">{data.prediction}</h2>
      <p className="mt-4 text-sm leading-6 text-slate-300">{data.advisory}</p>
      <p className="mt-5 text-xs uppercase tracking-wide text-slate-500">
        Risk state: {data.risk_state}
      </p>
    </aside>
  );
}
