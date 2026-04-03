import { useState } from 'react';
import {
  DEFAULT_THROW_PERSPECTIVE,
  TERRAIN_TYPES,
  discColors,
  getCategoryComparisonForCondition,
  getShotShapes,
  getWindDirections,
} from '@frisbee-wind/core';

export default function SuggesterTab({
  perspective = DEFAULT_THROW_PERSPECTIVE,
}) {
  const [selectedShot, setSelectedShot] = useState(null);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [selectedWind, setSelectedWind] = useState(null);
  const shotOptions = getShotShapes(perspective);
  const windDirections = getWindDirections(perspective);
  const windOptions = windDirections.filter((wind) => wind.id !== 'no_wind');
  const effectiveWind = selectedWind || 'no_wind';

  const comparisonResult = selectedShot && selectedTerrain
    ? getCategoryComparisonForCondition({
      shotId: selectedShot,
      terrainId: selectedTerrain,
      windId: effectiveWind,
      perspective,
    })
    : null;

  const results = comparisonResult?.categoryComparisons || [];

  return (
    <div>
      {/* Shot Shape */}
      <div className="mb-5">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">1. What shot shape do you need?</div>
        <div className="grid grid-cols-4 gap-2">
          {shotOptions.map((shot) => (
            <button key={shot.id} onClick={() => setSelectedShot(shot.id)}
              aria-label={`Select shot shape ${shot.label}`}
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

      {/* Terrain */}
      <div className="mb-5">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">2. Uphill, flat, or downhill?</div>
        <div className="grid grid-cols-3 gap-2">
          {TERRAIN_TYPES.map((terrain) => (
            <button key={terrain.id} onClick={() => setSelectedTerrain(terrain.id)}
              aria-label={`Select terrain ${terrain.label}`}
              className={`py-3 px-2 rounded border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedTerrain === terrain.id
                  ? 'bg-teal-900/40 border-teal-500 text-teal-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
              }`}>
              <span className="text-3xl leading-none">{terrain.icon}</span>
              <span className="text-xs font-bold leading-tight">{terrain.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wind */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">3. What's the wind doing? (Optional)</div>
        <div className="grid grid-cols-4 gap-2">
          {windOptions.map((wind) => (
            <button key={wind.id} onClick={() => setSelectedWind(prev => prev === wind.id ? null : wind.id)}
              aria-label={`Select wind ${wind.label}`}
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

      {/* Results */}
      {selectedShot && selectedTerrain && (
        <div>
          {results && results.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Category Comparison</div>
              {results.map((result) => {
                const c = discColors[result.disc] || discColors.stable;
                return (
                  <div key={result.category} className={`rounded-lg border-2 p-4 ${c.border} ${c.bg}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {result.isPrimaryMatch && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white font-bold">Primary Match</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${c.badge}`}>{result.disc}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-bold uppercase">{result.category}</span>
                    </div>
                    <div className="mb-3">
                      <div className={`text-xs uppercase tracking-widest mb-1 ${c.accent}`}>When to use</div>
                      <p className="text-sm text-gray-200 leading-relaxed">{result.whenToUse}</p>
                    </div>
                    <div className="border-t border-gray-700 pt-3">
                      <div className={`text-xs uppercase tracking-widest mb-1 ${c.accent}`}>Tradeoff</div>
                      <p className="text-sm text-gray-300 leading-relaxed">{result.tradeoff}</p>
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

      {!selectedShot && (
        <div className="text-center text-gray-600 text-sm mt-4">Select a shot shape above to get started.</div>
      )}

      {selectedShot && !selectedTerrain && (
        <div className="text-center text-gray-600 text-sm mt-4">Select terrain to continue.</div>
      )}
    </div>
  );
}
