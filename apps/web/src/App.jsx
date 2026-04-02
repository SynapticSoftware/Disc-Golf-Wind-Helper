import { useState } from 'react';
import ReferenceTab from './components/ReferenceTab.jsx';
import SuggesterTab from './components/SuggesterTab.jsx';

export default function App() {
  const [tab, setTab] = useState('suggester');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-mono">
      <div className="max-w-3xl mx-auto">

        <div className="mb-5 text-center">
          <div className="text-3xl mb-1">🥏</div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Disc Golf Wind Guide</h1>
          <p className="text-xs text-gray-500 mt-1">RHBH throws • Wind effects vary by disc speed and arm speed</p>
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

        {tab === 'suggester' ? <SuggesterTab /> : <ReferenceTab />}
      </div>
    </div>
  );
}
