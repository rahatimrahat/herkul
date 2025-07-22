import React, { useEffect } from 'react';

const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      aria-labelledby="privacy-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 id="privacy-modal-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Privacy & Security at the Core
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close privacy information modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-gray-300">
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg text-cyan-400 mb-2">Our Commitment (The "Why")</h3>
            <p>
              This application operates on the principle of <strong className="text-white">"legitimate interest"</strong>. This allows us to process data to protect services and users from harm, such as preventing fraud and blocking malicious bots. We conduct a careful balancing test to ensure our interests don't override your fundamental rights. Your privacy is paramount.
            </p>
          </div>

          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg text-cyan-400 mb-2">Transparency & Data Minimization (The "What")</h3>
            <p className="mb-3">
              We believe in full transparency. To generate a stable and unique identifier, we use the open-source <strong className="text-white">FingerprintJS</strong> library to collect signals from your browser. This data is strictly necessary for the purpose of identification and is limited to signals like:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Browser & OS Details:</strong> User agent, language, platform, plugins.</li>
              <li><strong className="text-gray-300">Hardware Information:</strong> CPU cores, memory, screen resolution, touch points.</li>
              <li><strong className="text-gray-300">Rendered Graphics:</strong> Canvas and WebGL rendering fingerprints.</li>
              <li><strong className="text-gray-300">Audio/Visual Stack:</strong> Audio context and available speech voices.</li>
              <li><strong className="text-gray-300">Fonts:</strong> A list of available system fonts.</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg text-cyan-400 mb-2">Uncompromising Security (The "How")</h3>
            <p className="mb-3">Your data's security is non-negotiable. We achieve this through:</p>
            <ul className="space-y-3">
                <li>
                    <strong className="text-white block">Client-Side Processing:</strong>
                    <span className="text-gray-400"> All fingerprinting calculations happen directly within your browser using the FingerprintJS library.</span>
                </li>
                <li>
                    <strong className="text-white block">Cryptographic Hashing:</strong>
                    <span className="text-gray-400"> The library combines the collected data points and converts them into a non-reversible cryptographic hash (the "Visitor ID"). The original information cannot be reverse-engineered from the ID.</span>
                </li>
                <li>
                    <strong className="text-white block">Asynchronous Data Transfer:</strong>
                    <span className="text-gray-400"> The final fingerprint data is sent to a server for consolidation using `navigator.sendBeacon`, which does not interfere with your browsing and ensures efficient data handling.</span>
                </li>
            </ul>
          </div>
        </div>

         <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm z-10 px-6 py-3 border-t border-gray-700 flex justify-end">
             <button
                onClick={onClose}
                className="px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700"
              >
                Close
              </button>
         </div>
      </div>
    </div>
  );
};

export default PrivacyModal;