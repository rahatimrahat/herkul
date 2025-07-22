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
  entropy: number;
}