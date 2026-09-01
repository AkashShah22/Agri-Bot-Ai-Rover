const http = require('http');

const zones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];

let zoneIndex = 0;

function generateTelemetry() {

  const zone = zones[zoneIndex];

  // Simulate changing sensor values
  const soilMoisture = Math.floor(
    Math.random() * 50 + 20
  );

  const temperature = Math.floor(
    Math.random() * 8 + 25
  );

  const humidity = Math.floor(
    Math.random() * 25 + 55
  );

  const battery = Math.max(
    20,
    100 - zoneIndex * 3
  );

  // Simulated AI result
  const diseases = [
    'Healthy',
    'Early Blight',
    'Late Blight'
  ];

  const prediction =
    diseases[Math.floor(Math.random() * diseases.length)];

  const confidence =
    prediction === 'Healthy'
      ? 0.95
      : Math.random() * 0.2 + 0.8;

  let riskState = 'GREEN';
  let advisory = 'Conditions normal';

  if (prediction !== 'Healthy') {

    riskState = 'RED';

    advisory =
      `Inspect plants in ${zone} for ${prediction}`;

  } else if (soilMoisture < 30) {

    riskState = 'YELLOW';

    advisory =
      `Low soil moisture detected in ${zone}`;

  }


  return {

    timestamp: new Date().toISOString(),

    zone,

    soil_moisture: soilMoisture,

    temperature,

    humidity,

    battery_level: battery,

    prediction,

    confidence,

    risk_state: riskState,

    advisory

  };
}


function sendTelemetry() {

  const roverData = generateTelemetry();

  const data = JSON.stringify(roverData);

  const options = {

    hostname: 'localhost',

    port: 5000,

    path: '/api/sync',

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'Content-Length':
        Buffer.byteLength(data)

    }

  };


  const req = http.request(
    options,
    (res) => {

      let response = '';

      res.on(
        'data',
        (chunk) => {
          response += chunk;
        }
      );

      res.on(
        'end',
        () => {

          console.log(
            'Rover:',
            roverData.zone,
            '| Soil:',
            roverData.soil_moisture + '%',
            '| Temp:',
            roverData.temperature + '°C',
            '| Battery:',
            roverData.battery_level + '%',
            '| AI:',
            roverData.prediction,
            '| Confidence:',
            (roverData.confidence * 100).toFixed(1) + '%'
          );

          console.log(
            'Backend:',
            response
          );

        }
      );

    }
  );


  req.on(
    'error',
    (error) => {

      console.error(
        'Rover connection error:',
        error.message
      );

    }
  );


  req.write(data);

  req.end();


  // Move rover to next zone
  zoneIndex =
    (zoneIndex + 1) % zones.length;

}


// Send immediately
sendTelemetry();


// Send every 3 seconds
setInterval(
  sendTelemetry,
  3000
);