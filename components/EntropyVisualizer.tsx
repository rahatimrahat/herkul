import React from 'react';

const EntropyVisualizer: React.FC<{ entropy: number; maxEntropy: number }> = ({ entropy, maxEntropy }) => {
  const percentage = maxEntropy ? Math.min(100, (entropy / maxEntropy) * 100) : 0;
  const circumference = 2 * Math.PI * 120; // 2 * pi * r
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = 'text-green-400 stroke-green-400';
  let level = 'Very High';
  if (percentage < 33) {
    colorClass = 'text-red-400 stroke-red-400';
    level = 'Low';
  } else if (percentage < 66) {
    colorClass = 'text-yellow-400 stroke-yellow-400';
    level = 'Medium';
  } else if (percentage < 90) {
    colorClass = 'text-cyan-400 stroke-cyan-400';
    level = 'High';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-full w-80 h-80 border-4 border-gray-700">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full" viewBox="0 0 280 280">
          <circle
            className="stroke-gray-700"
            cx="140"
            cy="140"
            r="120"
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset="0"
          />
          <circle
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            cx="140"
            cy="140"
            r="120"
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold ${colorClass}`}>
                {entropy.toFixed(2)}
            </span>
            <span className="text-lg font-medium text-gray-400">Entropy Score</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-2xl font-semibold text-gray-200">Uniqueness: <span className={colorClass}>{level}</span></p>
      </div>
    </div>
  );
};

export default EntropyVisualizer;
