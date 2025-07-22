export type FingerprintDetailValue = {
  value: any;
  duration?: number;
  error?: Error;
};

export interface FingerprintDetails {
  [key: string]: FingerprintDetailValue;
}

export interface FingerprintData {
  visitorId: string;
  details: FingerprintDetails;
  /** Entropy score calculated from fingerprint values */
  entropy: number;
  /** Theoretical maximum entropy used for visualization */
  maxEntropy: number;
  /** FingerprintJS confidence score (0..1) */
  confidence: number;
  /** FingerprintJS algorithm version */
  version: string;
}