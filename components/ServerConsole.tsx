
import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  Database, 
  Server as ServerIcon, 
  Settings, 
  X, 
  Globe, 
  Zap, 
  Activity,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Shield,
  Code
} from 'lucide-react';
import { API } from '../api';

const ServerConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 45, latency: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const health = await API.diagnostics.checkBackend();
    if (health.online) {
      setBackendStatus('online');
      setMetrics(prev => ({ ...prev, latency: 12 }));
      // Fixed: property 'node' does not exist on the type returned by API.diagnostics.checkBackend, using 'mode' instead.
      addLog(`[INFO] Connection established to ${health.mode} node`, 'success');
    } else {
      setBackendStatus('offline');
      addLog(`[WARN] Flask Backend Offline at http://localhost:5000`, 'error');
    }
  };

  const addLog = (msg: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), `[${time}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="bg-[#020617] rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col h-[550px] relative font-mono">
      {/* Top Bar */}
      <div className="bg-white/5 p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <TerminalIcon className="w-5 h-5 text-indigo-400" />
           <div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Mindcore_Neural_Node</span>
              <span className={`text-[9px] font-bold uppercase ${backendStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {backendStatus === 'online' ? 'BRIDGE_ACTIVE' : 'BRIDGE_DISCONNECTED'}
              </span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <MetricItem icon={<Activity size={10}/>} value={`${metrics.latency}ms`} />
           <button onClick={() => setShowConfig(!showConfig)} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
              <Settings size={16} />
           </button>
        </div>
      </div>

      {/* Connectivity Config / Guide Overlay */}
      {showConfig && (
        <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-10 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-3">
                 <Shield className="text-indigo-400" size={16} /> Localhost Fix Guide
              </h3>
              <button onClick={() => setShowConfig(false)} className="text-white/20 hover:text-white"><X size={20} /></button>
           </div>
           
           <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">1. Run Order (VS Code)</p>
                 <ul className="text-[11px] text-white/60 space-y-2">
                    <li>• Start Flask: <code className="text-emerald-400">python app.py</code></li>
                    <li>• Start Frontend: <code className="text-emerald-400">npm run dev</code></li>
                 </ul>
              </div>

              <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/20">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield size={12}/> 2. Windows Firewall Fix
                 </p>
                 <p className="text-[10px] text-white/40 mb-3 leading-relaxed">Run this command in Admin PowerShell if port 5000 is blocked:</p>
                 <div className="bg-black/40 p-4 rounded-xl flex items-center justify-between group">
                    <code className="text-[10px] text-white/80 break-all">New-NetFirewallRule -DisplayName "Mindcore-Flask" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow</code>
                 </div>
              </div>

              <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Code size={12}/> 3. Troubleshooting CORS
                 </p>
                 <p className="text-[10px] text-white/40 leading-relaxed">Ensure <code className="text-white/80">flask-cors</code> is installed and initialized in your Python script to allow requests from port 3000/5173.</p>
              </div>

              <button 
                onClick={checkConnection}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs shadow-2xl transition-all active:scale-95"
              >
                Retest Bridge Connectivity
              </button>
           </div>
        </div>
      )}

      {/* Terminal Output */}
      <div ref={scrollRef} className="flex-1 p-8 space-y-2 overflow-y-auto scroll-smooth custom-scrollbar text-[11px]">
         {logs.map((log, i) => (
           <div key={i} className="flex gap-4 group">
              <span className={`
                ${log.includes('error') || log.includes('WARN') ? 'text-rose-400' : 
                  log.includes('success') ? 'text-emerald-400' : 'text-slate-500'}
              `}>{log}</span>
           </div>
         ))}
         <div className="flex gap-4 text-white">
            <span className="opacity-20 animate-pulse">>>></span>
            <span className="animate-pulse font-black">_</span>
         </div>
      </div>

      {/* Footer Status */}
      <div className="bg-black/50 p-6 flex items-center justify-around border-t border-white/5 backdrop-blur-xl">
         <StatusTag icon={<Database size={10}/>} label="ENGINE" value={backendStatus === 'online' ? 'REAL_FLASK' : 'VIRTUAL_JS'} color={backendStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'} />
         <StatusTag icon={<Globe size={10}/>} label="PORT" value="5000" color="text-indigo-400" />
         <StatusTag icon={<ShieldCheck size={10}/>} label="CORS" value="ALLOWED" color="text-emerald-400" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const MetricItem = ({ icon, value }: { icon: any, value: string }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
     <span className="text-indigo-400">{icon}</span>
     <span className="text-[9px] font-black text-white/50">{value}</span>
  </div>
);

const StatusTag = ({ icon, label, value, color }: { icon: any, label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-2">
     <span className="text-white/10">{icon}</span>
     <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">{label}:</span>
     <span className={`text-[9px] font-black uppercase tracking-widest ${color || 'text-white/40'}`}>{value}</span>
  </div>
);

export default ServerConsole;
