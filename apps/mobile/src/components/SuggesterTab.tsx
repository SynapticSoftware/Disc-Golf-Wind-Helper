import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { WIND_DIRECTIONS, SHOT_SHAPES, TERRAIN_TYPES, suggestions, terrainAdjust, discColors, angleLabels, confidenceStyle } from '@frisbee-wind/core';

export default function SuggesterTab() {
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const [selectedTerrain, setSelectedTerrain] = useState<string | null>(null);
  const [selectedWind, setSelectedWind] = useState<string | null>(null);

  const baseResults = selectedWind && selectedShot
    ? (suggestions[selectedShot]?.[selectedWind] || [])
    : null;
  const results = baseResults ? terrainAdjust(baseResults, selectedTerrain) : null;

  return (
    <View>
      {/* Shot Shape */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">1. What shot shape do you need?</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {SHOT_SHAPES.map((shot) => {
          const active = selectedShot === shot.id;
          return (
            <Pressable
              key={shot.id}
              onPress={() => setSelectedShot(shot.id)}
              className={`w-[23%] py-3 rounded border items-center gap-1 ${
                active ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className="text-2xl leading-none">{shot.icon}</Text>
              <Text className={`text-xs font-bold text-center leading-tight ${active ? 'text-purple-300' : 'text-gray-500'}`}>
                {shot.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Terrain */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">2. Uphill, flat, or downhill?</Text>
      <View className="flex-row gap-2 mb-5">
        {TERRAIN_TYPES.map((terrain) => {
          const active = selectedTerrain === terrain.id;
          return (
            <Pressable
              key={terrain.id}
              onPress={() => setSelectedTerrain(terrain.id)}
              className={`flex-1 py-3 rounded border items-center gap-1 ${
                active ? 'bg-teal-900/40 border-teal-500' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className="text-2xl leading-none">{terrain.icon}</Text>
              <Text className={`text-xs font-bold text-center leading-tight ${active ? 'text-teal-300' : 'text-gray-500'}`}>
                {terrain.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Wind */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">3. What's the wind doing?</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {WIND_DIRECTIONS.map((wind) => {
          const active = selectedWind === wind.id;
          return (
            <Pressable
              key={wind.id}
              onPress={() => setSelectedWind(prev => prev === wind.id ? null : wind.id)}
              className={`w-[23%] py-3 rounded border items-center gap-1 ${
                active ? 'bg-yellow-900/40 border-yellow-500' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className="text-2xl leading-none">{wind.icon}</Text>
              <Text className={`text-xs font-bold text-center leading-tight ${active ? 'text-yellow-300' : 'text-gray-500'}`}>
                {wind.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results */}
      {selectedShot && selectedWind && (
        <View>
          {results && results.length > 0 ? (
            <View className="gap-3">
              <Text className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                {results.length === 1 ? 'Recommendation' : 'Options — ranked best first'}
              </Text>
              {results.map((r: any, i: number) => {
                const c = discColors[r.disc];
                const conf = confidenceStyle[r.confidence];
                return (
                  <View key={i} className={`rounded-lg border-2 p-4 ${c.border} ${c.bg}`}>
                    <View className="flex-row flex-wrap items-center gap-2 mb-3">
                      {i === 0 && results.length > 1 && (
                        <Text className="text-xs px-2 py-0.5 rounded bg-white/10 text-white font-bold">#1</Text>
                      )}
                      <Text className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${c.badge}`}>{r.disc}</Text>
                      <Text className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-bold uppercase">
                        {angleLabels[r.angle].label}
                      </Text>
                      <Text className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${conf.cls}`}>{conf.label}</Text>
                    </View>
                    <Text className="text-sm text-gray-200 leading-relaxed mb-3">{r.summary}</Text>
                    <View className="flex-row items-center gap-2 mb-3">
                      <Text className="text-xs text-gray-500 uppercase tracking-widest">Aim</Text>
                      <Text className={`text-sm font-bold ${c.accent}`}>{r.aimNote}</Text>
                    </View>
                    <View className="border-t border-gray-700 pt-3">
                      <Text className={`text-xs uppercase tracking-widest mb-1 ${c.accent}`}>💡 Tip</Text>
                      <Text className="text-sm text-gray-300 leading-relaxed">{r.tip}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="rounded-lg border border-gray-700 bg-gray-900 p-5 items-center">
              <Text className="text-2xl mb-2">🤔</Text>
              <Text className="text-sm text-gray-400 text-center">
                No clean recommendation for this combo. This wind + shot shape combination is very difficult — consider adjusting your approach or checking the Reference tab.
              </Text>
            </View>
          )}
        </View>
      )}

      {!selectedShot && (
        <Text className="text-center text-gray-600 text-sm mt-4">
          Select a shot shape above to get started.
        </Text>
      )}

      {selectedShot && !selectedWind && (
        <Text className="text-center text-gray-600 text-sm mt-4">
          Select a wind direction to get disc recommendations.
        </Text>
      )}
    </View>
  );
}
