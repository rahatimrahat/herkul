import { useState, useCallback } from 'react';
import type { FingerprintData } from '../types';
import { generateVisitorId } from '../services/fingerprintService';

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateFingerprint = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateVisitorId();
      setFingerprint(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during fingerprinting.');
      setFingerprint(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { fingerprint, loading, error, generateFingerprint };
};
