
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Activity, 
  Heart, 
  ShieldCheck, 
  Maximize2, 
  Settings,
  Users,
  Wifi,
  MoreVertical,
  Key,
  AlertCircle,
  ArrowRight
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Pre-load camera for the lobby
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
        console.error(err);
      }
    };
    initLobby();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startSession = async () => {
    // API Key Selection check for paid billing projects as per Veo/Gemini 3 guidelines
    if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    try {
      setIsLobby(false);
      setIsActive(true);
      setStatus('Initializing AI Presence...');

      // Initialize AI client right before session creation to ensure latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      let nextStartTime = 0;
      const sources = new Set<AudioBufferSourceNode>();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: "You are Mindcore's Shanti Guide. You are a professional, empathetic therapist. Use the camera feed to monitor the user's facial expressions and adjust your tone. If they look sad, be more comforting. If they look stressed, guide them through a breath. Be warm and professional."
        },
        callbacks: {
          onopen: () => {
            setStatus('Secure Link Ready');
            
            // Link local stream to call view
            if (videoRef.current && streamRef.current) {
              videoRef.current.srcObject = streamRef.current;
            }

            // Audio Stream to AI
            const inputCtx = new AudioContext({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(streamRef.current!);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (!isMicOn) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) pcm[i] = inputData[i] * 32768;
              
              // Use manual encode as per SDK guidelines for Live API
              const base64 = encode(new Uint8Array(pcm.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);

            // Video Frames to AI (1 FPS for multimodal context)
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
                      sessionPromise.then(s => s.sendRealtimeInput({ 
                        media: { data: base64, mimeType: 'image/jpeg' } 
                      }));
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', 0.6);
              }
            }, 1000);
          },
          onmessage: async (msg) => {
            const data = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (data) {
              // Use manual decode as per SDK guidelines for Live API
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
              setStatus('Guide is speaking...');
              source.onended = () => {
                sources.delete(source);
                if (sources.size === 0) setStatus('Guide is listening...');
              };
            }
          },
          onclose: () => setStatus('Session Completed'),
          onerror: (e) => {
             console.error(e);
             setStatus('Connection Issue');
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to launch AI Session');
    }
  };

  const endSession = () => {
    setIsActive(false);
    setIsLobby(true);
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStatus('Ready for session');
    // Refresh lobby camera
    window.location.reload(); 
  };

  const toggleMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    streamRef.current?.getAudioTracks().forEach(t => t.enabled = newState);
  };

  const toggleVideo = () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    streamRef.current?.getVideoTracks().forEach(t => t.enabled = newState);
  };

  if (isLobby) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in duration-700">
        <div className="max-w-5xl w-full bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 bg-slate-900 flex flex-col justify-between relative min-h-[400px]">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-white/30">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Telehealth Node</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full aspect-video bg-slate-800 rounded-[2.5rem] overflow-hidden relative border-2 border-white/5 shadow-inner group">
                <video ref={lobbyVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!isVideoOn && <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400 font-bold uppercase tracking-widest text-xs">Privacy Active</div>}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                   <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white shadow-xl'}`}>{isMicOn ? <Mic /> : <MicOff />}</button>
                   <button onClick={toggleVideo} className={`p-4 rounded-2xl transition-all ${isVideoOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white shadow-xl'}`}>{isVideoOn ? <Video /> : <VideoOff />}</button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-white/20">
               <Activity className="w-4 h-4" />
               <Wifi className="w-4 h-4" />
               <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="lg:w-1/2 p-16 flex flex-col justify-center">
            <h1 className="text-5xl font-black text-slate-900 font-serif mb-6 leading-tight">Your Shanti Session is Ready.</h1>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed text-lg">Step into a private space. Our AI Guide combines empathy with biometric tracking to help you navigate your thoughts in real-time.</p>
            
            <div className="space-y-6">
              <button 
                onClick={startSession} 
                className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 group"
              >
                Join Private Room <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <div className="flex items-center gap-4 justify-center">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />)}
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join 4.5k+ Shanti Seekers Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-in zoom-in-95 duration-1000">
      {/* Immersive Top Header */}
      <div className="p-8 flex items-center justify-between text-white/60">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live AI Therapy</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 animate-pulse">{status}</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">Encrypted P2P Session</span>
          </div>
          <button className="hover:text-white transition-colors"><Settings className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Primary Video/Interface Area */}
      <div className="flex-1 relative flex items-center justify-center p-12">
        {/* AI Representative View */}
        <div className="w-full max-w-5xl aspect-video rounded-[5rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_150px_rgba(79,70,229,0.08)]">
           <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className={`w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[150px] transition-all duration-1000 ${status.includes('speaking') ? 'scale-125 opacity-30' : 'scale-100'}`}></div>
           </div>
           
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-40 h-40 bg-indigo-600 rounded-[3rem] flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] mb-10 transform rotate-3 animate-pulse">
                <Heart className="w-16 h-16 text-white fill-white/20" />
              </div>
              <h2 className="text-4xl font-black text-white font-serif mb-3 tracking-tight">AI Shanti Guide</h2>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                 <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">Neural Stream Active</p>
              </div>
           </div>

           {/* Reactive Spectrum Visualizer */}
           <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 h-12 items-end opacity-40">
              {[...Array(32)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-indigo-400 rounded-full transition-all duration-300 ${status.includes('speaking') ? '' : 'h-1'}`}
                  style={{ 
                    height: status.includes('speaking') ? `${20 + Math.random() * 80}%` : '4px',
                    opacity: status.includes('speaking') ? 1 : 0.3 
                  }}
                />
              ))}
           </div>
        </div>

        {/* Self-View (PIP) */}
        <div className="absolute bottom-16 right-16 w-80 aspect-video bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl transition-all hover:scale-105 group">
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
           {!isVideoOn && (
             <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
                <VideoOff className="w-8 h-8 text-white/20" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Privacy Protected</span>
             </div>
           )}
           <div className="absolute top-4 left-4 p-2.5 bg-black/50 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3 text-white" />
           </div>
           <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10">You (HD)</div>
           </div>
        </div>

        <canvas ref={canvasRef} className="hidden" width="640" height="360" />
      </div>

      {/* Control Dock with PhoneOff and other actions */}
      <div className="p-16 flex justify-center">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-12 py-7 rounded-[3rem] flex items-center gap-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleMic}
              className={`p-7 rounded-[1.8rem] transition-all transform active:scale-90 ${isMicOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/20'}`}
            >
              {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`p-7 rounded-[1.8rem] transition-all transform active:scale-90 ${isVideoOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/20'}`}
            >
              {isVideoOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </button>
          </div>

          <div className="w-px h-12 bg-white/10" />

          <button 
            onClick={endSession}
            className="p-7 bg-rose-600 text-white rounded-[1.8rem] shadow-2xl shadow-rose-600/30 hover:bg-rose-500 transition-all transform hover:scale-110 active:scale-90"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <div className="w-px h-12 bg-white/10" />

          <button className="p-7 bg-white/5 text-white rounded-[1.8rem] hover:bg-white/10 transition-all">
            <MoreVertical className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTherapy;
