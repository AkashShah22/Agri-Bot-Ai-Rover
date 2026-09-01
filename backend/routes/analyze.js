const express = require('express');
const multer = require('multer');
const ort = require('onnxruntime-node');
const sharp = require('sharp');
const path = require('path');
const db = require('../config/database.js');
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

// ------------------------------------
// Model configuration
// ------------------------------------

const MODEL_PATH = path.join(
    __dirname,
    '..',
    'models',
    'best.onnx'
);

// Human-readable class names
const CLASS_NAMES = [
    'Bacterial Spot',
    'Early Blight',
    'Late Blight',
    'Leaf Mold',
    'Septoria Leaf Spot',
    'Spider Mite Damage',
    'Target Spot',
    'Yellow Leaf Curl Virus',
    'Mosaic Virus',
    'Healthy Plant'
];

let session = null;


// ------------------------------------
// Load ONNX model once
// ------------------------------------

async function loadModel() {

    if (!session) {

        console.log('Loading ONNX model...');

        session = await ort.InferenceSession.create(
            MODEL_PATH
        );

        console.log('ONNX model loaded successfully');

        console.log(
            'Input names:',
            session.inputNames
        );

        console.log(
            'Output names:',
            session.outputNames
        );
    }

    return session;
}


// ------------------------------------
// Image → Float32 tensor
// ------------------------------------

async function imageToTensor(buffer) {

    const { data, info } = await sharp(buffer)
        .resize(224, 224)
        .removeAlpha()
        .raw()
        .toBuffer({
            resolveWithObject: true
        });

    const float32Data = new Float32Array(
        1 * 3 * 224 * 224
    );

    // Convert HWC → CHW
    // RGB values 0-255 → 0-1

    for (let y = 0; y < 224; y++) {

        for (let x = 0; x < 224; x++) {

            const pixelIndex =
                (y * 224 + x) * 3;

            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            const tensorIndex =
                y * 224 + x;

            float32Data[
                tensorIndex
            ] = r / 255.0;

            float32Data[
                224 * 224 + tensorIndex
            ] = g / 255.0;

            float32Data[
                2 * 224 * 224 + tensorIndex
            ] = b / 255.0;
        }
    }

    return new ort.Tensor(
        'float32',
        float32Data,
        [1, 3, 224, 224]
    );
}


// ------------------------------------
// POST /api/analyze
// ------------------------------------

router.post(
    '/',
    upload.single('image'),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    error: 'No image received'
                });

            }

            console.log(
                'Image received:',
                req.file.originalname
            );

            // Load model
            const model = await loadModel();

            // Convert image to tensor
            const inputTensor =
                await imageToTensor(
                    req.file.buffer
                );

            // Get actual ONNX input name
            const inputName =
                model.inputNames[0];

            // Run inference
            const outputs =
                await model.run({
                    [inputName]: inputTensor
                });

            // Get first output
            const outputName =
                model.outputNames[0];

            const output =
                outputs[outputName];

            const probabilities =
                Array.from(output.data);

            // Find highest probability
            let topIndex = 0;

            for (
                let i = 1;
                i < probabilities.length;
                i++
            ) {

                if (
                    probabilities[i] >
                    probabilities[topIndex]
                ) {
                    topIndex = i;
                }
            }

            const confidence =
                probabilities[topIndex];

            const disease =
                CLASS_NAMES[topIndex];

            const zone =
                req.body?.zone || 'A1';

            console.log(
                'Prediction:',
                disease
            );

            console.log(
                'Confidence:',
                (confidence * 100).toFixed(2) + '%'
            );

            const confidencePercent = Number(
                (confidence * 100).toFixed(2)
            );

            const status =
                confidencePercent >= 70
                    ? 'Detected'
                    : 'Needs Review';

            console.log(
                'Confidence:',
                confidencePercent + '%'
            );

            console.log(
                'Status:',
                status
            );

            // Save AI detection to database
            const db = require('../config/database.js');

const timestamp = new Date().toISOString();

db.prepare(`
    INSERT INTO disease_detections
    (
        timestamp,
        zone,
        disease,
        confidence,
        confidence_percent,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?)
`).run(
    timestamp,
    zone,
    disease,
    confidence,
    confidencePercent,
    status
);

console.log('AI detection saved to database');

return res.status(200).json({

    success: true,

    disease: disease,

    confidence: confidence,

    confidence_percent: confidencePercent,

    status: status

});

        } catch (error) {

            console.error(
                'Analysis error:',
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message

            });
        }

    }
);

module.exports = router;