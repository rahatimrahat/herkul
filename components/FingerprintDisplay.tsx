import React, { useState } from 'react';
import type { FingerprintData, FingerprintDetailValue } from '../types';

const ClipboardIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const DetailItem: React.FC<{ label: string; value: FingerprintDetailValue }> = ({ label, value }) => {
  let displayValue: string;
  if (value === null || value === undefined) {
    displayValue = 'N/A';
  } else if (Array.isArray(value)) {
    displayValue = value.length > 0 ? value.join(', ') : 'none';
  } else {
    displayValue = String(value);
  }
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors">
      <p className="text-sm font-medium text-cyan-400 break-words">{label}</p>
      <p className="text-base text-gray-300 break-all mt-1">{displayValue}</p>
    </div>
  );
};

const FingerprintDisplay: React.FC<{ data: FingerprintData }> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.visitorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-400">Unique Visitor ID</label>
        <div className="mt-1 flex rounded-lg shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <input
              type="text"
              readOnly
              value={data.visitorId}
              className="w-full bg-gray-900/50 border-gray-700 rounded-l-md p-3 text-gray-200 font-mono focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <button
            onClick={handleCopy}
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-700 text-sm font-medium rounded-r-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardIcon className="h-5 w-5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Fingerprint Components</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(data.details).map(([key, value]) => (
            <DetailItem key={key} label={key} value={value} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FingerprintDisplay;
