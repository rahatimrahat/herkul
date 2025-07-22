import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type { FingerprintData, FingerprintDetails } from '../types';

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
 * Calculates the Shannon entropy of fingerprint component values.
 * @param details Fingerprint component details
 */
const calculateEntropy = (details: FingerprintDetails): { entropy: number; max: number } => {
  const valuesString = Object.values(details)
    .map((d) => JSON.stringify(d.value))
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
const BEACON_ENDPOINT = 'https://your-serverless-function-endpoint.example.com/collect';

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
 * sends the data to a beacon endpoint, and returns it for UI display.
 * @returns A promise that resolves to the `FingerprintData`.
 */
export const generateVisitorId = async (): Promise<FingerprintData> => {
  // Load the FingerprintJS agent with monitoring enabled to gather
  // more detailed information about the environment
  const fp = await FingerprintJS.load({ monitor: true });

  // Get the visitor identifier and all available component details
  const result = await fp.get();

  // Add canvas fingerprint to the components
  const canvasFingerprint = getCanvasFingerprint();
  if (canvasFingerprint) {
    (result.components as FingerprintDetails).canvas = { value: canvasFingerprint };
  }

  const { entropy, max } = calculateEntropy(result.components as FingerprintDetails);

  const fingerprintData: FingerprintData = {
    visitorId: result.visitorId,
    details: result.components as FingerprintDetails,
    entropy,
    maxEntropy: max,
    confidence: result.confidence?.score ?? 0,
    version: result.version,
  };

  // Asynchronously send the collected data to the serverless function without waiting
  sendDataToBeacon(fingerprintData);
  
  // Return the data immediately to the UI
  return fingerprintData;
};