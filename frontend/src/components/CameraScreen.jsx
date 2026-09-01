import { useEffect, useRef, useState } from 'react';
import { Camera, ScanSearch } from 'lucide-react';

export default function CameraScreen({
  currentZone = 'A1',
  onAIDetection
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);

  // START CAMERA
  const startCamera = async () => {
    try {
      setError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch (err) {
      console.error(err);
      setError('Camera access denied or camera not available.');
    }
  };

  // CAPTURE IMAGE
  const captureImage = () => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      console.log('Camera is not ready');
      return;
    }

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      console.log('Canvas context not available');
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL('image/jpeg', 0.9);

    console.log('Image captured successfully');

    setCapturedImage(image);
  };

  // ANALYZE IMAGE
 const analyzeCrop = async () => {
  if (!capturedImage) return;

  try {
    // Convert captured image into a file
    const response = await fetch(capturedImage);
    const blob = await response.blob();

    // Prepare image for backend
    const formData = new FormData();
    formData.append('image', blob, 'crop.jpg');
    formData.append('zone', currentZone || 'A1');

    // Send image to Node.js backend
    const result = await fetch('http://10.223.5.115:5000/api/analyze', {
      method: 'POST',
      body: formData
    });

    const data = await result.json();
    
    console.log('Backend response:', data);
    
    setAnalysisResult(data);

    if (data.success && onAIDetection) {
      onAIDetection(data);
    }

    // Refresh detection history from database
    fetchDetectionHistory();

  } catch (error) {
    console.error('Analysis failed:', error);
  }
};

  const fetchDetectionHistory = async () => {
    try {
      const response = await fetch(
        'http://10.223.5.115:5000/api/detections'
      );

      const data = await response.json();

      if (data.success) {
        setDetectionHistory(data.data);
      }

    } catch (error) {
      console.error(
        'Failed to fetch detection history:',
        error
      );
    }
  };

  // STOP CAMERA WHEN COMPONENT UNMOUNTS
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);
  useEffect(() => {
  fetchDetectionHistory();
}, []);

  return (
    <section className="panel w-full">

      {/* HEADER */}
      <div className="panel-heading">
        <Camera
          className="text-emerald-500"
          size={18}
        />
        <h2>Crop Camera</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* ================= LIVE CAMERA ================= */}
        <div>

          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onClick={cameraActive ? captureImage : undefined}
              className="h-full w-full object-cover cursor-pointer"
            />

            {/* START CAMERA */}
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">

                <button
                  onClick={startCamera}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Start Camera
                </button>

              </div>
            )}

          </div>

          {/* ERROR */}
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* CAPTURE BUTTON */}
          <button
            onClick={captureImage}
            disabled={!cameraActive}
            className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Camera size={16} />
            Capture Image
          </button>

        </div>


        {/* ================= LATEST CAPTURE ================= */}
        <div>

          <div className="mb-2 text-sm font-semibold text-slate-700">
            Latest Capture
          </div>

          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-100">

            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured crop"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-sm text-slate-400">
                No image captured yet
              </div>
            )}

          </div>

          {/* ANALYZE BUTTON */}
          <button
            onClick={analyzeCrop}
            disabled={!capturedImage}
            className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ScanSearch size={16} />
            Analyze Crop
          </button>
          {analysisResult?.success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                AI Crop Analysis
              </div>

              <div className="mt-1 text-xl font-bold text-slate-800">
                {analysisResult.disease}
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Confidence: {analysisResult.confidence_percent}%
              </div>

              <div className="mt-2 text-sm font-semibold">
                Status:{' '}
                <span
                  className={
                    analysisResult.status === 'Detected'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }
                >
                  {analysisResult.status}
                </span>
              </div>
            </div>
          )}

          {detectionHistory.length > 0 && (
            <div className="mt-6">
              <div className="text-lg font-bold text-slate-800">
                Detection History
              </div>

              <div className="mt-3 space-y-3">
                {detectionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {item.disease}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-emerald-600">
                          {item.confidence_percent}%
                        </div>

                        <div className="text-xs text-slate-500">
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </section>
  );
}