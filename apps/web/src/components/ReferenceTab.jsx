import { useState } from 'react';
import { WIND_DIRECTIONS, TERRAIN_TYPES, SHOT_SHAPES, getRecommendationsForCondition, discColors } from '@frisbee-wind/core';

export default function ReferenceTab() {
  const [selectedTerrain, setSelectedTerrain] = useState('flat');
  const [selectedWind, setSelectedWind] = useState('no_wind');

  const shotLabelById = Object.fromEntries(SHOT_SHAPES.map((shot) => [shot.id, shot.label]));
  const results = getRecommendationsForCondition({
    windId: selectedWind,
    terrainId: selectedTerrain,
  });

  return (
    <div>
      {/* Terrain */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Terrain</div>
        <div className="grid grid-cols-3 gap-2">
          {TERRAIN_TYPES.map((terrain) => {
            return (
              <button key={terrain.id} onClick={() => setSelectedTerrain(terrain.id)}
                aria-label={`Select terrain ${terrain.label}`}
                className={`py-2 px-3 rounded border text-sm font-bold uppercase tracking-wide transition-all ${
                  selectedTerrain === terrain.id
                    ? 'bg-teal-900/40 border-teal-500 text-teal-300'
                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
                }`}>
                {terrain.label}
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
      <div className="space-y-3">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Reference for all shot shapes in this wind + terrain
        </div>
        {results.map((result) => {
          const colors = discColors[result.disc] || discColors.stable;
          return (
            <div key={result.shotId} className={`rounded-lg border-2 p-5 ${colors.border} ${colors.bg}`}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-white/10 text-white font-bold uppercase">{shotLabelById[result.shotId]}</span>
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${colors.badge}`}>{result.disc}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{result.category}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{result.angle}</span>
              </div>
              <div className="mb-4">
                <div className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>📡 Flight Explanation</div>
                <p className="text-sm text-gray-200 leading-relaxed">{result.summary}</p>
              </div>
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Aim</div>
                <p className={`text-sm font-bold ${colors.accent}`}>{result.aimNote}</p>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>💡 Tips</div>
                <ul className="text-sm text-gray-200 leading-relaxed list-disc list-inside space-y-1">
                  {result.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        {results.length === 0 && (
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-5 text-center">
            <p className="text-sm text-gray-400">No reference data found for the selected condition.</p>
          </div>
        )}
      </div>
    </div>
  );
}
