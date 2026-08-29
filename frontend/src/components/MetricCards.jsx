import { Droplets, Thermometer, Waves } from 'lucide-react';

const metrics = [
  ['Soil moisture', 'soil_moisture', '%', Droplets, '25-40%'],
  ['Temperature', 'temperature', '°C', Thermometer, '20-35°C'],
  ['Humidity', 'humidity', '%', Waves, '40-60%'],
];

export default function MetricCards({ data }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map(([label, key, unit, Icon, range]) => (
        <article key={key} className="panel metric-panel"><div className="panel-heading"><Icon size={17} className="text-emerald-300" /><h2>{label}</h2></div><p className="metric-value">{data[key]}<small>{unit}</small></p><p className="text-xs text-slate-500">Optimal range: {range}</p>
        </article>
      ))}
    </section>
  );
}
