
import React, { useState } from 'react';
import { Flame, Play, Pause, ChevronLeft, Brain, Sparkles, Wind } from 'lucide-react';
import { getMeditationScript } from '../geminiService';

const MeditationAI: React.FC = () => {
  const [activeScript, setActiveScript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [situation, setSituation] = useState('');

  const situations = [
    { label: 'Panic Attack', icon: <Wind />, color: 'bg-red-500' },
    { label: 'Exam Stress', icon: <Brain />, color: 'bg-indigo-500' },
    { label: 'Insomnia', icon: <Sparkles />, color: 'bg-slate-800' },
    { label: 'Heartbreak', icon: <Flame />, color: 'bg-rose-500' },
  ];

  const generateMeditation = async (sit: string) => {
    setIsLoading(true);
    setSituation(sit);
    const script = await getMeditationScript(sit);
    setActiveScript(script);
    setIsLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Situation-Based</p>
        <h1 className="text-5xl font-black text-slate-900 mb-4 font-serif">AI Meditation</h1>
        <p className="text-slate-400 text-lg font-medium">Personalized calmness for your current storm.</p>
      </div>

      {!activeScript ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {situations.map((s) => (
            <button 
              key={s.label}
              onClick={() => generateMeditation(s.label)}
              className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center group"
            >
              <div className={`p-6 rounded-[2rem] text-white mb-6 shadow-xl shadow-${s.color}/10 ${s.color}`}>
                {s.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 font-serif">{s.label}</h3>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[4rem] p-12 shadow-2xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Flame className="w-64 h-64" />
          </div>
          <button onClick={() => setActiveScript(null)} className="mb-8 flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900">
            <ChevronLeft className="w-5 h-5" /> Back to choices
          </button>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-8 font-serif">Relief for {situation}</h2>
            {isLoading ? (
              <div className="flex flex-col items-center py-20">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="font-bold text-slate-400 uppercase tracking-widest">Curating Peace...</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-10 bg-indigo-50 rounded-[3rem] text-indigo-900 text-xl italic leading-relaxed border border-indigo-100">
                  {activeScript}
                </div>
                <div className="flex justify-center gap-6">
                  <button className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl flex items-center gap-3">
                    <Play className="w-5 h-5 fill-current" /> Play Guide
                  </button>
                  <button onClick={() => generateMeditation(situation)} className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black shadow-sm flex items-center gap-3">
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationAI;
