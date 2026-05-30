'use client';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import jsQR from 'jsqr';

export default function GateScanner() {
  const { publicKey, connected } = useWallet();
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Force back camera for mobile
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
      .then(stream => { videoRef.current.srcObject = stream; })
      .catch(() => {
        // Fallback to any camera if back camera is blocked
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => { videoRef.current.srcObject = stream; })
          .catch(err => alert("Camera error: " + err));
      });
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        setScanning(false);
        // Alert to confirm detection, then trigger validation
        alert("QR Detected! Validating...");
        // Call your validation logic here
      }
    }, 1000); // Scans once per second to save battery and increase accuracy
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '15px' }} />
      <p>Point camera at QR code...</p>
    </div>
  );
}
