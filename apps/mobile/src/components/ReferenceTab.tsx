import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { WIND_DIRECTIONS, refData, discColors, angleLabels } from '@frisbee-wind/core';

export default function ReferenceTab() {
  const [selectedDisc, setSelectedDisc]   = useState<'understable' | 'stable' | 'overstable'>('stable');
  const [selectedAngle, setSelectedAngle] = useState<'hyzer' | 'flat' | 'anhyzer'>('flat');
  const [selectedWind, setSelectedWind]   = useState('headwind');

  const result = refData[selectedDisc][selectedAngle][selectedWind];
  const colors = discColors[selectedDisc];

  return (
    <View>
      {/* Disc Stability */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Disc Stability</Text>
      <View className="flex-row gap-2 mb-4">
        {(['understable', 'stable', 'overstable'] as const).map((disc) => {
          const c = discColors[disc];
          const active = selectedDisc === disc;
          return (
            <Pressable
              key={disc}
              onPress={() => setSelectedDisc(disc)}
              className={`flex-1 py-2 px-1 rounded border items-center ${
                active ? `${c.bg} ${c.border}` : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className={`text-xs font-bold uppercase ${active ? c.accent : 'text-gray-500'}`}>
                {disc}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Throw Angle */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Throw Angle</Text>
      <View className="flex-row gap-2 mb-4">
        {(['hyzer', 'flat', 'anhyzer'] as const).map((angle) => {
          const a = angleLabels[angle];
          const active = selectedAngle === angle;
          return (
            <Pressable
              key={angle}
              onPress={() => setSelectedAngle(angle)}
              className={`flex-1 py-2 px-1 rounded border items-center ${
                active ? 'bg-gray-700 border-gray-400' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{a.label}</Text>
              <Text className={`text-xs mt-0.5 ${active ? 'text-gray-300' : 'text-gray-600'}`}>{a.sub}</Text>
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

      {/* Result */}
      {result && (
        <View className={`rounded-lg border-2 p-4 ${colors.border} ${colors.bg}`}>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <Text className={`text-xs px-2 py-1 rounded font-bold uppercase ${colors.badge}`}>{selectedDisc}</Text>
            <Text className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{selectedAngle}</Text>
            <Text className="text-xs px-2 py-1 rounded bg-yellow-900/40 text-yellow-300 font-bold">
              {WIND_DIRECTIONS.find(w => w.id === selectedWind)?.label}
            </Text>
          </View>
          <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>📡 Expected Behavior</Text>
          <Text className="text-sm text-gray-200 leading-relaxed mb-4">{result.behavior}</Text>
          <View className="border-t border-gray-700 pt-4">
            <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>💡 Throwing Tip</Text>
            <Text className="text-sm text-gray-200 leading-relaxed">{result.tip}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
