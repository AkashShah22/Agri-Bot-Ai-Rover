import React, { useState, useEffect } from 'react';
import { socket } from './services/socket';
import { fetchLatestTelemetry } from './services/api';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import FieldGrid from './components/FieldGrid';
import AdvisoryBox from './components/AdvisoryBox';

export default function App() {
  const [records, setRecords] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latest, setLatest] = useState({
    zone: 'A1',
    soil_moisture: 0,
    temperature: 0,
    humidity: 0,
    battery_level: 100,
    prediction: 'Healthy',
    risk_state: 'GREEN',
    advisory: 'Awaiting initial telemetry sync from rover...'
  });

  useEffect(() => {
    // Initial data fetch from Backend API
    fetchLatestTelemetry().then((data) => {
      if (data && data.length > 0) {
        setLatest(data[0]);
        const map = {};
        data.forEach((d) => {
          if (!map[d.zone]) map[d.zone] = d;
        });
        setRecords(map);
      }
    });

    // Socket Connection handlers
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Real-time telemetry receiver
    socket.on('new_observation', (newData) => {
      setLatest(newData);
      setRecords((prev) => ({
        ...prev,
        [newData.zone]: newData
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_observation');
    };
  }, []);

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
  };

  const selectedData = selectedZone ? records[selectedZone] : null;

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <Header battery={latest.battery_level} isConnected={isConnected} />

        {/* Live Gauges (Moisture, Temp, Humidity) */}
        <MetricCards data={latest} />

        {/* Grid Map + Advisory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FieldGrid 
              records={records} 
              onSelectZone={handleSelectZone} 
              selectedZone={selectedZone} 
            />
          </div>
          
          <div className="lg:col-span-1">
            <AdvisoryBox 
              latest={latest} 
              selectedData={selectedData} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}