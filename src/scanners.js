// Unified scanner interface for all 5 libraries
// Each scanner: { start(videoEl, onResult, onError), stop() }

// ─── 1. html5-qrcode ────────────────────────────────────────────────────────
export async function startHtml5QrScanner(containerId, onResult, onError) {
  const { Html5Qrcode } = await import('html5-qrcode');
  const scanner = new Html5Qrcode(containerId);
  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 15, qrbox: { width: 250, height: 250 } },
      (decodedText) => onResult(decodedText),
      () => {} // ignore per-frame errors
    );
  } catch (e) {
    onError(e);
  }
  return {
    stop: async () => {
      try { if (scanner.isScanning) await scanner.stop(); } catch (_) {}
    }
  };
}

// ─── 2. ZXing-js ─────────────────────────────────────────────────────────────
export async function startZXingScanner(videoEl, onResult, onError) {
  const { BrowserMultiFormatReader } = await import('@zxing/library');
  const reader = new BrowserMultiFormatReader();
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const deviceId = videoDevices.length > 0 ? videoDevices[videoDevices.length - 1].deviceId : undefined;
    reader.decodeFromVideoDevice(deviceId, videoEl, (result, err) => {
      if (result) onResult(result.getText());
    });
  } catch (e) {
    onError(e);
  }
  return {
    stop: () => {
      try { reader.reset(); } catch (_) {}
    }
  };
}

// ─── 3. ZBar WASM ────────────────────────────────────────────────────────────
export async function startZBarScanner(videoEl, canvasEl, onResult, onError) {
  const { scanImageData } = await import('@undecaf/zbar-wasm');
  let animFrame;
  let stream;
  let stopped = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 480 }
    });
    videoEl.srcObject = stream;
    await videoEl.play().catch(e => {
      if (e.name !== 'AbortError') throw e;
    });
  } catch (e) {
    onError(e);
    return { stop: () => {} };
  }

  if (stopped) return { stop: () => {} };

  const ctx = canvasEl.getContext('2d');

  async function tick() {
    if (stopped) return;
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
      canvasEl.width  = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
      try {
        const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        const results = await scanImageData(imageData);
        if (results.length > 0) {
          onResult(results[0].decode());
          return;
        }
      } catch (_) {}
    }
    animFrame = requestAnimationFrame(tick);
  }
  animFrame = requestAnimationFrame(tick);

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(animFrame);
      try { stream?.getTracks().forEach(t => t.stop()); } catch (_) {}
    }
  };
}

// ─── 4. ZXing WASM ───────────────────────────────────────────────────────────
export async function startZXingWasmScanner(videoEl, canvasEl, onResult, onError) {
  const { readBarcodesFromImageData } = await import('zxing-wasm/reader');
  let animFrame;
  let stream;
  let stopped = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 480 }
    });
    videoEl.srcObject = stream;
    await videoEl.play().catch(e => {
      if (e.name !== 'AbortError') throw e;
    });
  } catch (e) {
    onError(e);
    return { stop: () => {} };
  }

  if (stopped) return { stop: () => {} };

  const ctx = canvasEl.getContext('2d');

  async function tick() {
    if (stopped) return;
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
      canvasEl.width  = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
      try {
        const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        const results = await readBarcodesFromImageData(imageData);
        if (results.length > 0) {
          onResult(results[0].text);
          return;
        }
      } catch (_) {}
    }
    animFrame = requestAnimationFrame(tick);
  }
  animFrame = requestAnimationFrame(tick);

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(animFrame);
      try { stream?.getTracks().forEach(t => t.stop()); } catch (_) {}
    }
  };
}

// ─── 5. BarcodeDetector (Native) ─────────────────────────────────────────────
export async function startBarcodeDetectorScanner(videoEl, onResult, onError) {
  if (!('BarcodeDetector' in window)) {
    onError(new Error('BarcodeDetector API not supported in this browser'));
    return { stop: () => {} };
  }

  const detector = new window.BarcodeDetector({
    formats: ['qr_code', 'code_128', 'ean_13', 'upc_a', 'code_39', 'ean_8', 'upc_e', 'data_matrix', 'pdf417']
  });

  let animFrame;
  let stream;
  let stopped = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 480 }
    });
    videoEl.srcObject = stream;
    await videoEl.play().catch(e => {
      if (e.name !== 'AbortError') throw e;
    });
  } catch (e) {
    onError(e);
    return { stop: () => {} };
  }

  if (stopped) return { stop: () => {} };

  async function tick() {
    if (stopped) return;
    try {
      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        const barcodes = await detector.detect(videoEl);
        if (barcodes.length > 0) {
          onResult(barcodes[0].rawValue);
          return;
        }
      }
    } catch (_) {}
    animFrame = requestAnimationFrame(tick);
  }
  animFrame = requestAnimationFrame(tick);

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(animFrame);
      try { stream?.getTracks().forEach(t => t.stop()); } catch (_) {}
    }
  };
}
