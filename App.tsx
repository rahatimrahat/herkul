import React, { useEffect } from 'react';
import { useFingerprint } from './hooks/useFingerprint';
import FingerprintDisplay from './components/FingerprintDisplay';
import EntropyVisualizer from './components/EntropyVisualizer';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { fingerprint, loading, error, generateFingerprint } = useFingerprint();

  useEffect(() => {
    generateFingerprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 pb-2">
            Client Fingerprint Pro
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-2">
            An advanced client-side identifier generator using high-entropy browser signals for unique visitor analytics.
          </p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 border border-gray-700 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-100">Your Unique Fingerprint</h2>
            <button
              onClick={generateFingerprint}
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            >
              {loading ? <Spinner /> : 'Regenerate Fingerprint'}
            </button>
          </div>

          {loading && !fingerprint && (
            <div className="flex flex-col items-center justify-center h-96">
              <Spinner size="lg" />
              <p className="mt-4 text-lg text-gray-400">Analyzing browser signals...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">An Error Occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {fingerprint && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex justify-center items-center">
                <EntropyVisualizer entropy={fingerprint.entropy} maxEntropy={40} />
              </div>
              <div className="lg:col-span-2">
                <FingerprintDisplay data={fingerprint} />
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-10 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Client Fingerprint Pro. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;