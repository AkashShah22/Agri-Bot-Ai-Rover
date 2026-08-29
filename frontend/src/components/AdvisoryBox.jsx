import { AlertTriangle, Bell, Check, Info, MapPin } from 'lucide-react';

export default function AdvisoryBox({ selectedData }) {
  return (
    <aside className="panel alerts-panel"><div className="panel-heading"><Bell className="text-amber-300" size={18} /><h2>Active Alerts</h2><span className="alert-count">2</span></div>
      <article className="alert-card amber"><div className="alert-icon"><AlertTriangle size={18} /></div><div><p className="alert-title">Zone C4 <span>• 2 min ago</span></p><h3>Early Aphid Spread</h3><p>Confidence <b>87%</b></p><p className="recommendation">Inspect plants in this zone</p><div className="flex gap-2"><button className="tiny-button"><MapPin size={12} /> View Zone</button><button className="tiny-button"><Check size={12} /> Reviewed</button></div></div></article>
      <article className="alert-card red"><div className="alert-icon"><AlertTriangle size={18} /></div><div><p className="alert-title">Zone B3 <span>• 6 min ago</span></p><h3>Low Soil Moisture</h3><p>Moisture <b>14%</b></p><p className="recommendation">Irrigation required</p></div></article>
      <article className="info-alert"><Info size={15} /><span>Mission started successfully <small>18 min ago</small></span></article>
      {selectedData && <p className="mt-auto pt-3 text-xs text-slate-500">Selected: {selectedData.zone} • {selectedData.prediction}</p>}
    </aside>
  );
}
