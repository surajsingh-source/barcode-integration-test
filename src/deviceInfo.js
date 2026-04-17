export function getDeviceInfo() {
  const ua = navigator.userAgent;

  // Browser
  let browser = 'Unknown';
  let browserVersion = '';
  if (/Edg\//.test(ua)) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  } else if (/Chrome\//.test(ua)) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  }

  // OS
  let os = 'Unknown';
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
  else if (/Android/.test(ua)) os = 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
  else if (/iPhone|iPad/.test(ua)) os = 'iOS ' + (ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
  else if (/Linux/.test(ua)) os = 'Linux';

  // Device type
  const isMobile = /Mobi|Android|iPhone|iPad/.test(ua);
  const isTablet = /iPad|Tablet/.test(ua) || (isMobile && window.innerWidth > 768);
  const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

  return {
    browser: `${browser} ${browserVersion}`.trim(),
    os,
    deviceType,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: ua,
    barcodeDetectorSupported: 'BarcodeDetector' in window,
    timestamp: new Date().toISOString(),
  };
}
