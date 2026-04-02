import { useState } from 'react';
import { WIND_DIRECTIONS, refData, discColors, angleLabels } from '@frisbee-wind/core';

export default function ReferenceTab() {
  const [selectedDisc, setSelectedDisc]   = useState('stable');
  const [selectedAngle, setSelectedAngle] = useState('flat');
  const [selectedWind, setSelectedWind]   = useState('headwind');

  const result = refData[selectedDisc][selectedAngle][selectedWind];
  const colors = discColors[selectedDisc];

  return (
    <div>
      {/* Disc Stability */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Disc Stability</div>
        <div className="grid grid-cols-3 gap-2">
          {['understable', 'stable', 'overstable'].map((disc) => {
            const c = discColors[disc];
            return (
              <button key={disc} onClick={() => setSelectedDisc(disc)}
                className={`py-2 px-3 rounded border text-sm font-bold uppercase tracking-wide transition-all ${
                  selectedDisc === disc
                    ? `${c.bg} ${c.border} ${c.accent}`
                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
                }`}>
                {disc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Throw Angle */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Throw Angle</div>
        <div className="grid grid-cols-3 gap-2">
          {['hyzer', 'flat', 'anhyzer'].map((angle) => {
            const a = angleLabels[angle];
            return (
              <button key={angle} onClick={() => setSelectedAngle(angle)}
                className={`py-2 px-3 rounded border text-sm transition-all ${
                  selectedAngle === angle
                    ? 'bg-gray-700 border-gray-400 text-white font-bold'
                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
                }`}>
                <div className="font-bold">{a.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{a.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wind Direction */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Wind Direction</div>
        <div className="grid grid-cols-4 gap-2">
          {WIND_DIRECTIONS.map((wind) => (
            <button key={wind.id} onClick={() => setSelectedWind(wind.id)}
              className={`py-3 px-2 rounded border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedWind === wind.id
                  ? 'bg-yellow-900/40 border-yellow-500 text-yellow-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
              }`}>
              <span className="text-3xl leading-none">{wind.icon}</span>
              <span className="text-xs font-bold leading-tight">{wind.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-lg border-2 p-5 ${colors.border} ${colors.bg}`}>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${colors.badge}`}>{selectedDisc}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{selectedAngle}</span>
            <span className="text-xs px-2 py-1 rounded bg-yellow-900/40 text-yellow-300 font-bold">
              {WIND_DIRECTIONS.find(w => w.id === selectedWind)?.label}
            </span>
          </div>
          <div className="mb-4">
            <div className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>📡 Expected Behavior</div>
            <p className="text-sm text-gray-200 leading-relaxed">{result.behavior}</p>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <div className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>💡 Throwing Tip</div>
            <p className="text-sm text-gray-200 leading-relaxed">{result.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
