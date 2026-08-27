const express = require('express');
const router = express.Router();
const db = require('../config/database.js');

module.exports = (io) => {
  // POST /api/sync - Ingest telemetry & AI observations from phone[cite: 1, 2]
  router.post('/', (req, res) => {
    try {
      const records = Array.isArray(req.body) ? req.body : [req.body];
      
      const insertStmt = db.prepare(`
        INSERT INTO observations (
          timestamp, zone, soil_moisture, temperature, humidity, 
          battery_level, prediction, confidence, risk_state, advisory
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((items) => {
        for (const item of items) {
          insertStmt.run(
            item.timestamp || new Date().toISOString(),
            item.zone || 'A1',
            Number(item.soil_moisture) || 0,
            Number(item.temperature) || 0,
            Number(item.humidity) || 0,
            Number(item.battery_level) || 100,
            item.prediction || 'Healthy',
            Number(item.confidence) || 0.9,
            item.risk_state || 'GREEN',
            item.advisory || 'Conditions normal'
          );
          
          // its connect to the socket io which help tos end live updates
          io.emit('new_observation', item);
        }
      });

      insertMany(records);
      return res.status(200).json({ success: true, count: records.length });
    } catch (error) {
      console.error('Sync error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};