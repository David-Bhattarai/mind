
import React, { useState, useEffect } from 'react';
import { Target, BookOpen, Utensils, Zap, Activity, Star, ArrowRight, Award, ChevronLeft, ImageIcon, Compass, Globe, Brain, Mic, Layout, Coffee, CheckCircle } from 'lucide-react';
import { API } from '../api';
import PaymentHub from './PaymentHub';
import NeuralFrontier from './NeuralFrontier';

const ProfessionalFrontier: React.FC = () => {
  const [user, setUser] = useState<any>(API.auth.getCurrentUser());
  const [healthScore, setHealthScore] = useState(0);
  const [quests, setQuests] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const score = await API.analytics.getHealthScore();
      setHealthScore(score);
      setQuests(API.modules.quests.getDaily());
    };
    init();

    const handleSessionUpdate = () => setUser(API.auth.getCurrentUser());
    window.addEventListener('storage', handleSessionUpdate);
    return () => window.removeEventListener('storage', handleSessionUpdate);
  }, []);

  const completeQuest = async (q: any) => {
    const res = await API.modules.quests.complete(q.id, q.xp);
    if (res.status === 200) {
      alert(`CONGRATS: +${q.xp} XP Earned! Check your level.`);
      setQuests(prev => prev.filter(item => item.id !== q.id));
    }
  };

  const modules = [
    { id: 'journal', name: 'Neural Journal', icon: <BookOpen />, desc: 'Sentiment-aware log.', color: 'bg-indigo-600' },
    { id: 'art', name: 'Art Therapy', icon: <ImageIcon />, desc: 'Mood to visual.', color: 'bg-emerald-500' },
    { id: 'roadmap', name: 'Growth Roadmap', icon: <Compass />, desc: 'Wellness plans.', color: 'bg-amber-500' },
    { id: 'nutrition', name: 'Nutrition AI', icon: <Coffee />, desc: 'Brain-gut health.', color: 'bg-sky-500' },
    { id: 'community', name: 'Virtual Circle', icon: <Globe />, desc: 'AI peer feed.', color: 'bg-indigo-500' },
    { id: 'habits', name: 'Habit Matrix', icon: <Target />, desc: 'Neural tracker.', color: 'bg-teal-600' }
  ];

  if (showPayment) return <PaymentHub onSuccess={() => setShowPayment(false)} />;
  if (activeModule) return <NeuralFrontier forcedModule={activeModule} onBack={() => setActiveModule(null)} />;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Premium Banner */}
      {user.plan === 'FREE' && (
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-3xl">
           <div>
              <h3 className="text-2xl font-black font-serif">Upgrade to Mindcore PRO</h3>
              <p className="opacity-60 font-medium">Unlock deep biometric scans and unlimited AI consultations.</p>
           </div>
           <button onClick={() => setShowPayment(true)} className="px-8 py-4 bg-indigo-600 rounded-2xl font-black uppercase text-xs">Establish Upgrade</button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl flex items-center gap-10">
           <div className="relative">
              <div className="w-40 h-40 rounded-full border-[12px] border-indigo-50 flex items-center justify-center">
                 <span className="text-4xl font-black">{healthScore}%</span>
              </div>
           </div>
           <div>
              <h2 className="text-4xl font-black font-serif text-slate-900">Neural Resilience</h2>
              <p className="text-slate-400 mt-2 font-medium italic">Current Level: {Math.floor((user.xp || 0) / 100) + 1} | Plan: {user.plan}</p>
              <div className="mt-4 flex gap-4">
                 <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 font-black text-xs uppercase tracking-widest">{user.xp || 0} XP CORE</div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl">
           <h3 className="text-xl font-black font-serif mb-6">Daily Quests</h3>
           <div className="space-y-3">
              {quests.length === 0 ? <p className="text-center text-slate-300 py-10 italic">All Quests Synced.</p> : quests.map(q => (
                <button key={q.id} onClick={() => completeQuest(q)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group">
                   <span className="text-xs font-bold text-slate-600">{q.task}</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-600">+{q.xp} XP</span>
                      <CheckCircle className="w-4 h-4 text-slate-200 group-hover:text-indigo-500" />
                   </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {modules.map(m => (
          <button key={m.id} onClick={() => setActiveModule(m.id)} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center group">
             <div className={`p-5 ${m.color} text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>{m.icon}</div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalFrontier;
