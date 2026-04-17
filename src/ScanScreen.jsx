import { useEffect, useRef, useState, useCallback } from 'react';
import {
  startHtml5QrScanner,
  startZXingScanner,
  startZBarScanner,
  startZXingWasmScanner,
  startBarcodeDetectorScanner,
} from './scanners';
import CountdownTimer from './CountdownTimer';

const LIBRARY_INFO = [
  { key: 'html5-qrcode', label: 'html5-qrcode', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { key: 'zxing',        label: 'ZXing-js',       color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  { key: 'zbar',         label: 'ZBar WASM',        color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  { key: 'zxing-wasm',   label: 'ZXing WASM',      color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { key: 'barcodedetector', label: 'BarcodeDetector', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
];

const BARCODES = ['B1', 'B2', 'B3', 'B4', 'B5'];

export default function ScanScreen({ libIndex, barcodeIndex, onScanComplete }) {
  const lib     = LIBRARY_INFO[libIndex];
  const barcode = BARCODES[barcodeIndex];

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const scannerRef  = useRef(null);
  const startTimeRef = useRef(null);
  const doneRef     = useRef(false);
  const scanMetaRef = useRef(null);

  const [phase, setPhase]             = useState('scanning');
  const [decodedValue, setDecodedValue] = useState('');
  const [scanError, setScanError]     = useState('');
  const [timerKey]                    = useState(() => `${libIndex}-${barcodeIndex}`);

  const cleanupScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (_) {}
      scannerRef.current = null;
    }
  }, []);

  const handleResult = useCallback(async (value) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = Date.now() - startTimeRef.current;
    scanMetaRef.current = { responseTime: elapsed, status: 'success' };
    await cleanupScanner();
    setDecodedValue(value);
    setPhase('result');
  }, [cleanupScanner]);

  const handleTimeout = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    scanMetaRef.current = { responseTime: 5000, status: 'timeout' };
    await cleanupScanner();
    setDecodedValue('');
    setPhase('result');
  }, [cleanupScanner]);

  const handleError = useCallback((err) => {
    setScanError(err?.message || 'Camera error');
  }, []);

  useEffect(() => {
    doneRef.current = false;
    scanMetaRef.current = null;
    startTimeRef.current = Date.now();
    setPhase('scanning');
    setDecodedValue('');
    setScanError('');

    async function init() {
      try {
        if (lib.key === 'html5-qrcode') {
          scannerRef.current = await startHtml5QrScanner('html5qr-container', handleResult, handleError);
        } else if (lib.key === 'zxing') {
          scannerRef.current = await startZXingScanner(videoRef.current, handleResult, handleError);
        } else if (lib.key === 'zbar') {
          scannerRef.current = await startZBarScanner(videoRef.current, canvasRef.current, handleResult, handleError);
        } else if (lib.key === 'zxing-wasm') {
          scannerRef.current = await startZXingWasmScanner(videoRef.current, canvasRef.current, handleResult, handleError);
        } else if (lib.key === 'barcodedetector') {
          scannerRef.current = await startBarcodeDetectorScanner(videoRef.current, handleResult, handleError);
        }
      } catch (e) {
        handleError(e);
      }
    }

    init();
    return () => { cleanupScanner(); };
  }, [libIndex, barcodeIndex]);

  const submitVerdict = useCallback((verdict) => {
    const meta = scanMetaRef.current || { responseTime: 5000, status: 'timeout' };
    onScanComplete({
      library:       lib.label,
      libraryKey:    lib.key,
      barcodeSlot:   barcode,
      decodedValue:  decodedValue || null,
      responseTime:  meta.responseTime,
      status:        meta.status,
      userVerdict:   verdict,
      timestamp:     new Date().toISOString(),
    });
  }, [lib, barcode, decodedValue, onScanComplete]);

  const needsVideo      = ['zxing', 'zxing-wasm', 'barcodedetector', 'zbar'].includes(lib.key);
  const needsCanvas     = ['zxing-wasm', 'zbar'].includes(lib.key);
  const needsHtml5Div   = lib.key === 'html5-qrcode';
  const isTimeout       = scanMetaRef.current?.status === 'timeout';
  const totalDone       = libIndex * 5 + barcodeIndex;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 32px' }}>

      {/* ── Fixed top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
        padding: '10px 20px', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
            background: lib.bg, color: lib.color,
            padding: '3px 9px', borderRadius: 5, letterSpacing: 0.5,
          }}>L{libIndex + 1}/5</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{lib.label}</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9CA3AF' }}>
          Barcode <span style={{ color: '#374151', fontWeight: 600 }}>{barcodeIndex + 1}</span>/5
          &nbsp;·&nbsp;
          Total <span style={{ color: '#374151', fontWeight: 600 }}>{totalDone + 1}</span>/25
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        position: 'fixed', top: 45, left: 0, right: 0,
        height: 3, background: '#F3F4F6', zIndex: 50,
      }}>
        <div style={{
          height: '100%',
          width: `${(totalDone / 25) * 100}%`,
          background: `linear-gradient(90deg, #2563EB, ${lib.color})`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── Main content ── */}
      <div className="fade-up" style={{ width: '100%', maxWidth: 480, marginTop: 76 }}>

        {/* Barcode target */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'inline-block',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 14, padding: '16px 40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <p style={{
              fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
              color: '#9CA3AF', marginBottom: 4, letterSpacing: 3, fontWeight: 600,
            }}>NOW SCAN</p>
            <p style={{
              fontSize: 58, fontWeight: 800, color: lib.color, lineHeight: 1,
              fontFamily: 'Syne, sans-serif',
            }}>{barcode}</p>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              Point camera at your barcode labeled{' '}
              <strong style={{ color: '#111827' }}>{barcode}</strong>
            </p>
          </div>
        </div>

        {/* ── SCANNING PHASE ── */}
        {phase === 'scanning' && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            {/* Camera viewport — intentionally dark for contrast */}
            <div
              className="camera-border scanline-container"
              style={{
                border: `2px solid ${lib.color}`,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#0A0A10',
                minHeight: 300,
                position: 'relative',
                boxShadow: `0 0 0 4px ${lib.bg}`,
              }}
            >
              {/* Corner crosshairs */}
              {[
                { top: 10, left: 10, borderTop: `3px solid ${lib.color}`, borderLeft: `3px solid ${lib.color}` },
                { top: 10, right: 10, borderTop: `3px solid ${lib.color}`, borderRight: `3px solid ${lib.color}` },
                { bottom: 10, left: 10, borderBottom: `3px solid ${lib.color}`, borderLeft: `3px solid ${lib.color}` },
                { bottom: 10, right: 10, borderBottom: `3px solid ${lib.color}`, borderRight: `3px solid ${lib.color}` },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 20, height: 20, zIndex: 20, ...s }} />
              ))}

              {needsHtml5Div && <div id="html5qr-container" style={{ width: '100%', minHeight: 300 }} />}
              {needsVideo && (
                <video
                  ref={videoRef}
                  style={{ width: '100%', display: 'block', minHeight: 300, objectFit: 'cover' }}
                  playsInline muted autoPlay
                />
              )}
              {needsCanvas && <canvas ref={canvasRef} style={{ display: 'none' }} />}

              {/* Library badge */}
              <div style={{
                position: 'absolute', bottom: 12, left: 12, zIndex: 30,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${lib.color}44`,
                borderRadius: 6, padding: '4px 10px',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: '#FFFFFF', fontWeight: 500,
              }}>{lib.label}</div>
            </div>

            {/* Countdown timer */}
            <div style={{
              position: 'absolute', top: -14, right: -14,
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              borderRadius: '50%', padding: 4, zIndex: 40,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <CountdownTimer
                key={timerKey}
                seconds={5}
                onTimeout={handleTimeout}
              />
            </div>
          </div>
        )}

        {/* Error banner */}
        {scanError && phase === 'scanning' && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '10px 14px', marginBottom: 14,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#DC2626',
          }}>
            ⚠ {scanError}
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && (
          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: 14, padding: 28, marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            {isTimeout || !decodedValue ? (
              <div style={{ textAlign: 'center', paddingBottom: 4 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FFF7ED', margin: '0 auto 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>⏱</div>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace', color: '#EA580C',
                  fontSize: 12, letterSpacing: 2, fontWeight: 600,
                }}>SCAN TIMED OUT</p>
                <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                  <strong style={{ color: lib.color }}>{lib.label}</strong> could not decode{' '}
                  <strong style={{ color: '#111827' }}>{barcode}</strong> within 5 seconds.
                </p>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                  color: '#9CA3AF', letterSpacing: 2, marginBottom: 10, fontWeight: 600,
                }}>DECODED VALUE</p>
                <div style={{
                  background: '#F9FAFB', borderRadius: 8, padding: '12px 16px',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
                  color: '#111827', wordBreak: 'break-all', marginBottom: 12,
                  border: '1px solid #E5E7EB',
                }}>
                  {decodedValue}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280' }}>
                  <span>Library: <span style={{ color: lib.color, fontWeight: 600 }}>{lib.label}</span></span>
                  <span>Time:{' '}
                    <span style={{ color: '#2563EB', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                      {scanMetaRef.current?.responseTime}ms
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Verdict / Continue */}
            <div style={{ marginTop: 24 }}>
              {isTimeout || !decodedValue ? (
                <button
                  onClick={() => submitVerdict('n/a')}
                  style={{
                    width: '100%', padding: '13px',
                    background: '#FFF7ED', border: '1.5px solid #FED7AA',
                    borderRadius: 9, color: '#EA580C', fontSize: 15,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >Continue →</button>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, textAlign: 'center' }}>
                    Is this the correct value for <strong style={{ color: '#111827' }}>{barcode}</strong>?
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => submitVerdict('correct')}
                      style={{
                        flex: 1, padding: '13px',
                        background: '#F0FDF4', border: '1.5px solid #BBF7D0',
                        borderRadius: 9, color: '#16A34A', fontSize: 16,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}
                    >✓  Correct</button>
                    <button
                      onClick={() => submitVerdict('wrong')}
                      style={{
                        flex: 1, padding: '13px',
                        background: '#FEF2F2', border: '1.5px solid #FECACA',
                        borderRadius: 9, color: '#DC2626', fontSize: 16,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}
                    >✗  Wrong</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Library hint */}
        {phase === 'scanning' && barcodeIndex === 0 && (
          <div style={{
            background: lib.bg, border: `1px solid ${lib.border}`,
            borderRadius: 10, padding: '10px 16px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: '#6B7280', textAlign: 'center',
          }}>
            Library {libIndex + 1} of 5 —{' '}
            <span style={{ color: lib.color, fontWeight: 600 }}>{lib.label}</span>{' '}
            — scan all 5 of your barcodes
          </div>
        )}
      </div>
    </div>
  );
}
