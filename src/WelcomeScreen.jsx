import { useState } from 'react';

export default function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const canStart = name.trim() && company.trim();

  const inputStyle = (hasValue) => ({
    width: '100%',
    background: '#FFFFFF',
    border: `1.5px solid ${hasValue ? '#2563EB' : '#E5E7EB'}`,
    borderRadius: 8,
    padding: '11px 14px',
    color: '#111827',
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: hasValue ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#F4F6F9',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: 6, padding: '4px 12px', marginBottom: 20,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: '#2563EB', letterSpacing: 2, fontWeight: 600,
          }}>
            ◈ BETA INSTRUMENT v1.0
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 800, lineHeight: 1.1,
            color: '#111827', fontFamily: 'Syne, sans-serif', marginBottom: 12,
          }}>
            Barcode<br />Integration Test
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
            5 libraries · 5 barcodes · real performance data
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: 16, padding: 28,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.07)',
        }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 500,
              color: '#374151', marginBottom: 6,
            }}>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              style={inputStyle(name)}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 500,
              color: '#374151', marginBottom: 6,
            }}>Company Name</label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Enter your company"
              style={inputStyle(company)}
            />
          </div>

          <button
            onClick={() => canStart && onStart({ name: name.trim(), company: company.trim() })}
            disabled={!canStart}
            style={{
              width: '100%', padding: '13px 24px',
              background: canStart ? '#2563EB' : '#F3F4F6',
              border: 'none', borderRadius: 9,
              color: canStart ? '#FFFFFF' : '#9CA3AF',
              fontSize: 15, fontWeight: 600,
              cursor: canStart ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, box-shadow 0.15s',
              fontFamily: 'Inter, sans-serif',
              boxShadow: canStart ? '0 2px 8px rgba(37,99,235,0.28)' : 'none',
            }}
          >
            {canStart ? 'Start Test →' : 'Fill in your details'}
          </button>
        </div>

        {/* Info pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['5 Libraries', '5 Barcodes', '5s Timeout', 'Chrome Ready'].map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: '4px 12px',
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              borderRadius: 20, color: '#6B7280',
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
