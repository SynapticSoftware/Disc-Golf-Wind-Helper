import { useState } from 'react';
import { WIND_DIRECTIONS, TERRAIN_TYPES, SHOT_SHAPES, getDiscTypesForCondition, discColors } from '@frisbee-wind/core';

export default function ReferenceTab() {
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [selectedWind, setSelectedWind] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);
  const [selectedReleaseAngle, setSelectedReleaseAngle] = useState(null);

  const releaseAngleOptions = ['hyzer', 'flat', 'anhyzer'];
  const discTypes = getDiscTypesForCondition({
    windId: selectedWind,
    terrainId: selectedTerrain,
    shotId: selectedShot,
    releaseAngle: selectedReleaseAngle,
  });

  return (
    <div>
      {/* Terrain */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Terrain</div>
        <div className="grid grid-cols-3 gap-2">
          {TERRAIN_TYPES.map((terrain) => {
            return (
              <button key={terrain.id} onClick={() => setSelectedTerrain((prev) => prev === terrain.id ? null : terrain.id)}
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

      {/* Shot Shape */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Shot Shape</div>
        <div className="grid grid-cols-4 gap-2">
          {SHOT_SHAPES.map((shot) => (
            <button
              key={shot.id}
              onClick={() => setSelectedShot((prev) => prev === shot.id ? null : shot.id)}
              aria-label={`Select shot shape ${shot.label}`}
              className={`py-3 px-2 rounded border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedShot === shot.id
                  ? 'bg-purple-900/40 border-purple-500 text-purple-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl leading-none">{shot.icon}</span>
              <span className="text-xs font-bold leading-tight">{shot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Release Angle */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Release Angle</div>
        <div className="grid grid-cols-3 gap-2">
          {releaseAngleOptions.map((angle) => (
            <button
              key={angle}
              onClick={() => setSelectedReleaseAngle((prev) => prev === angle ? null : angle)}
              aria-label={`Select release angle ${angle}`}
              className={`py-2 px-3 rounded border text-sm font-bold uppercase tracking-wide transition-all ${
                selectedReleaseAngle === angle
                  ? 'bg-gray-700 border-gray-400 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              {angle}
            </button>
          ))}
        </div>
      </div>

      {/* Wind Direction */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Wind Direction</div>
        <div className="grid grid-cols-4 gap-2">
          {WIND_DIRECTIONS.map((wind) => (
            <button key={wind.id} onClick={() => setSelectedWind((prev) => prev === wind.id ? null : wind.id)}
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

      {/* Disc Types */}
      <div className="space-y-3">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Disc Types and Explanations
        </div>
        {discTypes.map((type, index) => {
          const colors = discColors[type.disc] || discColors.stable;
          return (
            <div key={`${type.disc}-${type.category}-${index}`} className={`rounded-lg border-2 p-4 ${colors.border} ${colors.bg}`}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${colors.badge}`}>{type.disc}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{type.category}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>📡 What It Does Here</div>
                <ul className="text-sm text-gray-200 leading-relaxed list-disc list-inside space-y-1">
                  {type.explanations.map((explanation, explanationIndex) => (
                    <li key={explanationIndex}>{explanation}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        {discTypes.length === 0 && (
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-5 text-center">
            <p className="text-sm text-gray-400">No matching disc types found for this filter combination.</p>
          </div>
        )}
      </div>
    </div>
  );
}
