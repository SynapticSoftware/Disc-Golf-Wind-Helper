import { useState } from 'react';
import {
  ALTERNATE_THROW_PERSPECTIVE,
  THROW_PERSPECTIVES,
} from '@frisbee-wind/core';
import ReferenceTab from './components/ReferenceTab.jsx';
import SuggesterTab from './components/SuggesterTab.jsx';
import useThrowPerspective from './hooks/useThrowPerspective.js';

export default function App() {
  const [tab, setTab] = useState('suggester');
  const { perspective, setPerspective, perspectiveError } = useThrowPerspective();
  const perspectiveLabel = perspective === ALTERNATE_THROW_PERSPECTIVE
    ? 'RHFH/LHBH'
    : 'RHBH/LHFH';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-mono">
      <div className="max-w-3xl mx-auto">

        <div className="mb-5 text-center">
          <div className="text-3xl mb-1">🥏</div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Disc Golf Wind Guide</h1>
          <p className="text-xs text-gray-500 mt-1">{perspectiveLabel} throws • Wind effects vary by disc speed and arm speed</p>
          <div className="mt-3 flex justify-center">
            <div className="inline-flex gap-1 rounded-lg bg-gray-900 p-1" role="group" aria-label="Throw perspective toggle">
              {THROW_PERSPECTIVES.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPerspective(option.id)}
                  aria-label={`Set throw perspective to ${option.label}`}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                    perspective === option.id
                      ? 'bg-sky-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {perspectiveError && (
            <p className="text-xs text-red-300 mt-2">{perspectiveError.userMessage}</p>
          )}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-lg">
          <button
            onClick={() => setTab('suggester')}
            className={`flex-1 py-2 px-3 rounded text-sm font-bold uppercase tracking-wide transition-all ${
              tab === 'suggester' ? 'bg-purple-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            🎯 Disc Suggester
          </button>
          <button
            onClick={() => setTab('reference')}
            className={`flex-1 py-2 px-3 rounded text-sm font-bold uppercase tracking-wide transition-all ${
              tab === 'reference' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            📋 Reference
          </button>
        </div>

        {tab === 'suggester' ? (
          <SuggesterTab perspective={perspective} />
        ) : (
          <ReferenceTab perspective={perspective} />
        )}
      </div>
    </div>
  );
}
