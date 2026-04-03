import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
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
    <View>
      {/* Terrain */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Terrain</Text>
      <View className="flex-row gap-2 mb-4">
        {TERRAIN_TYPES.map((terrain) => {
          const active = selectedTerrain === terrain.id;
          return (
            <Pressable
              key={terrain.id}
              onPress={() => setSelectedTerrain(terrain.id)}
              accessibilityLabel={`Select terrain ${terrain.label}`}
              className={`flex-1 py-2 px-1 rounded border items-center ${
                active ? 'bg-teal-900/40 border-teal-500' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className={`text-xs font-bold uppercase ${active ? 'text-teal-300' : 'text-gray-500'}`}>
                {terrain.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Wind Direction */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Wind Direction</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {WIND_DIRECTIONS.map((wind) => {
          const active = selectedWind === wind.id;
          return (
            <Pressable
              key={wind.id}
              onPress={() => setSelectedWind(wind.id)}
              accessibilityLabel={`Select wind ${wind.label}`}
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
      <View className="gap-3">
        <Text className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          Reference for all shot shapes in this wind + terrain
        </Text>
        {results.map((result: any) => {
          const colors = discColors[result.disc] || discColors.stable;
          return (
            <View key={result.shotId} className={`rounded-lg border-2 p-4 ${colors.border} ${colors.bg}`}>
              <View className="flex-row flex-wrap gap-2 mb-4">
                <Text className="text-xs px-2 py-1 rounded bg-white/10 text-white font-bold uppercase">{shotLabelById[result.shotId]}</Text>
                <Text className={`text-xs px-2 py-1 rounded font-bold uppercase ${colors.badge}`}>{result.disc}</Text>
                <Text className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{result.category}</Text>
                <Text className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{result.angle}</Text>
              </View>
              <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>📡 Flight Explanation</Text>
              <Text className="text-sm text-gray-200 leading-relaxed mb-4">{result.summary}</Text>
              <Text className="text-xs text-gray-500 uppercase tracking-widest mb-1">Aim</Text>
              <Text className={`text-sm font-bold mb-4 ${colors.accent}`}>{result.aimNote}</Text>
              <View className="border-t border-gray-700 pt-4">
                <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>💡 Tips</Text>
                {result.tips.map((tip: string, index: number) => (
                  <Text key={index} className="text-sm text-gray-200 leading-relaxed">{`\u2022 ${tip}`}</Text>
                ))}
              </View>
            </View>
          );
        })}
        {results.length === 0 && (
          <View className="rounded-lg border border-gray-700 bg-gray-900 p-5 items-center">
            <Text className="text-sm text-gray-400 text-center">No reference data found for the selected condition.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
