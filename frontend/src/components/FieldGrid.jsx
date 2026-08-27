import React from 'react';

// 4x4 Field Grid definition (A1 to D4)
const GRID_ROWS = ['A', 'B', 'C', 'D'];
const GRID_COLS = ['1', '2', '3', '4'];
const ALL_ZONES = GRID_ROWS.flatMap(row => GRID_COLS.map(col => `${row}${col}`));

export default function FieldGrid({ records, onSelectZone, selectedZone }) {
  const getCellTheme = (zone) => {
    const item = records[zone];
    const isSelected = selectedZone === zone ? 'ring-2 ring-emerald-400 scale-[1.03] shadow-lg' : '';

    if (!item) {
      return `bg-slate-800/40 border-slate-700/60 text-slate-500 hover:border-slate-500 hover:bg-slate-800/70 ${isSelected}`; // GREY
    }
    if (item.risk_state === 'RED') {
      return `bg-rose-950/70 border-rose-500/80 text-rose-200 hover:bg-rose-900/80 ${isSelected}`; // RED[cite: 2]
    }
    if (item.risk_state === 'YELLOW') {
      return `bg-amber-950/70 border-amber-500/80 text-amber-200 hover:bg-amber-900/80 ${isSelected}`; // YELLOW[cite: 2]
    }
    return `bg-emerald-950/70 border-emerald-500/80 text-emerald-200 hover:bg-emerald-900/80 ${isSelected}`; // GREEN[cite: 2]
  };

  const getStatusBadge = (item) => {
    if (!item) return <span className="text-[10px] text-slate-400">UNSCANNED</span>; //[cite: 2]
    const badgeColors = {
      RED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      YELLOW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      GREEN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold tracking-wider ${badgeColors[item.risk_state] || 'text-slate-400'}`}>
        {item.risk_state}
      </span>
    );
  };

  return (
    <div className="bg-darkCard p-6 rounded-2xl border border-cardBorder shadow-md">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🗺️ Field Risk Grid Map</span>
            <span className="text-xs text-slate-400 font-normal">(4x4 Zone Matrix)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Click any cell to inspect AI diagnostics & local telemetry</p>
        </div>
        
        {/* Color State Legend[cite: 2] */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-darkBg/60 px-3 py-1.5 rounded-xl border border-cardBorder">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Danger</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Unscanned</span>
        </div>
      </div>

      {/* 4x4 Grid Matrix Container */}
      <div className="grid grid-cols-4 gap-3.5">
        {ALL_ZONES.map((zone) => {
          const item = records[zone];
          return (
            <button
              key={zone}
              onClick={() => onSelectZone(zone)}
              className={`h-24 p-3 rounded-xl border flex flex-col justify-between text-left transition-all duration-200 cursor-pointer ${getCellTheme(zone)}`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-extrabold text-sm tracking-wide">{zone}</span>
                {getStatusBadge(item)}
              </div>

              <div>
                <p className="text-xs font-semibold truncate">
                  {item ? item.prediction : 'No Data'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {item ? `Moisture: ${item.soil_moisture}%` : 'Pending survey'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}