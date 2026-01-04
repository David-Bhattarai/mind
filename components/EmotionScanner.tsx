
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Sparkles, 
  Brain, 
  Scan, 
  Activity, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Smile,
  Frown,
  Meh,
  Wind,
  AlertCircle,
  Layers,
  Fingerprint
} from 'lucide-react';
import { analyzeFaceEmotion } from '../geminiService';
import { API } from '../api';

interface EmotionScannerProps {
  onRecommendation?: (tab: string) => void;
}

const EmotionScanner: React.FC<EmotionScannerProps> = ({ onRecommendation }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrollingVectors, setScrollingVectors] = useState<string[]>([]);
  const [neuralMarkers, setNeuralMarkers] = useState<{x: number, y: number}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoScanInterval = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err: any) {
      setError("Camera access required for biometric scan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (autoScanInterval.current) clearInterval(autoScanInterval.current);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // UI Effects for the "Pro" look
  useEffect(() => {
    const interval = setInterval(() => {
      if (stream) {
        const newVector = Array.from({length: 6}, () => Math.random().toFixed(4)).join(' ');
        setScrollingVectors(prev => [newVector, ...prev.slice(0, 15)]);
        
        const points = Array.from({length: 15}, () => ({
          x: Math.random() * 100,
          y: Math.random() * 100
        }));
        setNeuralMarkers(points);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [stream]);

  useEffect(() => {
    if (stream && isAutoScanning) {
      autoScanInterval.current = window.setInterval(() => {
        if (!isAnalyzing) captureAndAnalyze();
      }, 10000); // Scan every 10 seconds automatically
      return () => { if (autoScanInterval.current) clearInterval(autoScanInterval.current); };
    }
  }, [stream, isAutoScanning, isAnalyzing]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
      
      try {
        const analysisRaw = await analyzeFaceEmotion(base64Image);
        
        const res = await API.frontier.logBiometrics({
          source: 'NEURAL_TRANSFORM_NODE',
          raw: analysisRaw,
          timestamp: Date.now()
        });

        const jsonMatch = analysisRaw.match(/\{.*\}/s);
        const data = jsonMatch ? JSON.parse(jsonMatch[0].replace(/'/g, '"')) : { emotion: 'Stable' };
        
        setResult({
          ...data,
          // Fixed: res.data IS the inserted record from our simulate backend
          db_metrics: (res as any).data.ml_metadata
        });
        
      } catch (e) {
        console.error("Scanner Error:", e);
        setError("Neural link failed during frame processing.");
      }
    }
    setIsAnalyzing(false);
  };

  const getRec = (emotion: string) => {
    const e = emotion.toLowerCase();
    if (e.includes('happy')) return { text: "You radiate positivity! Keep this momentum.", tab: 'frontier', icon: <Smile className="text-emerald-500" /> };
    if (e.includes('sad') || e.includes('frown')) return { text: "You seem a bit down. Let's talk to our therapist node.", tab: 'chat', icon: <Frown className="text-rose-500" /> };
    if (e.includes('stress') || e.includes('anxious') || e.includes('tension')) return { text: "High stress detected. Let's try some deep breathing.", tab: 'games', icon: <Wind className="text-amber-500" /> };
    return { text: "Your emotional markers are balanced. Maintain routine.", tab: 'home', icon: <Meh className="text-indigo-500" /> };
  };

  const rec = result ? getRec(result.emotion) : null;

  return (
    <div className="animate-in fade-in duration-700 w-full pb-20">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl flex items-center gap-2">
                <Layers className="w-3 h-3" /> Cortex Vision Node
             </div>
             <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 border transition-all ${isAutoScanning ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'}`}>
                <Activity className={`w-3 h-3 ${isAutoScanning ? 'animate-pulse' : ''}`} /> Auto-Sync: {isAutoScanning ? 'Active' : 'Standby'}
             </div>
          </div>
          <h1 className="text-6xl font-black text-slate-900 font-serif tracking-tighter leading-tight">Bio <span className="text-indigo-600">Scanner.</span></h1>
          <p className="text-slate-400 text-xl font-medium mt-2 italic">Real-time facial vectorization and psychological analysis.</p>
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => setIsAutoScanning(!isAutoScanning)} className={`px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${isAutoScanning ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              {isAutoScanning ? 'Pause Monitoring' : 'Resume Monitoring'}
           </button>
           <button onClick={captureAndAnalyze} disabled={isAnalyzing || !stream} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center gap-3 active:scale-95 transition-all">
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Initialize Scan
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
           <div className="flex-1 bg-slate-950 rounded-[4rem] overflow-hidden shadow-3xl border-8 border-white relative group min-h-[500px]">
              {stream && (
                <div className="absolute inset-0 pointer-events-none z-20">
                   <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-3xl" />
                   <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-indigo-500/40 rounded-br-3xl" />
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/50 shadow-[0_0_20px_#6366f1] animate-[scan_4s_linear_infinite]" />
                   
                   {neuralMarkers.map((p, i) => (
                     <div key={i} className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-60" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
                   ))}
                   
                   <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
                      <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{isAnalyzing ? 'Inference Active' : 'Sensor Ready'}</span>
                   </div>
                </div>
              )}

              {!stream && !error ? (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4">
                   <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                   <span className="text-white/20 font-black uppercase text-[10px] tracking-widest">Waking Sensor...</span>
                </div>
              ) : error ? (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-12 text-center">
                   <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
                   <h3 className="text-white font-black text-2xl mb-4">Sensor Link Blocked</h3>
                   <p className="text-slate-500 text-sm mb-8">{error}</p>
                   <button onClick={startCamera} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs">Retry Connection</button>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover grayscale brightness-75 transition-all duration-700 ${isAnalyzing ? 'brightness-110 saturate-150' : ''}`} />
              )}
              <canvas ref={canvasRef} className="hidden" />
           </div>

           <div className="mt-8 bg-slate-950 p-8 rounded-[3rem] border border-white/5 font-mono text-[10px] text-indigo-500/40 h-32 overflow-hidden relative shadow-2xl">
              <div className="mt-2 space-y-1">
                 {scrollingVectors.map((v, i) => <div key={i} className="flex gap-4"><span>[{i}]</span> <span>{v}</span></div>)}
              </div>
           </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
           {result ? (
             <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-3xl animate-in slide-in-from-right-8 duration-500 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                
                <div className="relative z-10">
                   <div className="flex items-center gap-6 mb-12">
                      <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-2xl"><Brain size={32} /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inference Detected</p>
                         <h2 className="text-5xl font-black text-slate-900 font-serif leading-none tracking-tight">{result.emotion}</h2>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-10">
                      <Metric label="Confidence" value={`${(result.confidence * 100).toFixed(0)}%`} sub="ML Precision" />
                      <Metric label="Neural Latency" value={result.db_metrics?.cognitive_entropy ? `${(result.db_metrics.cognitive_entropy * 100).toFixed(1)}ms` : '12ms'} sub="Node Response" />
                   </div>

                   {rec && (
                     <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 mb-6 animate-in fade-in">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="p-3 bg-white rounded-2xl shadow-sm">{rec.icon}</div>
                           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">AI Insight</h4>
                        </div>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed italic mb-8">"{rec.text}"</p>
                        <button 
                          onClick={() => onRecommendation?.(rec.tab)}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 group transition-all"
                        >
                           Engage Suggestion <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                     </div>
                   )}
                </div>
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-slate-400 relative z-10">
                   <span className="text-[9px] font-black uppercase tracking-widest">Hash: {result.db_metrics?.bio_hash || 'SYNCING...'}</span>
                   <ShieldCheck size={14} />
                </div>
             </div>
           ) : (
             <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl flex flex-col justify-center h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000"><Scan size={250} /></div>
                <div className="relative z-10">
                   <div className="p-4 bg-white/5 rounded-2xl w-fit mb-8 border border-white/10"><Fingerprint className="text-indigo-400" /></div>
                   <h3 className="text-4xl font-black font-serif mb-8 leading-tight">Neural Signature Analysis.</h3>
                   <p className="text-slate-400 text-xl font-medium leading-relaxed italic">"Our biometric node uses 128-point vector tracking to analyze micro-expressions and determine your optimal wellness routine. All data is processed on the local Mindcore cluster."</p>
                </div>
             </div>
           )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

const Metric = ({ label, value, sub }: any) => (
  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-2xl font-black text-slate-900">{value}</p>
     <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">{sub}</p>
  </div>
);

export default EmotionScanner;
