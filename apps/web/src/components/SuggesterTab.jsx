import { useState } from 'react';
import { WIND_DIRECTIONS, SHOT_SHAPES, suggestions, discColors, angleLabels, confidenceStyle } from '@frisbee-wind/core';

export default function SuggesterTab() {
  const [selectedWind, setSelectedWind] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);

  const results = selectedWind && selectedShot ? (suggestions[selectedShot]?.[selectedWind] || []) : null;

  return (
    <div>
      {/* Wind */}
      <div className="mb-5">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">1. What's the wind doing?</div>
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

      {/* Shot Shape */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">2. What shot shape do you need?</div>
        <div className="grid grid-cols-4 gap-2">
          {SHOT_SHAPES.map((shot) => (
            <button key={shot.id} onClick={() => setSelectedShot(shot.id)}
              className={`py-3 px-2 rounded border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedShot === shot.id
                  ? 'bg-purple-900/40 border-purple-500 text-purple-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
              }`}>
              <span className="text-3xl leading-none">{shot.icon}</span>
              <span className="text-xs font-bold leading-tight">{shot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedWind && selectedShot && (
        <div>
          {results && results.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                {results.length === 1 ? 'Recommendation' : 'Options — ranked best first'}
              </div>
              {results.map((r, i) => {
                const c = discColors[r.disc];
                const conf = confidenceStyle[r.confidence];
                return (
                  <div key={i} className={`rounded-lg border-2 p-4 ${c.border} ${c.bg}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {i === 0 && results.length > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white font-bold">#1</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${c.badge}`}>{r.disc}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-bold uppercase">{angleLabels[r.angle].label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${conf.cls}`}>{conf.label}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed mb-3">{r.summary}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Aim</span>
                      <span className={`text-sm font-bold ${c.accent}`}>{r.aimNote}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3">
                      <div className={`text-xs uppercase tracking-widest mb-1 ${c.accent}`}>💡 Tip</div>
                      <p className="text-sm text-gray-300 leading-relaxed">{r.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-5 text-center">
              <div className="text-2xl mb-2">🤔</div>
              <p className="text-sm text-gray-400">No clean recommendation for this combo. This wind + shot shape combination is very difficult — consider adjusting your approach or checking the Reference tab for deeper analysis.</p>
            </div>
          )}
        </div>
      )}

      {!selectedWind && !selectedShot && (
        <div className="text-center text-gray-600 text-sm mt-4">Select wind and shot shape above to get a suggestion.</div>
      )}
    </div>
  );
}
