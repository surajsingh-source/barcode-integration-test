const RECIPIENT = 'surajsingh@gofynd.com';

function buildEmailBody(results, tester, deviceInfo) {
  const lines = [];

  lines.push('BARCODE INTEGRATION TEST — RESULTS LOG');
  lines.push('='.repeat(50));
  lines.push('');
  lines.push('TESTER INFORMATION');
  lines.push(`Name: ${tester.name}`);
  lines.push(`Company: ${tester.company}`);
  lines.push(`Test Date: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('DEVICE & BROWSER');
  lines.push(`Browser: ${deviceInfo.browser}`);
  lines.push(`OS: ${deviceInfo.os}`);
  lines.push(`Device Type: ${deviceInfo.deviceType}`);
  lines.push(`Screen Resolution: ${deviceInfo.screenResolution}`);
  lines.push(`Viewport: ${deviceInfo.viewportSize}`);
  lines.push(`BarcodeDetector API: ${deviceInfo.barcodeDetectorSupported ? 'Supported' : 'Not Supported'}`);
  lines.push(`User Agent: ${deviceInfo.userAgent}`);
  lines.push('');

  const libraries = ['html5-qrcode', 'ZXing-js', 'ZBar WASM', 'ZXing WASM', 'BarcodeDetector'];
  lines.push('LIBRARY PERFORMANCE SUMMARY');
  lines.push('-'.repeat(50));
  for (const lib of libraries) {
    const libResults = results.filter(r => r.library === lib);
    const successes  = libResults.filter(r => r.status === 'success');
    const timeouts   = libResults.filter(r => r.status === 'timeout');
    const correct    = libResults.filter(r => r.userVerdict === 'correct');
    const avgTime    = successes.length > 0
      ? Math.round(successes.reduce((s, r) => s + r.responseTime, 0) / successes.length)
      : null;

    lines.push('');
    lines.push(`Library: ${lib}`);
    lines.push(`  Scans: ${libResults.length}/5`);
    lines.push(`  Successful Decodes: ${successes.length}`);
    lines.push(`  Timeouts: ${timeouts.length}`);
    lines.push(`  User-Confirmed Correct: ${correct.length}`);
    lines.push(`  Accuracy Rate: ${libResults.length ? Math.round((correct.length / libResults.length) * 100) : 0}%`);
    lines.push(`  Avg Response Time: ${avgTime ? avgTime + 'ms' : 'N/A'}`);
    lines.push(`  Failure Rate: ${libResults.length ? Math.round((timeouts.length / libResults.length) * 100) : 0}%`);
  }

  lines.push('');
  lines.push('='.repeat(50));
  lines.push('DETAILED SCAN LOG');
  lines.push('='.repeat(50));
  results.forEach((r, i) => {
    lines.push('');
    lines.push(`[${i + 1}] ${r.library} — ${r.barcodeSlot}`);
    lines.push(`  Status: ${r.status}`);
    lines.push(`  Decoded Value: ${r.decodedValue || 'N/A'}`);
    lines.push(`  Response Time: ${r.responseTime}ms`);
    lines.push(`  User Verdict: ${r.userVerdict}`);
    lines.push(`  Timestamp: ${r.timestamp}`);
  });

  lines.push('');
  lines.push('='.repeat(50));
  lines.push('END OF REPORT');

  return lines.join('\n');
}

export default function SendResultsModal({ results, tester, deviceInfo, onClose }) {
  const subject    = encodeURIComponent(
    `Barcode Test Results — ${tester.company} — ${tester.name} — ${new Date().toLocaleDateString()}`
  );
  const body       = encodeURIComponent(buildEmailBody(results, tester, deviceInfo));
  const mailtoLink = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;

  const totalScans   = results.length;
  const successCount = results.filter(r => r.status === 'success').length;
  const timeoutCount = results.filter(r => r.status === 'timeout').length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(17,24,39,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(6px)',
    }}>
      <div className="fade-up" style={{
        background: '#FFFFFF', border: '1px solid #E5E7EB',
        borderRadius: 20, padding: 32, maxWidth: 460, width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#EFF6FF', margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>✉</div>
          <h3 style={{
            fontSize: 22, fontWeight: 800, color: '#111827',
            fontFamily: 'Syne, sans-serif',
          }}>Send Results</h3>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
            Results will be sent to the Fynd team for analysis
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
          {[
            { label: 'Total Scans', value: totalScans,   color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Successful',  value: successCount, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Timeouts',    value: timeoutCount, color: '#EA580C', bg: '#FFF7ED' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: bg, borderRadius: 10, padding: '12px 8px', textAlign: 'center',
            }}>
              <p style={{
                fontSize: 26, fontWeight: 800, color,
                fontFamily: 'JetBrains Mono, monospace',
              }}>{value}</p>
              <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Recipient */}
        <div style={{
          background: '#F9FAFB', border: '1px solid #E5E7EB',
          borderRadius: 8, padding: '10px 14px', marginBottom: 22,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#9CA3AF' }}>To:</span>
          <span style={{ color: '#2563EB', fontWeight: 600 }}>{RECIPIENT}</span>
        </div>

        {/* Note */}
        <p style={{
          fontSize: 12, color: '#6B7280', marginBottom: 22,
          lineHeight: 1.6, textAlign: 'center',
        }}>
          Clicking "Open Mail Client" will open your default email app with the full results pre-filled. Just hit Send.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px',
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              borderRadius: 9, color: '#374151', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >Cancel</button>
          <a
            href={mailtoLink}
            style={{
              flex: 2, padding: '12px',
              background: '#2563EB',
              borderRadius: 9, color: '#FFFFFF', fontSize: 14,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              textDecoration: 'none', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
            }}
          >✉ Open Mail Client</a>
        </div>
      </div>
    </div>
  );
}
