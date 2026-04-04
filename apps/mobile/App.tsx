import './global.css';
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ALTERNATE_THROW_PERSPECTIVE,
  THROW_PERSPECTIVES,
} from '@frisbee-wind/core';
import ReferenceTab from './src/components/ReferenceTab';
import SuggesterTab from './src/components/SuggesterTab';
import useThrowPerspective from './src/hooks/useThrowPerspective';

export default function App() {
  const [tab, setTab] = useState<'suggester' | 'reference'>('suggester');
  const { perspective, setPerspective, perspectiveError } = useThrowPerspective();
  const perspectiveLabel = perspective === ALTERNATE_THROW_PERSPECTIVE
    ? 'RHFH/LHBH'
    : 'RHBH/LHFH';

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="mt-4 mb-5 items-center">
          <Image
            source={require('./assets/logo-letterhead.png')}
            accessibilityLabel="DiscSense logo"
            className="h-16 w-72"
            resizeMode="contain"
          />
          <Text className="text-xs text-gray-500 mt-2 text-center">{perspectiveLabel} throws • Wind effects vary by disc speed and arm speed</Text>
          <View className="mt-3 flex-row gap-1 bg-gray-900 p-1 rounded-lg">
            {THROW_PERSPECTIVES.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setPerspective(option.id)}
                accessibilityLabel={`Set throw perspective to ${option.label}`}
                className={`px-3 py-1.5 rounded ${
                  perspective === option.id ? 'bg-sky-700' : ''
                }`}
              >
                <Text className={`text-xs font-bold uppercase tracking-wide ${
                  perspective === option.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {perspectiveError && (
            <Text className="text-xs text-red-300 mt-2 text-center">{perspectiveError.userMessage}</Text>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row gap-1 mb-6 bg-gray-900 p-1 rounded-lg">
          <Pressable
            onPress={() => setTab('suggester')}
            className={`flex-1 py-2 px-3 rounded items-center ${tab === 'suggester' ? 'bg-purple-700' : ''}`}
          >
            <Text className={`text-sm font-bold uppercase tracking-wide ${tab === 'suggester' ? 'text-white' : 'text-gray-500'}`}>
              🎯 Disc Suggester
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('reference')}
            className={`flex-1 py-2 px-3 rounded items-center ${tab === 'reference' ? 'bg-gray-600' : ''}`}
          >
            <Text className={`text-sm font-bold uppercase tracking-wide ${tab === 'reference' ? 'text-white' : 'text-gray-500'}`}>
              📋 Reference
            </Text>
          </Pressable>
        </View>

        {tab === 'suggester' ? (
          <SuggesterTab perspective={perspective} />
        ) : (
          <ReferenceTab perspective={perspective} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
