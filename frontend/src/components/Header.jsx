export default function Header({ battery, isConnected }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-cardBorder bg-darkCard p-4">
      <div>
        <p className="text-sm text-slate-400">Smart Farming UGV</p>
        <h1 className="text-2xl font-semibold">Field Telemetry Dashboard</h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
        <span>Battery: {battery}%</span>
      </div>
    </header>
  );
}
