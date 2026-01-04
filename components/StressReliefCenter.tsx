
import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Brain, 
  ChevronLeft, 
  Target, 
  Sparkles, 
  Ghost, 
  ChevronRight, 
  Trophy, 
  Zap, 
  Dices,
  Eye,
  Activity,
  Award,
  Loader2
} from 'lucide-react';
import ChessGame from './ChessGame';
import { API } from '../api';

type GameType = 'none' | 'chess' | 'bubbles';

const StressReliefCenter: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>('none');

  const renderGame = () => {
    const backBtn = (
      <button 
        onClick={() => setActiveGame('none')}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Game Hub
      </button>
    );

    switch (activeGame) {
      case 'chess':
        return <div className="animate-in fade-in duration-500">{backBtn}<ChessGame /></div>;
      case 'bubbles':
        return <div className="animate-in fade-in duration-500">{backBtn}<BubblePopGame /></div>;
      default:
        return null;
    }
  };

  if (activeGame !== 'none') {
    return renderGame();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12">
        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Season 1: Strategic Calm
        </p>
        <h1 className="text-5xl font-black text-slate-900 mb-4 font-serif">Stress Relief Games</h1>
        <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
          Switch your neural pathways from stress to play. Science shows gaming reduces cortisol. All sessions are synced with our Python Neural Node.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <GameCard 
          title="Mindful Chess"
          desc="Ground your thoughts through strategy. Full interactive board synced with Python strategy engine."
          icon={<Brain className="w-8 h-8" />}
          color="bg-slate-900"
          onClick={() => setActiveGame('chess')}
          badge="Logic"
        />
        <GameCard 
          title="Bubble Pop"
          desc="Instant stress relief through sensory play. Pop as many as you can! Scores tracked by biometrics engine."
          icon={<Zap className="w-8 h-8" />}
          color="bg-rose-500"
          onClick={() => setActiveGame('bubbles')}
          badge="Sensory"
        />
      </div>
    </div>
  );
};

const GameCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; color: string; onClick: () => void; badge?: string }> = ({ title, desc, icon, color, onClick, badge }) => (
  <button 
    onClick={onClick}
    className="group bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg text-left transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col"
  >
    <div className="flex justify-between items-start mb-8">
      <div className={`p-5 rounded-[1.8rem] ${color} text-white shadow-xl`}>
        {icon}
      </div>
      {badge && <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full">{badge}</span>}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-3 font-serif">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm opacity-80">{desc}</p>
    <div className="mt-auto flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
      Launch Session <ChevronRight className="w-4 h-4" />
    </div>
  </button>
);

const BubblePopGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedScore, setLastSyncedScore] = useState(0);

  useEffect(() => {
    const spawnBubble = () => {
      const newBubble = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 60 + 40
      };
      setBubbles(prev => [...prev.slice(-15), newBubble]);
    };

    const interval = setInterval(spawnBubble, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic score sync (Every 10 pops)
  useEffect(() => {
    if (score > 0 && score % 10 === 0 && score !== lastSyncedScore) {
      const sync = async () => {
        setIsSyncing(true);
        await API.games.saveBubbleScore(score);
        setLastSyncedScore(score);
        setIsSyncing(false);
      };
      sync();
    }
  }, [score, lastSyncedScore]);

  const handlePop = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  return (
    <div className="text-center animate-in fade-in duration-700">
      <div className="mb-10 flex flex-col items-center">
        <div className="p-4 bg-rose-50 rounded-full text-rose-500 mb-4 relative">
           <Award className="w-10 h-10" />
           {isSyncing && <Loader2 className="absolute top-0 right-0 w-6 h-6 text-indigo-500 animate-spin" />}
        </div>
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-2">Sensory Bubble Pop</h2>
        <div className="flex items-center gap-4">
           <span className="px-4 py-1 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">Score: {score}</span>
           <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
              {isSyncing ? 'Syncing Score...' : 'Cloud Persist Active'}
           </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto aspect-video bg-slate-950 rounded-[4rem] relative overflow-hidden border-8 border-white shadow-3xl cursor-crosshair group">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-950/20 via-slate-950 to-slate-950"></div>
         {bubbles.map(b => (
           <button 
             key={b.id}
             onClick={() => handlePop(b.id)}
             style={{ 
               left: `${b.x}%`, 
               top: `${b.y}%`, 
               width: `${b.size}px`, 
               height: `${b.size}px` 
             }}
             className="absolute bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full border border-white/20 animate-pulse hover:bg-white/40 transition-all active:scale-150 active:opacity-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
           />
         ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-3">
         <Activity className="w-4 h-4 text-rose-500" />
         <p className="text-slate-400 font-medium italic">"Click to pop. Stress reduction metrics are synced every 10 pops."</p>
      </div>
    </div>
  );
};

export default StressReliefCenter;
