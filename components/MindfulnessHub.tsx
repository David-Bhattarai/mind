
import React, { useState, useEffect } from 'react';
import { Wind, Play, RotateCcw, Cloud, Trees, Flower2 } from 'lucide-react';

const MindfulnessHub: React.FC = () => {
  const [activeActivity, setActiveActivity] = useState<'none' | 'breathing' | 'zen'>('none');

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 font-serif">Mindfulness Hub</h1>
        <p className="text-slate-500">Small exercises to help you find your center.</p>
      </div>

      {activeActivity === 'none' ? (
        <div className="grid md:grid-cols-3 gap-6">
          <ActivityCard 
            title="4-7-8 Breathing"
            description="A quick way to relax your nervous system."
            icon={<Wind className="w-6 h-6" />}
            color="bg-teal-50 text-teal-600"
            onClick={() => setActiveActivity('breathing')}
          />
          <ActivityCard 
            title="Zen Garden"
            description="Create visual patterns to calm your mind."
            icon={<Flower2 className="w-6 h-6" />}
            color="bg-orange-50 text-orange-600"
            onClick={() => setActiveActivity('zen')}
          />
          <ActivityCard 
            title="Nature Walks"
            description="Immersive ambient sounds of a peaceful forest."
            icon={<Trees className="w-6 h-6" />}
            color="bg-green-50 text-green-600"
            onClick={() => {}} // Could add audio player here
            disabled
          />
        </div>
      ) : activeActivity === 'breathing' ? (
        <BreathingExercise onBack={() => setActiveActivity('none')} />
      ) : (
        <ZenGarden onBack={() => setActiveActivity('none')} />
      )}
    </div>
  );
};

const ActivityCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ title, description, icon, color, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-8 rounded-3xl border border-slate-200 text-left hover:shadow-xl transition-all group ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 bg-white'}`}
  >
    <div className={`p-4 rounded-2xl mb-6 w-fit ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2 font-serif">{title}</h3>
    <p className="text-slate-500 text-sm mb-6">{description}</p>
    {!disabled && (
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
        Start Now <Play className="w-4 h-4 fill-current" />
      </div>
    )}
  </button>
);

const BreathingExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            if (phase === 'Inhale') { setPhase('Hold'); return 7; }
            if (phase === 'Hold') { setPhase('Exhale'); return 8; }
            setPhase('Inhale'); return 4;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, phase]);

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
      <button onClick={onBack} className="text-slate-400 hover:text-slate-800 mb-8 block text-sm font-medium">← Back to Hub</button>
      
      <div className="relative h-64 flex items-center justify-center mb-12">
        <div 
          className={`absolute rounded-full bg-teal-100 transition-all duration-[1000ms] ease-in-out ${
            phase === 'Inhale' ? 'scale-[1.5]' : phase === 'Hold' ? 'scale-[1.5]' : 'scale-100'
          }`}
          style={{ width: '120px', height: '120px' }}
        ></div>
        <div 
          className={`absolute rounded-full bg-teal-500/20 transition-all duration-[1000ms] ease-in-out ${
            phase === 'Inhale' ? 'scale-[2.5]' : phase === 'Hold' ? 'scale-[2.5]' : 'scale-100'
          }`}
          style={{ width: '100px', height: '100px' }}
        ></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-teal-600 mb-1">{timer}</h2>
          <p className="font-bold text-slate-700 tracking-widest uppercase text-sm">{phase}</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${isRunning ? 'bg-slate-200 text-slate-700' : 'bg-teal-600 text-white'}`}
        >
          {isRunning ? 'Stop Exercise' : 'Begin Breathing'}
        </button>
        <p className="text-slate-400 text-xs">Recommended: Repeat for at least 4 cycles</p>
      </div>
    </div>
  );
};

const ZenGarden: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints(prev => [...prev.slice(-49), { x, y }]);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
      <button onClick={onBack} className="text-slate-400 hover:text-slate-800 mb-8 block text-sm font-medium">← Back to Hub</button>
      <h2 className="text-2xl font-bold mb-2 font-serif">Interactive Zen Garden</h2>
      <p className="text-slate-500 mb-8 text-sm">Click the sand to create ripples of calm.</p>
      
      <div 
        onClick={handleCanvasClick}
        className="w-full aspect-video bg-[#f5efe1] rounded-2xl cursor-pointer relative overflow-hidden shadow-inner border-8 border-[#e8dfcf]"
      >
        {points.map((p, i) => (
          <div 
            key={i}
            className="absolute rounded-full border-2 border-[#d6ccb8] animate-ping"
            style={{ 
              left: p.x - 10, 
              top: p.y - 10, 
              width: '20px', 
              height: '20px',
              animationDuration: '3s'
            }}
          />
        ))}
        {points.map((p, i) => (
          <div 
            key={`s-${i}`}
            className="absolute rounded-full bg-[#d6ccb8]/40"
            style={{ 
              left: p.x - 20, 
              top: p.y - 20, 
              width: '40px', 
              height: '40px'
            }}
          />
        ))}
      </div>
      
      <button 
        onClick={() => setPoints([])}
        className="mt-8 flex items-center gap-2 mx-auto text-slate-400 hover:text-slate-800 font-medium"
      >
        <RotateCcw className="w-4 h-4" /> Reset Garden
      </button>
    </div>
  );
};

export default MindfulnessHub;
