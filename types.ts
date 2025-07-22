export type FingerprintDetailValue = string | number | boolean | readonly string[] | null;

export interface FingerprintDetails {
  [key: string]: FingerprintDetailValue;
}

export interface FingerprintData {
  visitorId: string;
  details: FingerprintDetails;
  entropy: number;
}
