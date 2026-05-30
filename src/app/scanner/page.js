'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import jsQR from 'jsqr';

export default function GateScanner() {
  const { publicKey, connected } = useWallet();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // info, success, error

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Request camera permissions on load
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Enforces back camera on mobile
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setHasPermission(false);
        setStatusMessage('Camera access denied. Please enable camera permissions.');
        setStatusType('error');
      }
    }

    startCamera();

    return () => {
      // Clean up camera stream and loops on exit
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Run continuous scan frames
  useEffect(() => {
    if (hasPermission && scanning) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [hasPermission, scanning]);

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        setScanning(false); // Pause scanner during processing
        handleTicketValidation(code.data);
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleTicketValidation = async (ticketId) => {
    if (!connected || !publicKey) {
      updateStatus('Please connect your authority wallet first!', 'error');
      setScanning(true);
      return;
    }

    updateStatus('Processing code and verifying event authority...', 'info');

    try {
      // 1. Fetch ticket and cross-reference with its corresponding event host
      const { data: ticket, error: ticketErr } = await supabase
        .from('tickets')
        .select('*, events(host_address)')
        .eq('id', ticketId)
        .single();

      if (ticketErr || !ticket) {
        updateStatus('Invalid Ticket: Code format not recognized in system records.', 'error');
        setTimeout(() => setScanning(true), 2500);
        return;
      }

      // 2. STAGE AUTHORIZATION CHECK: Compare signer wallet to event creator wallet
      const currentOrganizer = publicKey.toBase58();
      const actualEventHost = ticket.events?.host_address;

      if (currentOrganizer !== actualEventHost) {
        updateStatus('Access Denied: You are not the registered host of this event.', 'error');
        setTimeout(() => setScanning(true), 3500);
        return;
      }

      // 3. Prevent duplicate entry scans
      if (ticket.validated) {
        updateStatus('⚠️ Already Validated! Ticket was scanned previously.', 'error');
        setTimeout(() => setScanning(true), 3000);
        return;
      }

      // 4. Update row state if conditions pass cleanly
      const { error: updateErr } = await supabase
        .from('tickets')
        .update({ validated: true, scanned_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (updateErr) throw updateErr;

      updateStatus(`✅ Ticket Approved! Entry authorized successfully.`, 'success');
      
    } catch (err) {
      console.error(err);
      updateStatus('Database synchronization error occurred.', 'error');
    }

    // Resume camera scanning loop automatically after a brief pause
    setTimeout(() => setScanning(true), 2500);
  };

  const updateStatus = (msg, type) => {
    setStatusMessage(msg);
    setStatusType(type);
  };

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '20px', textAlign: 'center', color: '#fff' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#a855f7' }}>Gate Ticket Validator</h2>
      <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '20px' }}>
        Organizer Mode: Point camera at attendee pass QR code to verify entries.
      </p>

      {/* Camera Preview Box */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', backgroundColor: '#111827', borderRadius: '12px', overflow: 'hidden', border: '2px solid #374151', marginBottom: '20px' }}>
        {hasPermission === false && (
          <div style={{ padding: '40px 20px', color: '#ef4444' }}>Camera hardware unavailable or permissions denied.</div>
        )}
        
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Floating crosshairs visual assistant */}
        {scanning && hasPermission && (
          <div style={{ position: 'absolute', inset: '40px', border: '2px dashed #22c55e', borderRadius: '8px', opacity: 0.6, pointerEvents: 'none' }} />
        )}
      </div>

      {/* Real-Time Feedback HUD Banner */}
      {statusMessage && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          backgroundColor: statusType === 'success' ? '#14532d' : statusType === 'error' ? '#7f1d1d' : '#1e3a8a',
          color: statusType === 'success' ? '#4ade80' : statusType === 'error' ? '#fca5a5' : '#93c5fd',
          border: `1px solid ${statusType === 'success' ? '#22c55e' : statusType === 'error' ? '#ef4444' : '#3b82f6'}`
        }}>
          {statusMessage}
        </div>
      )}

      {!connected && (
        <p style={{ color: '#fbbf24', fontSize: '0.85rem' }}>⚠️ Connect your host wallet to initialize protection checks.</p>
      )}
    </div>
  );
        }
