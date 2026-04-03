import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { WIND_DIRECTIONS, TERRAIN_TYPES, SHOT_SHAPES, getReferenceCardsForCondition, discColors } from '@frisbee-wind/core';

export default function ReferenceTab() {
  const [selectedTerrain, setSelectedTerrain] = useState<string | null>(null);
  const [selectedWind, setSelectedWind] = useState<string | null>(null);
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const [selectedReleaseAngle, setSelectedReleaseAngle] = useState<string | null>(null);

  const releaseAngleOptions = ['hyzer', 'flat', 'anhyzer'];
  const windOptions = WIND_DIRECTIONS.filter((wind) => wind.id !== 'no_wind');
  const effectiveWind = selectedWind || 'no_wind';

  const windLabelById = Object.fromEntries(WIND_DIRECTIONS.map((wind) => [wind.id, wind.label]));
  const terrainLabelById = Object.fromEntries(TERRAIN_TYPES.map((terrain) => [terrain.id, terrain.label]));
  const shotLabelById = Object.fromEntries(SHOT_SHAPES.map((shot) => [shot.id, shot.label]));
  const releaseAngleLabelById = Object.fromEntries(releaseAngleOptions.map((angle) => [angle, angle]));

  const formatWindValues = (values: string[]) => values
    .filter((value) => value !== 'no_wind')
    .map((value) => windLabelById[value] || value);

  const discTypes = getReferenceCardsForCondition({
    windId: effectiveWind,
    terrainId: selectedTerrain,
    shotId: selectedShot,
    releaseAngle: selectedReleaseAngle,
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
              onPress={() => setSelectedTerrain((prev) => prev === terrain.id ? null : terrain.id)}
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

      {/* Shot Shape */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Shot Shape</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {SHOT_SHAPES.map((shot) => {
          const active = selectedShot === shot.id;
          return (
            <Pressable
              key={shot.id}
              onPress={() => setSelectedShot((prev) => prev === shot.id ? null : shot.id)}
              accessibilityLabel={`Select shot shape ${shot.label}`}
              className={`w-[23%] py-3 rounded border items-center gap-1 ${
                active ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className="text-2xl leading-none">{shot.icon}</Text>
              <Text className={`text-xs font-bold uppercase text-center leading-tight ${active ? 'text-purple-300' : 'text-gray-500'}`}>
                {shot.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Release Angle */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Release Angle</Text>
      <View className="flex-row gap-2 mb-6">
        {releaseAngleOptions.map((angle) => {
          const active = selectedReleaseAngle === angle;
          return (
            <Pressable
              key={angle}
              onPress={() => setSelectedReleaseAngle((prev) => prev === angle ? null : angle)}
              accessibilityLabel={`Select release angle ${angle}`}
              className={`flex-1 py-2 rounded border items-center ${
                active ? 'bg-gray-700 border-gray-400' : 'bg-gray-900 border-gray-700'
              }`}
            >
              <Text className={`text-xs font-bold uppercase ${active ? 'text-white' : 'text-gray-500'}`}>
                {angle}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Wind Direction */}
      <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">Wind Direction</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {windOptions.map((wind) => {
          const active = selectedWind === wind.id;
          return (
            <Pressable
              key={wind.id}
              onPress={() => setSelectedWind((prev) => prev === wind.id ? null : wind.id)}
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

      {/* Disc Types */}
      <View className="gap-3">
        <Text className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          Disc Types and Explanations
        </Text>
        {discTypes.map((type: any) => {
          const colors = discColors[type.disc] || discColors.stable;
          const windExplainers = type.factorExplanations.wind
            .map((item: any) => ({
              ...item,
              visibleWindValues: formatWindValues(item.matchedValues),
            }))
            .filter((item: any) => item.visibleWindValues.length > 0);

          return (
            <View key={type.profileId} className={`rounded-lg border-2 p-4 ${colors.border} ${colors.bg}`}>
              <View className="flex-row flex-wrap gap-2 mb-4">
                <Text className={`text-xs px-2 py-1 rounded font-bold uppercase ${colors.badge}`}>{type.disc}</Text>
                <Text className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 font-bold uppercase">{type.category}</Text>
              </View>
              <View className="border-t border-gray-700 pt-3">
                <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>📡 What This Disc Does</Text>
                <Text className="text-sm text-gray-200 leading-relaxed">{type.baseExplanation}</Text>
              </View>

              <View className="border-t border-gray-700 mt-3 pt-3">
                <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>🧩 Situational Support</Text>
                {type.situationalSummaries.length > 0 ? (
                  type.situationalSummaries.map((summary: any, summaryIndex: number) => (
                    <View key={`summary-${summaryIndex}`} className="mb-2">
                      <Text className="text-sm text-gray-200 leading-relaxed">{`\u2022 ${summary.summary}`}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-400">
                    No situational recommendations for this disc profile under the selected filters.
                  </Text>
                )}
              </View>

              <View className="border-t border-gray-700 mt-3 pt-3 gap-3">
                {windExplainers.length > 0 && (
                  <View>
                    <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>🌬 Wind</Text>
                    {windExplainers.map((item: any, itemIndex: number) => (
                      <Text key={`wind-${itemIndex}`} className="text-sm text-gray-200 leading-relaxed">
                        {`\u2022 [${item.visibleWindValues.join(', ')}] ${item.text}`}
                      </Text>
                    ))}
                  </View>
                )}
                <View>
                  <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>⛰ Terrain</Text>
                  {type.factorExplanations.terrain.map((item: any, itemIndex: number) => (
                    <Text key={`terrain-${itemIndex}`} className="text-sm text-gray-200 leading-relaxed">
                      {`\u2022 [${item.matchedValues.map((value: string) => terrainLabelById[value] || value).join(', ')}] ${item.text}`}
                    </Text>
                  ))}
                </View>
                <View>
                  <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>🎯 Shot Shape</Text>
                  {type.factorExplanations.shot.map((item: any, itemIndex: number) => (
                    <Text key={`shot-${itemIndex}`} className="text-sm text-gray-200 leading-relaxed">
                      {`\u2022 [${item.matchedValues.map((value: string) => shotLabelById[value] || value).join(', ')}] ${item.text}`}
                    </Text>
                  ))}
                </View>
                <View>
                  <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>🧭 Release Angle</Text>
                  {type.factorExplanations.releaseAngle.map((item: any, itemIndex: number) => (
                    <Text key={`angle-${itemIndex}`} className="text-sm text-gray-200 leading-relaxed">
                      {`\u2022 [${item.matchedValues.map((value: string) => releaseAngleLabelById[value] || value).join(', ')}] ${item.text}`}
                    </Text>
                  ))}
                </View>
              </View>

              <View className="border-t border-gray-700 mt-3 pt-3">
                <Text className={`text-xs uppercase tracking-widest mb-1 ${colors.accent}`}>💡 Support Tips</Text>
                {type.tips.map((tip: string, tipIndex: number) => (
                  <Text key={`tip-${tipIndex}`} className="text-sm text-gray-200 leading-relaxed">{`\u2022 ${tip}`}</Text>
                ))}
              </View>
            </View>
          );
        })}
        {discTypes.length === 0 && (
          <View className="rounded-lg border border-gray-700 bg-gray-900 p-5 items-center">
            <Text className="text-sm text-gray-400 text-center">No matching disc types found for this filter combination.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
