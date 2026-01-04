
import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Database, Server, RefreshCw, Layers } from 'lucide-react';

const NeuralKernel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initialLogs = [
      "Mindcore Python Runtime v3.11.5 initialized...",
      "Importing numpy, torch, pandas, pymongo...",
      "Connection to Virtual_MongoDB established.",
      "Awaiting Neural Input on port 8080...",
      ">>> System Status: NOMINAL",
    ];

    initialLogs.forEach((msg, i) => {
      setTimeout(() => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]), i * 500);
    });

    const handleDBSync = (e: any) => {
      const { action, size } = e.detail;
      const log = `>>> DB_EVENT: ${action} | TOTAL_RECORDS: ${size} | ENGINE: committed`;
      setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${log}`]);
    };

    window.addEventListener('python_db_sync', handleDBSync);
    return () => window.removeEventListener('python_db_sync', handleDBSync);
  }, []);

  return (
    <div className="bg-slate-950 p-8 rounded-[3rem] border border-white/10 shadow-2xl font-mono text-[11px] leading-relaxed relative overflow-hidden h-[450px]">
      <div className="absolute top-0 left-0 w-full h-12 bg-white/5 border-b border-white/10 flex items-center px-6 justify-between">
         <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-white/40 uppercase tracking-[0.2em] font-black text-[9px] flex items-center gap-2">
              <Terminal className="w-3 h-3" /> python_neural_kernel.py
            </span>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Runtime: ACTIVE</span>
         </div>
      </div>

      <div className="mt-12 space-y-2 overflow-y-auto h-[280px] pr-4 scroll-smooth">
         {logs.map((log, i) => (
           <div key={i} className={`flex gap-3 ${log.includes('>>>') ? 'text-emerald-400 font-bold' : 'text-indigo-300/60'}`}>
              <span className="opacity-20 whitespace-nowrap">{log.split(']')[0]}]</span>
              <span className="break-all">{log.split(']')[1]}</span>
           </div>
         ))}
         <div className="flex gap-3 text-white">
            <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
            <span className="animate-pulse">_</span>
         </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-8 bg-slate-900/90 backdrop-blur-md flex items-center justify-between border-t border-white/5">
         <div className="flex gap-8">
            <div className="flex flex-col gap-1">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Compute</span>
               <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-black text-white/60">TFLOP: 4.2</span>
               </div>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Storage</span>
               <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-black text-white/60">Mongo_Sync: OK</span>
               </div>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Architecture</span>
               <div className="flex items-center gap-2">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-black text-white/60">PyTorch v2.1</span>
               </div>
            </div>
         </div>
         <button onClick={() => setLogs([])} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/20">
            <RefreshCw className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};

export default NeuralKernel;
