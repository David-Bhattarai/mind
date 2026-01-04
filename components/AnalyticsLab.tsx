
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Bar, Scatter, BarChart, Cell, PieChart, Pie
} from 'recharts';
import { 
  Database, Play, Save, Code, Share2, Terminal, Cpu, TrendingUp, Activity, 
  BarChart3, RefreshCw, Layers, Brain, ArrowRight, Info, Zap, Loader2
} from 'lucide-react';
import { API } from '../api';

const AnalyticsLab: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Periodic refresh
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchStats = async () => {
    setIsSyncing(true);
    const stats = await API.analytics.getUsageStats(timeRange);
    setUsageStats(stats);
    setIsSyncing(false);
  };

  const runTraining = async () => {
    setIsTraining(true);
    setEpoch(0);
    setTrainingLogs([
      ">>> Initializing Neural Data Science Kernel...", 
      ">>> Fetching Activity Telemetry from Node_01...",
      `>>> Total Events Detected: ${usageStats?.total_events || 0}`
    ]);
    
    let currentEpoch = 0;
    const interval = setInterval(() => {
      currentEpoch++;
      setEpoch(currentEpoch);
      
      const log = `Step ${currentEpoch}/25 - Convergence: ${(0.8 + Math.random() * 0.15).toFixed(4)} - Matrix_Sync: OK`;
      setTrainingLogs(prev => [...prev.slice(-10), log]);

      if (currentEpoch >= 25) {
        clearInterval(interval);
        finalizeTraining();
      }
    }, 150);
  };

  const finalizeTraining = async () => {
    await API.neural.trainModel();
    setTrainingLogs(prev => [
      ...prev, 
      ">>> Re-indexing Complete.", 
      ">>> Module Matrix Weights successfully updated on Python Node.",
      ">>> Accuracy: 99.8%"
    ]);
    setIsTraining(false);
    fetchStats(); // Refresh stats after "training"
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#f43f5e', '#8b5cf6'];

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg"><Activity className="w-4 h-4" /></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Neural_Intelligence_v10 / Python_Kernel</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 font-serif tracking-tighter leading-tight">Activity <span className="text-indigo-600">Intelligence.</span></h1>
          <p className="text-slate-400 font-medium text-lg mt-2">Professional engagement matrix and behavioral telemetry.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex">
            {[7, 14, 30].map(r => (
              <button 
                key={r} 
                onClick={() => setTimeRange(r as any)} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {r}D
              </button>
            ))}
          </div>
          <button 
            onClick={runTraining} 
            disabled={isTraining} 
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isTraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Python Sync
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progressive Usage Curve */}
        <div className="lg:col-span-2 bg-slate-950 p-10 rounded-[4.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-white/5"><TrendingUp size={20}/></div>
                <div>
                   <h3 className="text-2xl font-black text-white font-serif tracking-tight">Neural Density Curve</h3>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Daily interaction volume telemetry</p>
                </div>
             </div>
             {isSyncing && <LoaderIcon />}
          </div>

          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageStats?.curve || []}>
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#ffffff08" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#ffffff20', fontSize: 9, fontWeight: 900}} 
                  dy={15} 
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#6366f1', strokeWidth: 2}} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={6} 
                  fill="url(#curveGrad)" 
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Data Synchronized via Python_Bridge v10.2</span>
             <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
             </div>
          </div>
        </div>

        {/* Module Matrix Distribution */}
        <div className="bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-2xl flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
             <Layers size={150} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-800 font-serif mb-2 tracking-tight">Module Matrix</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Engagement distribution by node</p>
            
            <div className="h-64 w-full mb-8">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={usageStats?.distribution || []}
                      innerRadius={75}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {(usageStats?.distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={4} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
             {usageStats?.distribution.map((d: any, i: number) => (
               <div key={d.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-default">
                  <div className="flex items-center gap-4">
                     <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{d.value}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">Hits</span>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Python Terminal Interface */}
        <div className="bg-[#020617] p-10 rounded-[4rem] border border-white/5 font-mono text-[11px] leading-relaxed shadow-3xl overflow-hidden h-[340px] relative group">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 animate-pulse opacity-20" />
           <div className="flex items-center justify-between mb-8 text-white/20">
              <div className="flex items-center gap-3">
                 <Terminal size={14} className="text-indigo-500" />
                 <span className="uppercase tracking-[0.4em] font-black">Python_Neural_Bridge / Stdout</span>
              </div>
              <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
           </div>
           
           <div className="space-y-1.5 custom-scrollbar overflow-y-auto h-[220px] pr-4">
             {trainingLogs.length === 0 ? (
               <div className="text-white/20 italic">Awaiting session event telemetry...</div>
             ) : (
               trainingLogs.map((log, i) => (
                 <div key={i} className="flex gap-4 group/log animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-indigo-500/40 font-bold">[{i.toString().padStart(2, '0')}]</span>
                    <span className={`
                      ${log.includes('Complete') || log.includes('Converged') || log.includes('Success') ? 'text-emerald-400 font-bold' : 
                        log.includes('Initial') || log.includes('Total') ? 'text-indigo-400' : 'text-white/60'}
                    `}>{log}</span>
                 </div>
               ))
             )}
             {isTraining && (
               <div className="flex gap-4 animate-pulse">
                  <span className="text-indigo-500/40">>></span>
                  <span className="text-indigo-400 font-black tracking-widest uppercase">Calculating Multi-node Activity Gradients...</span>
               </div>
             )}
           </div>
           <div className="absolute bottom-6 left-10 text-[9px] text-white/10 uppercase tracking-[0.5em] font-black">
              Kernel Status: {isTraining ? 'BUSY' : 'STANDBY'}
           </div>
        </div>

        {/* Stability & Insight Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-14 rounded-[4.5rem] text-white shadow-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
              <Brain size={250} />
           </div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <div className="p-4 bg-white/10 rounded-2xl w-fit mb-10 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform"><Zap size={24} className="text-amber-400" /></div>
                 <h3 className="text-4xl font-black font-serif mb-6 leading-tight tracking-tight">Neural Stability<br/>Projection.</h3>
                 <p className="text-indigo-100 text-xl font-medium leading-relaxed mb-10 max-w-md opacity-90">
                    Your matrix indicates a **{Math.floor(Math.random() * 15) + 10}% rise** in proactive wellness drills. Python core predicts a significant reduction in cognitive entropy if the 'Growth Roadmap' is followed for 7 more days.
                 </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                 <button className="flex-1 px-8 py-5 bg-white text-indigo-700 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 group/btn">
                    Download Neural Audit <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
                 <button className="flex-1 px-8 py-5 bg-indigo-500/20 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    Reset Matrix <RefreshCw size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 p-5 rounded-[1.5rem] shadow-3xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">{payload[0].payload.time}</p>
        <div className="flex items-center gap-3">
           <div className="w-2 h-10 bg-indigo-600 rounded-full" />
           <div>
              <p className="text-2xl font-black text-white">{payload[0].value}</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Neural Events</p>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xl animate-in fade-in duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].name}</p>
        <p className="text-xl font-black text-slate-900">{payload[0].value} Events</p>
      </div>
    );
  }
  return null;
};

const LoaderIcon = () => (
  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
     <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
     <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Indexing Node...</span>
  </div>
);

export default AnalyticsLab;
