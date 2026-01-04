
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Activity, 
  ShieldCheck, 
  Maximize2, 
  Settings,
  Wifi,
  MoreVertical,
  ArrowRight,
  Brain,
  Zap,
  Eye,
  Scan
} from 'lucide-react';

/**
 * Decode base64 string to Uint8Array as per Gemini Live API guidelines.
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode Uint8Array to base64 string as per Gemini Live API guidelines.
 */
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const LiveTherapy: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLobby, setIsLobby] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [status, setStatus] = useState('Standby');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initLobby = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: { width: 1280, height: 720 } 
        });
        streamRef.current = stream;
        if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;
      } catch (err) {
        setStatus('Hardware Access Denied');
      }
    };
    initLobby();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startSession = async () => {
    if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    try {
      setIsLobby(false);
      setIsActive(true);
      setStatus('Initializing Robotic Brain...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      let nextStartTime = 0;
      const sources = new Set<AudioBufferSourceNode>();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `
            ACT AS DR. MINDCORE, A HIGHLY ADVANCED NEURAL ROBOTIC DOCTOR.
            - Your personality is robotic yet deeply empathetic.
            - You use clinical precision but speak in a mix of English and Nepali.
            - Use the camera feed to monitor the patient's face for micro-expressions.
            - If you see stress, offer a deep breathing exercise.
            - Start with: "Namaste, I am Dr. Mindcore, your dedicated Robotic Wellness Assistant. Initializing scan. How are you feeling today?"
          `
        },
        callbacks: {
          onopen: () => {
            setStatus('Connection Secure');
            if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;

            const inputCtx = new AudioContext({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(streamRef.current!);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (!isMicOn) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) pcm[i] = inputData[i] * 32768;
              const base64 = encode(new Uint8Array(pcm.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (!isVideoOn || !canvasRef.current || !videoRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, 640, 360);
                canvasRef.current.toBlob(async (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = (reader.result as string).split(',')[1];
                      sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', 0.5);
              }
            }, 1000);
          },
          onmessage: async (msg) => {
            const data = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (data) {
              setIsSpeaking(true);
              const bytes = decode(data);
              const pcm16 = new Int16Array(bytes.buffer);
              const buffer = outputCtx.createBuffer(1, pcm16.length, 24000);
              const chData = buffer.getChannelData(0);
              for (let i = 0; i < pcm16.length; i++) chData[i] = pcm16[i] / 32768.0;

              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
              sources.add(source);
              setStatus('Dr. Mindcore is speaking...');
              
              source.onended = () => {
                sources.delete(source);
                if (sources.size === 0) {
                  setIsSpeaking(false);
                  setStatus('Doctor is listening...');
                }
              };
            }
          },
          onclose: () => setStatus('Session Finished'),
          onerror: () => setStatus('Hardware Failure')
        }
      });
    } catch (err) {
      setStatus('Cortex Error');
    }
  };

  const endSession = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.location.reload(); 
  };

  if (isLobby) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in duration-1000">
        <div className="max-w-6xl w-full bg-slate-950 rounded-[4rem] shadow-3xl overflow-hidden border border-white/5 flex flex-col lg:flex-row">
           <div className="lg:w-1/2 p-12 bg-black/40 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-white/40 mb-10">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Secure AI Node Active</span>
              </div>
              <div className="aspect-video bg-white/5 rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl group">
                 <video ref={lobbyVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                 {!isVideoOn && <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-white/20 font-black uppercase tracking-widest">Privacy Protected</div>}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                    <button onClick={() => setIsMicOn(!isMicOn)} className={`p-5 rounded-2xl transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-rose-600 text-white shadow-xl'}`}>{isMicOn ? <Mic /> : <MicOff />}</button>
                    <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-5 rounded-2xl transition-all ${isVideoOn ? 'bg-white/10 text-white' : 'bg-rose-600 text-white shadow-xl'}`}>{isVideoOn ? <Video /> : <VideoOff />}</button>
                 </div>
              </div>
              <div className="mt-8 flex gap-4 text-white/10">
                 <div className="flex items-center gap-2"><Wifi className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Low Latency</span></div>
                 <div className="flex items-center gap-2"><Activity className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Biometrics Ready</span></div>
              </div>
           </div>
           <div className="lg:w-1/2 p-20 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-2xl"><Brain className="w-8 h-8" /></div>
                 <div>
                    <h1 className="text-4xl font-black text-white font-serif tracking-tighter">AI Shanti Clinic.</h1>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Robotic Medical Division</p>
                 </div>
              </div>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">Connect with **Dr. Mindcore**, our elite robotic psychiatrist. Utilizing real-time facial scanning and neural linguistics for deep clinical support.</p>
              <button 
                onClick={startSession}
                className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-5 group"
              >
                Establish Secure Connection <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col animate-in zoom-in-95 duration-1000 overflow-hidden font-mono">
      {/* Clinical HUD Top Bar */}
      <div className="p-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl relative z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-6 py-2 bg-indigo-600/10 rounded-full border border-indigo-600/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Cortex Link</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">System Status</span>
            <span className="text-[10px] font-black text-indigo-400 uppercase animate-pulse">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Encryption</span>
             <span className="text-[10px] text-emerald-400 font-black">256-BIT AES OK</span>
          </div>
          <Settings className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Primary Video/Interface Area */}
      <div className="flex-1 relative flex items-center justify-center p-12">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* AI Representative View: THE ROBOTIC DOCTOR */}
        <div className="w-full max-w-5xl aspect-video rounded-[5rem] bg-black/60 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)] group">
           
           {/* HUD Scanning Circles */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[500px] h-[500px] border border-indigo-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute w-full h-[1px] bg-indigo-500/20 animate-[scan_4s_linear_infinite]" />
           </div>

           <div className="relative z-10 flex flex-col items-center">
              {/* Robotic Head Representation */}
              <div className="w-64 h-80 relative flex flex-col items-center justify-center">
                 {/* Robot Face Container */}
                 <div className={`w-48 h-56 bg-gradient-to-b from-indigo-900/40 to-slate-900/80 rounded-[4rem] border-2 border-indigo-500/30 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${isSpeaking ? 'scale-105 border-indigo-400' : 'scale-100'}`}>
                    
                    {/* Eyes Section */}
                    <div className="flex gap-8 mb-12">
                       <div className="w-12 h-4 bg-indigo-400/20 rounded-full overflow-hidden flex items-center justify-center">
                          <div className={`w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)] transition-all duration-300 ${isSpeaking ? 'scale-125' : 'scale-100'}`} />
                       </div>
                       <div className="w-12 h-4 bg-indigo-400/20 rounded-full overflow-hidden flex items-center justify-center">
                          <div className={`w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)] transition-all duration-300 ${isSpeaking ? 'scale-125' : 'scale-100'}`} />
                       </div>
                    </div>

                    {/* Mouth / Voice Waveform */}
                    <div className="flex gap-1.5 h-10 items-center">
                       {[...Array(6)].map((_, i) => (
                         <div 
                           key={i} 
                           className={`w-1.5 bg-indigo-500 rounded-full transition-all duration-200 ${isSpeaking ? 'animate-pulse' : 'h-1.5 opacity-40'}`}
                           style={{ height: isSpeaking ? `${20 + Math.random() * 80}%` : '6px' }}
                         />
                       ))}
                    </div>
                 </div>

                 {/* Robot Neck/Base */}
                 <div className="w-20 h-10 bg-slate-800 rounded-b-2xl border-x border-white/10" />
                 <div className="w-40 h-8 bg-indigo-950/40 rounded-full blur-xl animate-pulse" />
              </div>

              <div className="mt-10 text-center">
                 <h2 className="text-3xl font-black text-white font-serif mb-2 tracking-tighter">Dr. Mindcore</h2>
                 <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Neural Response Active</span>
                 </div>
              </div>
           </div>

           {/* Live HUD Overlays */}
           <div className="absolute top-10 left-10 space-y-4">
              <HUDStat label="Cognitive Load" value="12.4%" />
              <HUDStat label="Sentiment Score" value="0.92" />
              <HUDStat label="Vocal Entropy" value={isSpeaking ? "ACTIVE" : "STABLE"} />
           </div>
           
           <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2">
              <Scan className="w-8 h-8 text-indigo-500/40 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Biometric Tracking Enabled</span>
           </div>
        </div>

        {/* Self-View (Patient Video) */}
        <div className="absolute bottom-20 right-20 w-80 aspect-video bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-white/5 shadow-3xl group transform hover:scale-105 transition-all">
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
           {!isVideoOn && (
             <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3">
                <VideoOff className="w-8 h-8 text-white/10" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Privacy Active</span>
             </div>
           )}
           <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-lg">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">PATIENT_01 (HD)</span>
           </div>
           {/* Visual Scan Line on Patient Video */}
           <div className="absolute inset-0 pointer-events-none border-x border-white/5">
              <div className="h-[2px] w-full bg-emerald-500/20 absolute top-0 animate-[scan_5s_linear_infinite]" />
           </div>
        </div>

        <canvas ref={canvasRef} className="hidden" width="640" height="360" />
      </div>

      {/* Control Dock */}
      <div className="p-16 flex justify-center relative z-20">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-12 py-7 rounded-[3.5rem] flex items-center gap-10 shadow-3xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-7 rounded-[2rem] transition-all transform active:scale-90 ${isMicOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/30'}`}
            >
              {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-7 rounded-[2rem] transition-all transform active:scale-90 ${isVideoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/30'}`}
            >
              {isVideoOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </button>
          </div>
          
          <div className="w-px h-12 bg-white/10" />
          
          <button 
            onClick={endSession} 
            className="p-8 bg-rose-600 text-white rounded-[2rem] shadow-2xl shadow-rose-600/40 hover:bg-rose-500 hover:scale-110 transition-all transform active:scale-90"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
          
          <div className="w-px h-12 bg-white/10" />
          
          <button className="p-7 bg-white/5 text-white rounded-[2rem] hover:bg-white/20 transition-all">
            <MoreVertical className="w-7 h-7" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const HUDStat = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
     <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
     <span className="text-[10px] font-black text-indigo-400 tracking-widest">{value}</span>
  </div>
);

export default LiveTherapy;
