import CameraScreen from './components/Camerascreen';
import { useEffect, useState } from 'react';
import { socket } from './services/socket';
import { fetchLatestTelemetry } from './services/api';

import Header from './components/Header';
import MetricCards from './components/MetricCards';
import AdvisoryBox from './components/AdvisoryBox';
import ZoneMap from './components/ZoneMap';

import { Activity, ShieldCheck, Radio, MapPin, Battery } from 'lucide-react';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [zoneDetections, setZoneDetections] = useState({
    A1: null,
    A2: null,
    A3: null,
    B1: null,
    B2: null,
    B3: null
  });
  const [zoneData, setZoneData] = useState({
    A1: null,
    A2: null,
    A3: null,
    B1: null,
    B2: null,
    B3: null
  });

  const [latest, setLatest] = useState({
    zone: 'A1',
    soil_moisture: 0,
    temperature: 0,
    humidity: 0,
    battery_level: 100,
    prediction: 'Healthy',
    risk_state: 'GREEN',
    advisory: 'Awaiting telemetry from rover...'
  });

  useEffect(() => {
    // Get latest data from backend
    fetchLatestTelemetry().then((data) => {
      if (data && data.length > 0) {
        setLatest(data[0]);
      }
    });

    fetch('http://10.223.5.115:5000/api/telemetry/records')
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const zoneMap = {};

          result.data.forEach((item) => {
            if (!zoneMap[item.zone]) {
              zoneMap[item.zone] = item;
            }
          });

          setZoneData((prev) => ({
            ...prev,
            ...zoneMap
          }));
        }
      })
      .catch((error) => {
        console.error(
          'Failed to fetch zone telemetry:',
          error
        );
      });

    fetch('http://10.223.5.115:5000/api/detections')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setDetectionHistory(data.data);

          const latestByZone = {};

          data.data.forEach((item) => {
            if (!latestByZone[item.zone]) {
              latestByZone[item.zone] = item;
            }
          });

          setZoneDetections((prev) => ({
            ...prev,
            ...latestByZone
          }));
        }
      })
      .catch((error) => {
        console.error(
          'Failed to fetch detections:',
          error
        );
      });

    // Socket connection
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleObservation = (newData) => {
      setLatest((prev) => ({
        ...prev,
        ...newData
      }));

      if (newData.zone) {
        setZoneData((prev) => ({
          ...prev,
          [newData.zone]: {
            ...prev[newData.zone],
            ...newData
          }
        }));
      }

      fetch('http://10.223.5.115:5000/api/detections')
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setDetectionHistory(data.data);
          }
        })
        .catch((error) => {
          console.error(
            'Failed to refresh detections:',
            error
          );
        });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_observation', handleObservation);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_observation', handleObservation);
    };
  }, []);

  const handleAIDetection = (result) => {
    if (!result?.success || !result?.zone) {
      return;
    }

    setZoneDetections((prev) => ({
      ...prev,
      [result.zone]: result
    }));

    setDetectionHistory((prev) => [
      result,
      ...prev
    ]);
  };

  const soilStatus =
    latest.soil_moisture < 30
      ? 'DRY'
      : latest.soil_moisture > 60
      ? 'WET'
      : 'NORMAL';

  const temperatureStatus = latest.temperature > 35 ? 'HIGH' : 'NORMAL';

  const humidityStatus = latest.humidity > 80 ? 'HIGH' : 'NORMAL';

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-slate-100 font-sans pb-10">
      <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 lg:p-6">
        {/* HEADER */}
        <Header battery={latest.battery_level} isConnected={isConnected} />

        {/* SENSOR METRICS */}
        <section>
          <MetricCards data={latest} />
        </section>

        {/* MAIN DASHBOARD GRID */}
<section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">

  {/* LEFT COLUMN */}
  <div className="space-y-4">


    {/* ROVER STATUS */}
<section className="panel">

  <div className="panel-heading">
    <Radio className="text-emerald-500" size={18} />
    <h2>Rover Status</h2>

    <span
      className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
        isConnected
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
    </span>
  </div>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

    {/* CURRENT ZONE */}
    <div className="status-row">
      <span className="flex items-center gap-2">
        <MapPin size={15} />
        Current Zone
      </span>

      <strong className="ok">
        {latest.zone}
      </strong>
    </div>

    {/* BATTERY */}
    <div className="status-row">
      <span className="flex items-center gap-2">
        <Battery size={15} />
        Battery
      </span>

      <strong
        className={
          latest.battery_level > 30
            ? 'ok'
            : 'warning'
        }
      >
        {latest.battery_level}%
      </strong>
    </div>

    {/* MISSION */}
    <div className="status-row">
      <span>Mission</span>

      <strong className="ok">
        ACTIVE
      </strong>
    </div>

  </div>

</section>

    {/* FIELD STATUS */}
    <section className="panel">

      <div className="panel-heading">
        <Activity className="text-emerald-500" size={18} />
        <h2>Field Status</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="status-row">
          <span>Soil Condition</span>
          <strong className={soilStatus === 'NORMAL' ? 'ok' : 'warning'}>
            {soilStatus}
          </strong>
        </div>

        <div className="status-row">
          <span>Temperature</span>
          <strong className={temperatureStatus === 'NORMAL' ? 'ok' : 'warning'}>
            {temperatureStatus}
          </strong>
        </div>

        <div className="status-row">
          <span>Humidity</span>
          <strong className={humidityStatus === 'NORMAL' ? 'ok' : 'warning'}>
            {humidityStatus}
          </strong>
        </div>

      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-cardBorder pt-4 text-sm text-slate-400">

        <ShieldCheck
          size={18}
          className="text-emerald-500"
        />

        <span>
          Monitoring field conditions in real time
        </span>

      </div>

    </section>

    {/* FIELD ZONE MAP */}
    <ZoneMap
      latest={latest}
      zoneData={zoneData}
      zoneDetections={zoneDetections}
    />

    {/* CAMERA */}
    <section>
      <CameraScreen
        currentZone={latest.zone}
        onAIDetection={handleAIDetection}
      />
    </section>
  </div>


  {/* RIGHT COLUMN */}
  <AdvisoryBox
    latest={latest}
     detectionHistory={detectionHistory}
    selectedData={null}
  />

</section>
      </div>
    </div>
  );
}