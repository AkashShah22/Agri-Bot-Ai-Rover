const metrics = [
  ['Soil moisture', 'soil_moisture', '%'],
  ['Temperature', 'temperature', 'C'],
  ['Humidity', 'humidity', '%'],
];

export default function MetricCards({ data }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Live metrics">
      {metrics.map(([label, key, unit]) => (
        <article key={key} className="rounded-lg border border-cardBorder bg-darkCard p-5">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold">
            {data[key]}<span className="ml-1 text-base text-slate-400">{unit}</span>
          </p>
        </article>
      ))}
    </section>
  );
}
