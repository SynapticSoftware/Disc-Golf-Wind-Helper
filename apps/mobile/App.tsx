import './global.css';
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ReferenceTab from './src/components/ReferenceTab';
import SuggesterTab from './src/components/SuggesterTab';

export default function App() {
  const [tab, setTab] = useState<'suggester' | 'reference'>('suggester');

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="mt-4 mb-5 items-center">
          <Text className="text-3xl mb-1">🥏</Text>
          <Text className="text-xl font-bold tracking-widest text-white uppercase">Disc Golf Wind Guide</Text>
          <Text className="text-xs text-gray-500 mt-1">RHBH throws • Wind effects vary by disc speed and arm speed</Text>
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

        {tab === 'suggester' ? <SuggesterTab /> : <ReferenceTab />}
      </ScrollView>
    </SafeAreaView>
  );
}
