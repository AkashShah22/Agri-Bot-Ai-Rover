import { MapPin } from 'lucide-react';

export default function ZoneMap({
  latest,
  zoneData = {},
  zoneDetections = {}
}) {

  const zones = [
    'A1',
    'A2',
    'A3',
    'B1',
    'B2',
    'B3'
  ];

  const getZoneStatus = (zone) => {

    const telemetry = zoneData[zone];
    const detection = zoneDetections[zone];

    if (
      detection &&
      detection.disease !== 'Healthy Plant'
    ) {
      return 'DISEASE';
    }

    if (
      detection &&
      detection.disease === 'Healthy Plant'
    ) {
      return 'HEALTHY';
    }

    if (!telemetry) {
      return 'NOT_SCANNED';
    }

    if (Number(telemetry.soil_moisture) < 30) {
      return 'DRY';
    }

    return 'NORMAL';
  };

  return (
    <section className="panel">

      <div className="panel-heading">

        <MapPin
          className="text-emerald-500"
          size={18}
        />

        <h2>Field Zone Map</h2>

        <span className="ml-auto text-xs text-slate-500">
          Rover: {latest?.zone || 'A1'}
        </span>

      </div>

      <div className="grid grid-cols-3 gap-3">

        {zones.map((zone) => {

          const status = getZoneStatus(zone);
          const isCurrent = latest?.zone === zone;
          const telemetry = zoneData[zone];
          const detection = zoneDetections[zone];

          return (
            <div
              key={zone}
              className={`
                relative rounded-xl border-2 p-4
                transition
                ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50'
                    : status === 'DISEASE'
                    ? 'border-amber-300 bg-amber-50'
                    : status === 'DRY'
                    ? 'border-red-300 bg-red-50'
                    : status === 'HEALTHY'
                    ? 'border-emerald-200 bg-emerald-50'
                    : status === 'NORMAL'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-slate-50'
                }
              `}
            >

              {isCurrent && (
                <div className="absolute right-2 top-2">
                  <MapPin
                    size={18}
                    className="text-emerald-600"
                  />
                </div>
              )}

              <div className="text-lg font-bold text-slate-800">
                Zone {zone}
              </div>

              <div className="mt-2 text-xs font-semibold">

                {status === 'DISEASE' && (
                  <span className="text-amber-600">
                    DISEASE DETECTED
                  </span>
                )}

                {status === 'HEALTHY' && (
                  <span className="text-emerald-600">
                    HEALTHY
                  </span>
                )}

                {status === 'DRY' && (
                  <span className="text-red-600">
                    LOW MOISTURE
                  </span>
                )}

                {status === 'NORMAL' && (
                  <span className="text-blue-600">
                    SCANNED
                  </span>
                )}

                {status === 'NOT_SCANNED' && (
                  <span className="text-slate-500">
                    NOT SCANNED
                  </span>
                )}

              </div>

              {detection && (
                <div className="mt-2 text-xs text-slate-600">
                  <div>
                    {detection.disease}
                  </div>

                  <div className="mt-1">
                    Confidence:{' '}
                    {detection.confidence_percent}%
                  </div>
                </div>
              )}

              {telemetry && (
                <div className="mt-2 text-xs text-slate-500">
                  <div>
                    Soil: {telemetry.soil_moisture}%
                  </div>

                  <div>
                    Temp: {telemetry.temperature}°C
                  </div>
                </div>
              )}

              {isCurrent && (
                <div className="mt-3 text-xs font-semibold text-emerald-700">
                  Rover currently here
                </div>
              )}

            </div>
          );
        })}

      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cardBorder pt-3 text-xs sm:grid-cols-5">

        <div className="flex items-center gap-2 rounded-md bg-white/40 px-2 py-1">
          <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span className="font-medium text-slate-700">Current Rover</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-white/40 px-2 py-1">
          <span className="h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-amber-200" />
          <span className="font-medium text-slate-700">Disease</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-white/40 px-2 py-1">
          <span className="h-3.5 w-3.5 rounded-full bg-red-400 ring-2 ring-red-200" />
          <span className="font-medium text-slate-700">Low Moisture</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-white/40 px-2 py-1">
          <span className="h-3.5 w-3.5 rounded-full bg-blue-400 ring-2 ring-blue-200" />
          <span className="font-medium text-slate-700">Scanned</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-white/40 px-2 py-1">
          <span className="h-3.5 w-3.5 rounded-full bg-slate-300 ring-2 ring-slate-200" />
          <span className="font-medium text-slate-700">Not Scanned</span>
        </div>

      </div>

    </section>
  );
}
