const LIBRARIES = [
  { name: 'html5-qrcode',    type: 'JS / WebRTC',      formats: '1D + 2D', color: '#2563EB', bg: '#EFF6FF' },
  { name: 'ZXing-js',        type: 'JS / WASM Port',   formats: '1D + 2D', color: '#0284C7', bg: '#F0F9FF' },
  { name: 'ZBar WASM',       type: 'WASM / Canvas',    formats: '1D + 2D',    color: '#0D9488', bg: '#F0FDFA' },
  { name: 'ZXing WASM',      type: 'WASM / C++ port',  formats: '1D + 2D',  color: '#7C3AED', bg: '#F5F3FF' },
  { name: 'BarcodeDetector', type: 'Native Browser API', formats: '1D + 2D', color: '#B45309', bg: '#FFFBEB' },
];

const card = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 14,
  padding: '22px 24px',
  marginBottom: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const sectionLabel = {
  fontSize: 10, letterSpacing: 1.5, color: '#9CA3AF',
  fontFamily: 'JetBrains Mono, monospace', marginBottom: 16, fontWeight: 600,
  textTransform: 'uppercase',
};

export default function InstructionsScreen({ tester, deviceInfo, onBegin }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#F4F6F9',
      padding: '40px 24px', display: 'flex', justifyContent: 'center',
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 660 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-block', marginBottom: 12,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: '#2563EB', letterSpacing: 2, fontWeight: 600,
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: 4, padding: '3px 10px',
          }}>TEST INSTRUCTIONS</div>
          <h2 style={{
            fontSize: 30, fontWeight: 800, color: '#111827',
            fontFamily: 'Syne, sans-serif', marginBottom: 8,
          }}>Before you begin</h2>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Hello{' '}
            <span style={{ color: '#2563EB', fontWeight: 600 }}>{tester.name}</span>
            {' '}from{' '}
            <span style={{ color: '#0284C7', fontWeight: 600 }}>{tester.company}</span>
          </p>
        </div>

        {/* Steps */}
        <div style={card}>
          <p style={sectionLabel}>Preparation Steps</p>
          {[
            'Collect 5 physical barcodes you use in your operations',
            'Label them B1, B2, B3, B4, B5 with a sticky note or marker',
            "You'll scan all 5 barcodes through each of 5 libraries (25 scans total)",
            'After each scan, confirm if the result is correct or wrong',
            "If a scan fails within 5 seconds, it's auto-marked as timeout",
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, marginBottom: i < 4 ? 14 : 0, alignItems: 'flex-start',
            }}>
              <div style={{
                minWidth: 26, height: 26, borderRadius: '50%',
                background: '#EFF6FF', border: '1.5px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                color: '#2563EB', fontWeight: 700, marginTop: 1, flexShrink: 0,
              }}>{i + 1}</div>
              <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Libraries */}
        <div style={card}>
          <p style={sectionLabel}>Libraries Under Test</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {LIBRARIES.map((lib, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#F9FAFB', border: '1px solid #F3F4F6',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                    color: lib.color, background: lib.bg,
                    padding: '2px 7px', borderRadius: 4,
                  }}>L{i + 1}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{lib.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{lib.type}</span>
                  <span style={{
                    fontSize: 10, color: lib.color, background: lib.bg,
                    fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px',
                    borderRadius: 4, fontWeight: 500,
                  }}>{lib.formats}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device info */}
        <div style={{
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        }}>
          <p style={{ color: '#2563EB', marginBottom: 10, letterSpacing: 1.5, fontWeight: 600, fontSize: 10 }}>
            DEVICE CAPTURED
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#4B5563', rowGap: 6 }}>
            <span>Browser: <span style={{ color: '#111827', fontWeight: 600 }}>{deviceInfo.browser}</span></span>
            <span>OS: <span style={{ color: '#111827', fontWeight: 600 }}>{deviceInfo.os}</span></span>
            <span>Device: <span style={{ color: '#111827', fontWeight: 600 }}>{deviceInfo.deviceType}</span></span>
            <span>Screen: <span style={{ color: '#111827', fontWeight: 600 }}>{deviceInfo.screenResolution}</span></span>
            <span>BarcodeDetector:{' '}
              <span style={{ color: deviceInfo.barcodeDetectorSupported ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                {deviceInfo.barcodeDetectorSupported ? '✓ Supported' : '✗ Not supported'}
              </span>
            </span>
          </div>
        </div>

        <button
          onClick={onBegin}
          style={{
            width: '100%', padding: '15px 24px',
            background: '#2563EB', border: 'none', borderRadius: 10,
            color: '#FFFFFF', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            boxShadow: '0 4px 12px rgba(37,99,235,0.28)',
            marginBottom: 40,
          }}
        >
          I have my 5 barcodes ready — Begin Testing →
        </button>
      </div>
    </div>
  );
}
