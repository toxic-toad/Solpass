'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import jsQR from 'jsqr';

export default function GateScanner() {
  const { publicKey, connected } = useWallet();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Initializing camera...');
  const [isScanning, setIsScanning] = useState(true);

  // Initialize Camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('Point camera at QR code');
        }
      } catch (err) {
        setStatus('Error: Camera access denied. Please check permissions.');
      }
    }
    startCamera();
  }, []);

  // Scanning Logic
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleValidation(code.data);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isScanning, publicKey]);

  async function handleValidation(ticketId) {
    if (!connected) {
      setStatus('Please connect your wallet first.');
      return;
    }

    setIsScanning(false);
    setStatus('Verifying...');

    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*, events(host_address)')
        .eq('id', ticketId)
        .single();

      if (error || !ticket) {
        setStatus('Invalid ticket.');
      } else if (ticket.events?.host_address !== publicKey.toBase58()) {
        setStatus('Access Denied: You do not own this event.');
      } else if (ticket.validated) {
        setStatus('Ticket already used.');
      } else {
        await supabase.from('tickets').update({ validated: true }).eq('id', ticketId);
        setStatus('Success: Ticket validated!');
      }
    } catch (e) {
      setStatus('System error.');
    }

    setTimeout(() => setIsScanning(true), 3000);
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
      <h1>Gate Ticket Validator</h1>
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', borderRadius: '15px' }} 
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      <p style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>{status}</p>
    </div>
  );
          }
