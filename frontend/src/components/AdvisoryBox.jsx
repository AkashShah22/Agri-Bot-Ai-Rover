import {
  AlertTriangle,
  Bell,
  Check,
  Info,
  MapPin,
  Droplets
} from 'lucide-react';

export default function AdvisoryBox({
  latest,
  detectionHistory = [],
  selectedData
}) {

  // -----------------------------------------
  // Build active alerts
  // -----------------------------------------

  const alerts = [];

  // AI disease alerts
  detectionHistory.forEach((item) => {

    if (
      item.disease &&
      item.disease !== 'Healthy Plant'
    ) {

      const isHighRisk =
        item.disease === 'Late Blight';

      alerts.push({
        id: `disease-${item.id}`,
        type: isHighRisk ? 'HIGH' : 'WARNING',
        zone: item.zone || 'A1',
        title: item.disease,
        confidence: item.confidence_percent,
        timestamp: item.timestamp,
        recommendation: isHighRisk
          ? 'Immediate inspection recommended'
          : 'Inspect plants in this zone'
      });

    }

  });


  // -----------------------------------------
  // Low soil moisture alert
  // -----------------------------------------

  if (
    latest &&
    Number(latest.soil_moisture) < 30
  ) {

    alerts.push({
      id: 'soil-moisture',
      type: 'HIGH',
      zone: latest.zone || 'A1',
      title: 'Low Soil Moisture',
      moisture: latest.soil_moisture,
      timestamp: new Date().toISOString(),
      recommendation: 'Irrigation required'
    });

  }


  // Show newest 5 alerts
  const activeAlerts = alerts.slice(0, 5);


  return (
    <aside className="panel alerts-panel">

      {/* HEADER */}
      <div className="panel-heading">

        <Bell
          className="text-amber-300"
          size={18}
        />

        <h2>Active Alerts</h2>

        <span className="alert-count">
          {activeAlerts.length}
        </span>

      </div>


      {/* ---------------------------------- */}
      {/* ACTIVE ALERTS */}
      {/* ---------------------------------- */}

      {activeAlerts.length > 0 ? (

        <div className="space-y-3">

          {activeAlerts.map((alert) => {

            const isHigh =
              alert.type === 'HIGH';

            return (

              <article
                key={alert.id}
                className={
                  isHigh
                    ? 'alert-card red'
                    : 'alert-card amber'
                }
              >

                {/* ICON */}
                <div className="alert-icon">

                  {alert.title === 'Low Soil Moisture' ? (

                    <Droplets size={18} />

                  ) : (

                    <AlertTriangle size={18} />

                  )}

                </div>


                {/* CONTENT */}
                <div>

                  {/* ZONE + TIME */}
                  <p className="alert-title">

                    Zone {alert.zone}

                    <span>
                      {' '}•{' '}
                      {new Date(
                        alert.timestamp
                      ).toLocaleString()}
                    </span>

                  </p>


                  {/* ALERT TITLE */}
                  <h3>
                    {alert.title}
                  </h3>


                  {/* AI CONFIDENCE */}
                  {alert.confidence !== undefined && (

                    <p>
                      Confidence{' '}
                      <b>
                        {alert.confidence}%
                      </b>
                    </p>

                  )}


                  {/* SOIL MOISTURE */}
                  {alert.moisture !== undefined && (

                    <p>
                      Moisture{' '}
                      <b>
                        {alert.moisture}%
                      </b>
                    </p>

                  )}


                  {/* RECOMMENDATION */}
                  <p className="recommendation">

                    {alert.recommendation}

                  </p>


                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">

                    <button className="tiny-button">

                      <MapPin size={12} />

                      View Zone

                    </button>


                    <button className="tiny-button">

                      <Check size={12} />

                      Reviewed

                    </button>

                  </div>

                </div>

              </article>

            );

          })}

        </div>

      ) : (

        /* ---------------------------------- */
        /* NO ACTIVE ALERTS */
        /* ---------------------------------- */

        <article className="info-alert">

          <Check
            size={15}
            className="text-emerald-500"
          />

          <span>

            No active alerts

            <small>
              Field conditions are normal
            </small>

          </span>

        </article>

      )}


      {/* ---------------------------------- */}
      {/* MISSION STATUS */}
      {/* ---------------------------------- */}

      <article className="info-alert">

        <Info size={15} />

        <span>

          Mission active

          <small>
            Monitoring field conditions
          </small>

        </span>

      </article>


      {/* ---------------------------------- */}
      {/* SELECTED DATA */}
      {/* ---------------------------------- */}

      {selectedData && (

        <p className="mt-auto pt-3 text-xs text-slate-500">

          Selected: {selectedData.zone}
          {' • '}
          {selectedData.prediction}

        </p>

      )}

    </aside>
  );
}