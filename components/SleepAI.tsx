
import React, { useState } from 'react';
import { Moon, Star, Clock, Zap, CheckCircle, ChevronRight } from 'lucide-react';
import { getSleepRoutine } from '../geminiService';

const SleepAI: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [routine, setRoutine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const issues = ["Waking up at night", "Can't fall asleep", "Nightmares", "Morning Grogginess"];

  const buildRoutine = async (issue: string) => {
    setIsLoading(true);
    setSelectedIssue(issue);
    const data = await getSleepRoutine(issue);
    setRoutine(data);
    setIsLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="mb-12">
        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Diagnostic</p>
        <h1 className="text-5xl font-black text-slate-900 mb-4 font-serif">Sleep Repair AI</h1>
        <p className="text-slate-400 text-lg font-medium">Scientific routines for deep, restorative rest.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 font-serif">What's your sleep issue?</h3>
          {issues.map(issue => (
            <button 
              key={issue}
              onClick={() => buildRoutine(issue)}
              className={`w-full p-8 rounded-[2.5rem] border text-left transition-all flex items-center justify-between group ${selectedIssue === issue ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}
            >
              <span className="font-bold text-lg">{issue}</span>
              <ChevronRight className={`w-5 h-5 ${selectedIssue === issue ? 'text-indigo-400' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative min-h-[400px] flex flex-col items-center justify-center text-center">
          {!routine ? (
            <div className="opacity-40 flex flex-col items-center">
              <Moon className="w-20 h-20 mb-6 text-slate-300" />
              <p className="font-bold text-slate-400">Select an issue to build your routine</p>
            </div>
          ) : isLoading ? (
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-full text-left animate-in slide-in-from-right-4 duration-500">
               <div className="p-4 bg-indigo-50 rounded-2xl w-fit mb-6 text-indigo-600">
                  <Star className="w-6 h-6 fill-current" />
               </div>
               <h4 className="text-2xl font-black text-slate-900 mb-6 font-serif">Your Sleep Solution</h4>
               <div className="prose prose-slate max-w-none mb-10 text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
                 {routine}
               </div>
               <div className="p-6 bg-slate-50 rounded-[2rem] flex items-center gap-4">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-600">Added to your midnight logs</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepAI;
