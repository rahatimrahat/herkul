import { useState, useCallback } from 'react';
import type { FingerprintData } from '../types.ts';
// Import FingerprintJS directly
import FingerprintJS from '@fingerprintjs/fingerprintjs';

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
    readonly UNMASKED_VENDOR_WEBGL: 37445;
    readonly UNMASKED_RENDERER_WEBGL: 37446;
  }
  interface WebGLRenderingContext {
    getExtension(name: "WEBGL_debug_renderer_info"): WEBGL_debug_renderer_info | null;
    // Ensure getParameter accepts the specific numeric constants
    getParameter(pname: typeof WEBGL_UNMASKED_VENDOR_WEBGL | typeof WEBGL_UNMASKED_RENDERER_WEBGL): any;
  }
}

// Helper function to get canvas fingerprint (browser-specific)
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

// Helper function to get WebGL fingerprint (browser-specific)
const getWebglFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
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

// Helper function to get AudioContext fingerprint (browser-specific)
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

// Helper function to get screen properties (browser-specific)
const getScreenProperties = (): { value: string } => {
  try {
    const screenProps = {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
    };
    return { value: JSON.stringify(screenProps) };
  } catch (error) {
    console.error('Error generating screen properties fingerprint:', error);
    return { value: '' };
  }
};

// Helper function to get platform information (browser-specific)
const getPlatformInfo = (): { value: string } => {
  try {
    const platformInfo = {
      platform: navigator.platform,
      vendor: navigator.vendor,
    };
    return { value: JSON.stringify(platformInfo) };
  } catch (error) {
    console.error('Error generating platform info fingerprint:', error);
    return { value: '' };
  }
};

// Helper function to calculate Shannon entropy (can be reused)
const calculateEntropy = (details: Record<string, { value: any }>): { entropy: number; max: number } => {
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
// For this example, we'll use the local backend API.
const BEACON_ENDPOINT = '/api/fingerprint';

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start as loading
  const [error, setError] = useState<string | null>(null);

  const generateFingerprint = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFingerprint(null); // Clear previous fingerprint

    try {
      // --- FingerprintJS Logic ---
      const fp = await FingerprintJS.load({ monitor: true });
      const result = await fp.get();

      const canvasFingerprint = getCanvasFingerprint();
      const webglFingerprint = getWebglFingerprint();
      const audioContextFingerprint = getAudioContextFingerprint();
      const screenProps = getScreenProperties();
      const platformInfo = getPlatformInfo();

      const components: Record<string, { value: any }> = {
        ...result.components, // Include components from FingerprintJS
        canvas: { value: canvasFingerprint },
        webgl: { value: webglFingerprint },
        audioContext: { value: audioContextFingerprint },
        screen: screenProps,
        platformInfo: platformInfo,
      };

      // Add navigator properties
      if (navigator.hardwareConcurrency) {
        components['hardwareConcurrency'] = { value: navigator.hardwareConcurrency };
      }
      if (navigator.deviceMemory !== undefined) {
        components['deviceMemory'] = { value: navigator.deviceMemory };
      }
      if (navigator.languages && navigator.languages.length > 0) {
        components['languages'] = { value: navigator.languages };
      }
      if (navigator.platform) {
        components['platform'] = { value: navigator.platform };
      }
      if (navigator.vendor) {
        components['vendor'] = { value: navigator.vendor };
      }
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone) {
          components['timeZone'] = { value: timezone };
        }
      } catch (e) {
        console.error('Error getting timezone:', e);
      }

      const { entropy, max: maxEntropy } = calculateEntropy(components);

      const fingerprintData: FingerprintData = {
        visitorId: result.visitorId,
        details: components,
        entropy,
        maxEntropy,
        confidence: result.confidence?.score ?? 0,
        version: result.version,
      };

      setFingerprint(fingerprintData);

      // --- Send data to backend ---
      await fetch(BEACON_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fingerprintData),
      });
      console.log('Fingerprint data sent to backend.');

    } catch (err) {
      console.error('Error during fingerprint generation or sending:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setFingerprint(null);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are empty as we don't use external state here

  return { fingerprint, loading, error, generateFingerprint };
};
