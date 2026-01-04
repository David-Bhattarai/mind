
import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Activity, 
  Settings,
  Clock,
  Zap,
  ShieldCheck,
  Brain,
  MessageSquare,
  Maximize2
} from 'lucide-react';

interface VideoCallSimulationProps {
  doctor: any;
  onEnd: () => void;
}

const VideoCallSimulation: React.FC<VideoCallSimulationProps> = ({ doctor, onEnd }) => {
  const [time, setTime] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [status, setStatus] = useState('Establishing Link...');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('Secure Node Established');
      } catch (err) {
        setStatus('Hardware Failure: Video Restricted');
      }
    };
    startCamera();

    const interval = setInterval(() => setTime(t => t + 1), 1000);
    
    return () => {
      clearInterval(interval);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col font-mono animate-in zoom-in-95 duration-1000 overflow-hidden">
      {/* HUD Header */}
      <div className="p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-20">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 px-6 py-2.5 bg-indigo-600/10 rounded-full border border-indigo-600/20 shadow-lg">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Clinical Data Stream</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Session Status</span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-2xl font-black text-white tabular-nums">{formatTime(time)}</span>
          </div>
          <Settings className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Primary Area */}
      <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Doctor Main Screen */}
        <div className="w-full max-w-6xl aspect-video rounded-[5rem] bg-slate-900 border-8 border-white shadow-[0_0_100px_rgba(79,70,229,0.15)] overflow-hidden relative group">
           <div className="w-full h-full relative">
              <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover grayscale brightness-75 opacity-70 group-hover:opacity-100 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              
              {/* Doctor HUD */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_25s_linear_infinite]" />
                 <div className="absolute w-[500px] h-[500px] border border-indigo-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
              </div>

              <div className="absolute bottom-16 left-16 flex items-center gap-8">
                 <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl ring-8 ring-white/5"><Brain size={36} /></div>
                 <div>
                    <h2 className="text-5xl font-black text-white font-serif tracking-tighter">{doctor.name}</h2>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mt-2">{doctor.specialty} Node</p>
                 </div>
              </div>

              <div className="absolute top-16 right-16 text-right space-y-6">
                 <HUDMetric label="Cognitive Sync" value="98.7%" />
                 <HUDMetric label="Vocal Entropy" value="STABLE" />
                 <HUDMetric label="P2P Latency" value="12ms" />
              </div>
           </div>
        </div>

        {/* Self PIP View */}
        <div className="absolute bottom-20 right-20 w-80 aspect-video bg-black rounded-[3rem] overflow-hidden border-4 border-white shadow-3xl group transform hover:scale-105 transition-all cursor-move">
           <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all grayscale ${!isVideoOn ? 'hidden' : ''}`} />
           {!isVideoOn && (
             <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4">
                <VideoOff className="w-8 h-8 text-white/10" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Privacy Active</span>
             </div>
           )}
           <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-lg">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Session_Local_Node</span>
           </div>
           <div className="absolute inset-0 pointer-events-none border-x border-white/5">
              <div className="h-[2px] w-full bg-emerald-500/20 absolute top-0 animate-[call_scan_5s_linear_infinite]" />
           </div>
        </div>
      </div>

      {/* Dock Controls */}
      <div className="p-16 flex justify-center relative z-20">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-14 py-8 rounded-[4rem] flex items-center gap-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
           <div className="flex items-center gap-8">
              <DockButton onClick={() => setIsMicOn(!isMicOn)} active={isMicOn} icon={isMicOn ? <Mic size={28}/> : <MicOff size={28}/>} color="bg-rose-600" />
              <DockButton onClick={() => setIsVideoOn(!isVideoOn)} active={isVideoOn} icon={isVideoOn ? <Video size={28}/> : <VideoOff size={28}/>} color="bg-rose-600" />
           </div>
           
           <div className="w-px h-16 bg-white/10" />
           
           <button 
             onClick={onEnd}
             className="p-10 bg-rose-600 text-white rounded-[2.5rem] shadow-2xl shadow-rose-600/30 hover:bg-rose-500 hover:scale-110 active:scale-90 transition-all transform"
           >
              <PhoneOff size={36} />
           </button>
           
           <div className="w-px h-16 bg-white/10" />
           
           <div className="flex items-center gap-8">
              <button className="p-7 bg-white/5 text-white/40 rounded-[2rem] hover:bg-white/10 transition-all"><MessageSquare size={24} /></button>
              <button className="p-7 bg-white/5 text-white/40 rounded-[2rem] hover:bg-white/10 transition-all"><Maximize2 size={24} /></button>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes call_scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const DockButton = ({ onClick, active, icon, color }: any) => (
  <button 
    onClick={onClick}
    className={`p-7 rounded-[2rem] transition-all transform active:scale-90 ${active ? 'bg-white/10 text-white hover:bg-white/20' : `${color} text-white shadow-xl`}`}
  >
    {icon}
  </button>
);

const HUDMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
     <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">{label}</span>
     <span className="text-[10px] font-black text-indigo-400 tracking-widest">{value}</span>
  </div>
);

export default VideoCallSimulation;
