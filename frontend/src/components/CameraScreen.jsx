import { useEffect, useRef, useState } from 'react';
import { Camera, ScanSearch } from 'lucide-react';

export default function CameraScreen() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');

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
  const analyzeCrop = () => {
    if (!capturedImage) return;

    console.log('Crop image ready for AI analysis');
    console.log(capturedImage);
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

        </div>

      </div>

    </section>
  );
}