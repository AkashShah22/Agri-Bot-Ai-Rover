const express = require('express');

const router = express.Router();

const db = require('../config/database.js');


// GET /api/detections
// Return latest AI disease detections

router.get('/', (req, res) => {

    try {

        const rows = db.prepare(`
            SELECT
                id,
                timestamp,
                zone,
                disease,
                confidence,
                confidence_percent,
                status
            FROM disease_detections
            ORDER BY id DESC
            LIMIT 50
        `).all();

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(
            'Detection history error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


module.exports = router;