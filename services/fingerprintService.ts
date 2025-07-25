import FingerprintJS from '@fingerprintjs/fingerprintjs'; // NOTE: @fingerprintjs/fingerprintjs package is not installed. Ensure it's available in your environment.
import type { FingerprintData, FingerprintDetails, FingerprintDetailValue } from '../types';

// Define WebGL constants directly if they are not globally available or correctly typed
const WEBGL_UNMASKED_VENDOR_WEBGL = 37445;
const WEBGL_UNMASKED_RENDERER_WEBGL = 37446;

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
  interface Navigator {
    deviceMemory?: any;
    languages?: string[];
    connection?: {
      effectiveType?: string;
    };
  }
  // Define the interface for WEBGL_debug_renderer_info with the correct constants
  interface WEBGL_debug_renderer_info {
    readonly UNMASKED_VENDOR_WEBGL: number;
    readonly UNMASKED_RENDERER_WEBGL: number;
  }
  interface WebGLRenderingContext {
    getExtension(name: "WEBGL_debug_renderer_info"): WEBGL_debug_renderer_info | null;
    // Ensure getParameter accepts the specific numeric constants
    getParameter(pname: typeof WEBGL_UNMASKED_VENDOR_WEBGL | typeof WEBGL_UNMASKED_RENDERER_WEBGL): any;
  }
}

/**
 * Generates a canvas fingerprint.
 */
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const txt = "BrowserLeaks,com <canvas> 1.0";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);
    return canvas.toDataURL();
  } catch (error) {
    console.error('Error generating canvas fingerprint:', error);
    return '';
  }
};

/**
 * Generates a WebGL fingerprint.
 */
const getWebglFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      // Use the globally defined constants for getParameter
      const vendor = gl.getParameter(WEBGL_UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(WEBGL_UNMASKED_RENDERER_WEBGL);
      return `${vendor}_${renderer}`;
    }
    return '';
  } catch (error) {
    console.error('Error generating WebGL fingerprint:', error);
    return '';
  }
};

/**
 * Generates an AudioContext fingerprint.
 */
const getAudioContextFingerprint = (): string => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (typeof AudioContextClass === 'undefined') {
      return '';
    }
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.01);

    return `audioContext_processed_${audioContext.sampleRate}`;

  } catch (error) {
    console.error('Error generating AudioContext fingerprint:', error);
    return '';
  }
};


/**
 * Calculates the Shannon entropy of fingerprint component values.
 * @param details Fingerprint component details
 */
const calculateEntropy = (details: FingerprintDetails): { entropy: number; max: number } => {
  const valuesString = Object.values(details)
    .map((d) => {
      if (d && typeof d.value === 'string' && d.value.length > 0) {
        return d.value;
      }
      return '';
    })
    .join('');
  
  const length = valuesString.length;
  if (!length) {
    return { entropy: 0, max: 0 };
  }
  const freq: Record<string, number> = {};
  for (const char of valuesString) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }
  return { entropy, max: length * 8 };
};

// IMPORTANT: Replace this with your actual serverless function endpoint for data collection.
const BEACON_ENDPOINT = 'YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT';

/**
 * Asynchronously sends fingerprint data to a specified endpoint.
 * This function is designed to be non-blocking and will not interfere with page navigation.
 * @param data The fingerprint data to send.
 */
const sendDataToBeacon = (data: FingerprintData) => {
  const body = JSON.stringify(data);
  const blob = new Blob([body], { type: 'application/json' });

  const fallbackToFetch = () => {
    fetch(BEACON_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) {
          console.error(
            `Failed to send fingerprint data via fetch: ${res.status}`,
          );
        } else {
          console.log('Fingerprint data sent successfully via fetch.');
        }
      })
      .catch((err) => {
        console.error('Error sending fingerprint data via fetch:', err);
      });
  };

  if (navigator.sendBeacon) {
    try {
      const success = navigator.sendBeacon(BEACON_ENDPOINT, blob);
      if (!success) {
        console.warn('Fingerprint beacon could not be queued, falling back to fetch.');
        fallbackToFetch();
      } else {
        console.log('Fingerprint data sent successfully via beacon.');
      }
    } catch (e) {
      console.error('Error sending fingerprint beacon:', e);
      fallbackToFetch();
    }
  } else {
    console.warn('navigator.sendBeacon is not available in this browser; using fetch instead.');
    fallbackToFetch();
  }
};

/**
 * Generates a visitor identifier using the FingerprintJS library,
 * collects additional signals, sends the data to a beacon endpoint,
 * and returns it for UI display.
 * @returns A promise that resolves to the `FingerprintData`.
 */
export const generateVisitorId = async (): Promise<FingerprintData> => {
  const fp = await FingerprintJS.load({ monitor: true });

  const result = await fp.get();

  const canvasFingerprint = getCanvasFingerprint();
  if (canvasFingerprint) {
    (result.components as FingerprintDetails).canvas = { value: canvasFingerprint };
  }

  const webglFingerprint = getWebglFingerprint();
  if (webglFingerprint) {
    (result.components as FingerprintDetails).webgl = { value: webglFingerprint };
  }

  const audioContextFingerprint = getAudioContextFingerprint();
  if (audioContextFingerprint) {
    (result.components as FingerprintDetails).audioContext = { value: audioContextFingerprint };
  }

  const navigatorProps: Record<string, FingerprintDetailValue> = {};
  if (navigator.hardwareConcurrency) {
    navigatorProps['hardwareConcurrency'] = { value: navigator.hardwareConcurrency };
  }
  if (navigator.deviceMemory !== undefined) {
    navigatorProps['deviceMemory'] = { value: navigator.deviceMemory };
  }
  if (navigator.languages && navigator.languages.length > 0) {
    navigatorProps['languages'] = { value: navigator.languages };
  }
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      navigatorProps['timeZone'] = { value: timezone };
    }
  } catch (e) {
    console.error('Error getting timezone:', e);
  }
  
  Object.assign(result.components as FingerprintDetails, navigatorProps);

  const { entropy, max } = calculateEntropy(result.components as FingerprintDetails);

  const fingerprintData: FingerprintData = {
    visitorId: result.visitorId,
    details: result.components as FingerprintDetails,
    entropy,
    maxEntropy: max,
    confidence: result.confidence?.score ?? 0,
    version: result.version,
  };

  sendDataToBeacon(fingerprintData);
  
  return fingerprintData;
};
