import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type { FingerprintData, FingerprintDetails } from '../types';

// IMPORTANT: Replace this with your actual serverless function endpoint for data collection.
const BEACON_ENDPOINT = 'https://your-serverless-function-endpoint.example.com/collect';

/**
 * Asynchronously sends fingerprint data to a specified endpoint.
 * This function is designed to be non-blocking and will not interfere with page navigation.
 * @param data The fingerprint data to send.
 */
const sendDataToBeacon = (data: FingerprintData) => {
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    try {
      // sendBeacon returns false if the browser is unable to queue the request.
      const success = navigator.sendBeacon(BEACON_ENDPOINT, blob);
      if (!success) {
        console.warn('Fingerprint beacon could not be queued.');
      }
    } catch (e) {
      console.error('Error sending fingerprint beacon:', e);
    }
  } else {
    console.warn('navigator.sendBeacon is not available in this browser.');
  }
};

/**
 * Generates a visitor identifier using the FingerprintJS library,
 * sends the data to a beacon endpoint, and returns it for UI display.
 * @returns A promise that resolves to the `FingerprintData`.
 */
export const generateVisitorId = async (): Promise<FingerprintData> => {
  // Load the FingerprintJS agent
  const fp = await FingerprintJS.load();
  
  // Get the visitor identifier and detailed components
  const result = await fp.get();
  
  const fingerprintData: FingerprintData = {
    visitorId: result.visitorId,
    details: result.components,
    // Calculate entropy based on the number of components successfully gathered
    entropy: Object.keys(result.components).length,
  };

  // Asynchronously send the collected data to the serverless function without waiting
  sendDataToBeacon(fingerprintData);
  
  // Return the data immediately to the UI
  return fingerprintData;
};