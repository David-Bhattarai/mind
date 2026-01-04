
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ImageIcon, 
  Compass, 
  Zap, 
  Coffee, 
  Globe, 
  Brain, 
  Mic, 
  ArrowRight, 
  Loader2, 
  Target, 
  CheckCircle,
  Sparkles,
  RefreshCw,
  Layout,
  ChevronLeft,
  Volume2,
  Users,
  MessageSquare,
  Activity,
  User,
  Heart
} from 'lucide-react';
// Corrected analyzeEmotion to analyzeFaceEmotion
import { generateMoodArt, generateRoadmap, getNutritionTips, analyzeFaceEmotion } from '../geminiService';
import { API } from '../api';

interface NeuralFrontierProps {
  forcedModule?: string | null;
  onBack?: () => void;
}

const NeuralFrontier: React.FC<NeuralFrontierProps> = ({ forcedModule, onBack }) => {
  const [activeModule, setActiveModule] = useState<string | null>(forcedModule || null);

  useEffect(() => {
    if (forcedModule) setActiveModule(forcedModule);
  }, [forcedModule]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveModule(null);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'art': return <ArtTherapy onBack={handleBack} />;
      case 'roadmap': return <WellnessRoadmap onBack={handleBack} />;
      case 'nutrition': return <NutritionAdvisor onBack={handleBack} />;
      case 'journal': return <NeuralJournal onBack={handleBack} />;
      case 'habits': return <HabitMatrix onBack={handleBack} />;
      case 'wisdom': return <WisdomNexus onBack={handleBack} />;
      case 'voice': return <VoiceSync onBack={handleBack} />;
      case 'community': return <VirtualCircle onBack={handleBack} />;
      default: return (
        <div className="p-12 bg-white rounded-[3rem] border border-slate-100 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Node Booting...</p>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <button onClick={handleBack} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs">Return</button>
        </div>
      );
    }
  };

  if (activeModule) return renderModule();

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-16">
        <h1 className="text-6xl font-black text-slate-900 font-serif tracking-tight">Expansion <span className="text-indigo-600">Lab.</span></h1>
        <p className="text-slate-400 text-xl font-medium mt-4">Elevating your mental health journey with specialized ML-driven therapeutic modules.</p>
      </div>
    </div>
  );
};

// --- NEW MODULES ---

const VoiceSync: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startAnalysis = async () => {
    setIsRecording(true);
    setLoading(true);
    // Simulate audio capture and AI analysis of "tone"
    setTimeout(async () => {
      const result = "Tone: Calmer than average. Stress markers are minimal but vocal entropy suggests minor fatigue.";
      setAnalysis(result);
      setIsRecording(false);
      setLoading(false);
      await API.frontier.logBiometrics({ type: 'VOICE_STRESS', value: result });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-center">
      <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Mic size={200} /></div>
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-4">Voice Sync Pro</h2>
        <p className="text-slate-500 mb-12">Analyze your mental state through vocal biomarkers and tonal frequencies.</p>
        
        <div className="flex flex-col items-center gap-10">
          <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-rose-500 scale-110 shadow-[0_0_50px_rgba(244,63,94,0.4)]' : 'bg-indigo-600'}`}>
             <button 
              onClick={startAnalysis}
              disabled={loading}
              className="w-full h-full flex items-center justify-center text-white"
             >
                {loading ? <Loader2 className="w-12 h-12 animate-spin" /> : <Mic className="w-12 h-12" />}
             </button>
          </div>
          
          <div className="flex gap-2 h-10 items-end">
             {[...Array(20)].map((_, i) => (
               <div 
                key={i} 
                className={`w-1.5 bg-indigo-200 rounded-full transition-all duration-150 ${isRecording ? 'animate-pulse bg-rose-400' : ''}`}
                style={{ height: isRecording ? `${30 + Math.random() * 70}%` : '4px' }}
               />
             ))}
          </div>
        </div>

        {analysis && (
          <div className="mt-16 p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100 text-left animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3 mb-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                <Activity className="w-4 h-4" /> Neural Analysis Complete
             </div>
             <p className="text-xl font-bold text-indigo-900 leading-relaxed italic">"{analysis}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

const VirtualCircle: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await API.frontier.getCommunityPosts();
      setPosts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    const p = { user: 'You', text: newPost, time: 'Just now' };
    setPosts([p, ...posts]);
    setNewPost('');
    await API.frontier.logRoleplay('COMMUNITY_SHARE', newPost);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-5xl font-black text-slate-900 font-serif mb-4">Virtual Circle</h2>
        <p className="text-slate-500 font-medium">Safe, AI-moderated community space for neural reflection.</p>
      </div>

      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-slate-100 flex gap-4">
         <input 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share a thought with the circle..."
          className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl focus:outline-none border-none font-bold text-slate-700"
         />
         <button onClick={handlePost} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">
            Share Log
         </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-slate-300" /></div>
        ) : (
          posts.map((post, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-md hover:shadow-xl transition-all flex gap-8">
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black shrink-0">
                  {post.user[0]}
               </div>
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                     <span className="font-black text-slate-900">{post.user}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{post.time}</span>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">{post.text}</p>
                  <div className="flex gap-6">
                     <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors">
                        <Heart className="w-4 h-4" /> Support
                     </button>
                     <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Echo
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- EXISTING SUB-COMPONENTS ---

const NeuralJournal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [entry, setEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCommit = async () => {
    if (!entry.trim()) return;
    setIsSaving(true);
    await API.frontier.saveJournal(entry);
    setIsSaving(false);
    setEntry('');
    alert("Instantly Committed to Neural Database.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><BookOpen size={200} /></div>
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-8">Neural Journal</h2>
        <textarea 
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Thoughts? (Aja kasto vayo?)"
          className="w-full h-80 bg-slate-50 rounded-3xl p-10 text-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 border-none transition-all relative z-10"
        />
        <div className="mt-8 flex justify-between items-center relative z-10">
          <p className="text-slate-400 text-xs italic">"Synced with High-Speed Node_01"</p>
          <button 
            onClick={handleCommit}
            disabled={isSaving || !entry.trim()}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Commit Now
          </button>
        </div>
      </div>
    </div>
  );
};

const ArtTherapy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mood, setMood] = useState('');
  const [art, setArt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await generateMoodArt(mood);
    if (result) {
      setArt(result);
      await API.frontier.saveArt(mood, result);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-center">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50">
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-4">Art Therapy</h2>
        <p className="text-slate-400 mb-10">Describe your emotion for abstract visual therapy.</p>
        <div className="flex gap-4 mb-10">
          <input 
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g., Peace in the Himalayas..."
            className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl focus:outline-none border-none font-bold"
          />
          <button onClick={generate} disabled={loading || !mood} className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-30">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Paint Mood'}
          </button>
        </div>
        {art && (
          <div className="rounded-[3rem] overflow-hidden border-8 border-slate-100 shadow-inner animate-in zoom-in duration-500">
            <img src={art} alt="Mood Art" className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

const WellnessRoadmap: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await generateRoadmap(goal);
    if (result) {
      setRoadmap(result);
      await API.frontier.generateRoadmap(goal);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50">
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-8 text-center">Growth Roadmap</h2>
        <div className="flex gap-4 mb-12">
          <input 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Goal (e.g., Focus and Calm)..."
            className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl focus:outline-none border-none font-bold"
          />
          <button onClick={generate} disabled={loading || !goal} className="px-10 py-5 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-30">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Plan'}
          </button>
        </div>
        {roadmap && (
          <div className="p-10 bg-amber-50 rounded-[3rem] text-slate-800 font-medium leading-relaxed whitespace-pre-wrap border border-amber-100 animate-in fade-in">
            {roadmap}
          </div>
        )}
      </div>
    </div>
  );
};

const NutritionAdvisor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mood, setMood] = useState('Anxious');
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getTips = async () => {
    setLoading(true);
    const result = await getNutritionTips(mood);
    setTips(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-center">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50">
        <div className="p-6 bg-sky-50 rounded-full w-fit mx-auto mb-6 text-sky-500"><Coffee className="w-12 h-12" /></div>
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-4">Nutrition AI</h2>
        <p className="text-slate-400 mb-10">Brain-gut health optimizer.</p>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {['Anxious', 'Depressed', 'Brain Fog', 'Low Energy'].map(m => (
            <button 
              key={m}
              onClick={() => setMood(m)}
              className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${mood === m ? 'bg-sky-500 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button onClick={getTips} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs mb-10 shadow-xl">
           {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Get Diet'}
        </button>
        {tips && <div className="p-10 bg-sky-50/50 rounded-[3rem] text-slate-800 font-bold border border-sky-100 animate-in fade-in">{tips}</div>}
      </div>
    </div>
  );
};

const HabitMatrix: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Sunlight Exposure', done: false },
    { id: 2, name: 'Hydration (2L)', done: true },
    { id: 3, name: '10 Min Meditation', done: false },
    { id: 4, name: 'Digital Detox (1hr)', done: false },
  ]);

  const toggleHabit = (id: number) => {
    const updated = habits.map(item => item.id === id ? { ...item, done: !item.done } : item);
    setHabits(updated);
    API.frontier.syncHabits(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50">
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-8">Habit Matrix</h2>
        <div className="space-y-4">
          {habits.map(h => (
            <button 
              key={h.id}
              onClick={() => toggleHabit(h.id)}
              className={`w-full p-8 rounded-[2rem] border transition-all flex items-center justify-between group ${h.done ? 'bg-teal-50 border-teal-100' : 'bg-white border-slate-100'}`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl transition-all ${h.done ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {h.done ? <CheckCircle className="w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
                </div>
                <span className={`text-xl font-bold ${h.done ? 'text-teal-700 line-through opacity-50' : 'text-slate-800'}`}>{h.name}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${h.done ? 'bg-teal-500' : 'bg-slate-200'}`} />
            </button>
          ))}
        </div>
        <div className="mt-8 p-4 bg-slate-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
           Instant Cloud Sync Active
        </div>
      </div>
    </div>
  );
};

const WisdomNexus: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [wisdom, setWisdom] = useState<any[]>([]);

  useEffect(() => {
    const fetchWisdom = async () => {
      const data = await API.frontier.getWisdom();
      setWisdom(data);
    };
    fetchWisdom();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-center">
      <div className="bg-indigo-600 p-16 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
           <Brain className="w-64 h-64" />
         </div>
         <div className="relative z-10">
           <div className="flex justify-center mb-8"><Sparkles className="w-12 h-12 text-indigo-300" /></div>
           <h2 className="text-4xl font-black font-serif mb-10 tracking-tight">Wisdom Nexus Core</h2>
           <div className="space-y-12">
              {wisdom.length === 0 ? <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : wisdom.map((w, i) => (
                <div key={i} className="p-10 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 text-left animate-in fade-in">
                   <p className="text-2xl font-black font-serif italic mb-4 leading-relaxed">"{w.text}"</p>
                   <p className="text-indigo-200 font-black uppercase text-[10px] tracking-widest">— {w.author}</p>
                </div>
              ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default NeuralFrontier;
