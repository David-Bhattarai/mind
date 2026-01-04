
import React, { useState } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, CloudRain, Trees, Coffee, Waves } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMood, setActiveMood] = useState('Rainforest');

  const moods = [
    { name: 'Rainforest', icon: <Trees />, color: 'bg-emerald-500' },
    { name: 'Thunderstorm', icon: <CloudRain />, color: 'bg-indigo-600' },
    { name: 'Lo-fi Cafe', icon: <Coffee />, color: 'bg-orange-600' },
    { name: 'Ocean Waves', icon: <Waves />, color: 'bg-blue-500' },
  ];

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="mb-12">
        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Mood Audio</p>
        <h1 className="text-5xl font-black text-slate-900 mb-4 font-serif">Sound Therapy</h1>
        <p className="text-slate-400 text-lg font-medium">Binaural beats and organic soundscapes.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
           {moods.map(mood => (
             <button 
               key={mood.name}
               onClick={() => setActiveMood(mood.name)}
               className={`w-full p-6 rounded-[2rem] border transition-all flex items-center gap-4 ${activeMood === mood.name ? 'bg-white border-indigo-200 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm opacity-60'}`}
             >
               <div className={`p-4 rounded-2xl ${mood.color} text-white`}>
                 {mood.icon}
               </div>
               <span className="font-bold text-slate-800">{mood.name}</span>
             </button>
           ))}
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
           <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
           </div>

           <div className="relative z-10 w-full flex flex-col items-center">
              <div className="w-32 h-32 bg-white/10 rounded-[3rem] backdrop-blur-xl border border-white/10 flex items-center justify-center mb-10 shadow-2xl">
                 <Music className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-black mb-2 font-serif">{activeMood}</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-12">Active Soundscape</p>

              <div className="w-full h-1 bg-white/10 rounded-full mb-12 overflow-hidden relative">
                 <div className={`h-full bg-indigo-500 transition-all duration-1000 ${isPlaying ? 'w-2/3' : 'w-0'}`}></div>
              </div>

              <div className="flex items-center gap-10">
                 <button className="text-white/40 hover:text-white transition-colors"><SkipForward className="w-8 h-8 rotate-180" /></button>
                 <button 
                   onClick={() => setIsPlaying(!isPlaying)}
                   className="p-10 bg-white text-slate-900 rounded-full shadow-2xl transform hover:scale-110 transition-all active:scale-95"
                 >
                   {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current" />}
                 </button>
                 <button className="text-white/40 hover:text-white transition-colors"><SkipForward className="w-8 h-8" /></button>
              </div>

              <div className="mt-12 flex items-center gap-4 text-white/40">
                 <Volume2 className="w-5 h-5" />
                 <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-white/30"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
