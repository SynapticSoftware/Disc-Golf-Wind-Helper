import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { WIND_DIRECTIONS, SHOT_SHAPES, suggestions, discColors, angleLabels, confidenceStyle } from '@frisbee-wind/core';

export default function SuggesterTab() {
  const [selectedWind, setSelectedWind] = useState<string | null>(null);
  const [selectedShot, setSelectedShot] = useState<string | null>(null);

  const results = selectedWind && selectedShot
    ? (suggestions[selectedShot]?.[selectedWind] || [])
    : null;

  return (
    <View>
      {/* Wind */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">1. What's the wind doing?</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {WIND_DIRECTIONS.map((wind) => {
          const active = selectedWind === wind.id;
          return (
            <Pressable
              key={wind.id}
              onPress={() => setSelectedWind(wind.id)}
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

      {/* Shot Shape */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">2. What shot shape do you need?</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
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

      {/* Results */}
      {selectedWind && selectedShot && (
        <View>
          {results && results.length > 0 ? (
            <View className="gap-3">
              <Text className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                {results.length === 1 ? 'Recommendation' : 'Options — ranked best first'}
              </Text>
              {results.map((r, i) => {
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

      {!selectedWind && !selectedShot && (
        <Text className="text-center text-gray-600 text-sm mt-4">
          Select wind and shot shape above to get a suggestion.
        </Text>
      )}
    </View>
  );
}
