const LIBRARY_INFO = [
  { key: 'html5-qrcode',    label: 'html5-qrcode',    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', desc: 'JS / WebRTC based scanner' },
  { key: 'zxing',           label: 'ZXing-js',          color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', desc: 'Port of Java ZXing library' },
  { key: 'zbar',            label: 'ZBar WASM',           color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', desc: 'WebAssembly ZBar port' },
  { key: 'zxing-wasm',      label: 'ZXing WASM',          color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', desc: 'ZXing-C++ compiled to WebAssembly' },
  { key: 'barcodedetector', label: 'BarcodeDetector',    color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', desc: 'Native Chrome browser API' },
];

export default function LibraryTransitionScreen({ libIndex, onContinue }) {
  const lib  = LIBRARY_INFO[libIndex];
  const prev = libIndex > 0 ? LIBRARY_INFO[libIndex - 1] : null;

  return (
    <div style={{
      minHeight: '100vh', background: '#F4F6F9',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        {/* Completed badge */}
        {prev && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 20, padding: '6px 16px', marginBottom: 28,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#16A34A', fontWeight: 600,
          }}>
            ✓ {prev.label} complete
          </div>
        )}

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {LIBRARY_INFO.map((l, i) => (
            <div key={i} style={{
              width: i === libIndex ? 28 : 8,
              height: 8, borderRadius: 4,
              background: i < libIndex ? '#16A34A' : i === libIndex ? l.color : '#E5E7EB',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Library card */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${lib.border}`,
          borderTop: `4px solid ${lib.color}`,
          borderRadius: 16, padding: '32px 36px', marginBottom: 24,
          boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
        }}>
          <p style={{
            fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
            color: '#9CA3AF', letterSpacing: 2, marginBottom: 18, fontWeight: 600,
          }}>UP NEXT — LIBRARY {libIndex + 1} OF 5</p>

          <div style={{
            display: 'inline-block',
            background: lib.bg, border: `1px solid ${lib.border}`,
            borderRadius: 10, padding: '10px 28px', marginBottom: 14,
          }}>
            <p style={{
              fontSize: 26, fontWeight: 800, color: lib.color,
              fontFamily: 'Syne, sans-serif', lineHeight: 1,
            }}>{lib.label}</p>
          </div>

          <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 24 }}>{lib.desc}</p>

          <div style={{
            background: '#F9FAFB', border: '1px solid #F3F4F6',
            borderRadius: 10, padding: '12px 16px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#6B7280', textAlign: 'left', lineHeight: 1.7,
          }}>
            📋 &nbsp;Have your 5 barcodes (B1–B5) ready.<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;You'll scan the same barcodes again with this library.
          </div>
        </div>

        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '14px',
            background: lib.color, border: 'none', borderRadius: 12,
            color: '#FFFFFF', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            boxShadow: `0 4px 12px ${lib.color}44`,
          }}
        >
          Start {lib.label} →
        </button>
      </div>
    </div>
  );
}
