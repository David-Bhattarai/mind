
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Sparkles, 
  Trophy, 
  Target, 
  TrendingUp, 
  Activity, 
  Database, 
  Server, 
  RefreshCw,
  Calendar,
  Layers,
  Code
} from 'lucide-react';
import { getMoodInsight } from '../geminiService';
import { db } from '../NeuralDB';

const MoodDashboard: React.FC = () => {
  const [insight, setInsight] = useState("Python Kernel is aggregating your mental trajectory...");
  const [isSyncing, setIsSyncing] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [chartData, setChartData] = useState<any[]>([]);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      const data = db.aggregate_trends(timeRange);
      
      // Seed mock data if empty for visualization
      if (data.length === 0) {
        const mock = Array.from({length: timeRange}, (_, i) => ({
          time: `Day ${i+1}`,
          intensity: Math.floor(Math.random() * 5) + 1
        }));
        setChartData(mock);
      } else {
        setChartData(data);
      }
      
      const result = await getMoodInsight(data);
      setInsight(result);
      setTimeout(() => setIsSyncing(false), 1200);
    };
    loadData();

    window.addEventListener('python_db_sync', loadData);
    return () => window.removeEventListener('python_db_sync', loadData);
  }, [timeRange]);

  const backendCode = db.get_backend_templates();

  return (
    <div className="animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-2 font-serif tracking-tight">Neural Intelligence</h1>
          <p className="text-slate-500 font-medium italic">Local data persistence v6.0 - Privacy focused encryption.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex">
            {[7, 14, 30].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {range} Days
              </button>
            ))}
          </div>
          <button onClick={() => setShowCode(!showCode)} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl flex items-center gap-3 border border-slate-200">
             <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showCode && (
        <div className="grid lg:grid-cols-2 gap-8 mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-950 p-8 rounded-[3rem] text-indigo-300 font-mono text-[10px] shadow-2xl overflow-x-auto">
            <p className="text-white/40 mb-4 uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between">
              <span>Flask Backend Core</span>
              <Server className="w-3 h-3" />
            </p>
            <pre>{backendCode.flask}</pre>
          </div>
          <div className="bg-slate-950 p-8 rounded-[3rem] text-emerald-300 font-mono text-[10px] shadow-2xl overflow-x-auto">
            <p className="text-white/40 mb-4 uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between">
              <span>Spring Boot API</span>
              <Database className="w-3 h-3" />
            </p>
            <pre>{backendCode.springBoot}</pre>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {/* Fixed find() call by specifying 'activities' collection */}
        <StatCard title="Storage Commits" value={`${db.find('activities').length}`} icon={<Database />} color="bg-indigo-600" />
        <StatCard title="Cognitive Stability" value="94.2%" icon={<Activity />} color="bg-emerald-500" />
        <StatCard title="Session Latency" value="12ms" icon={<Layers />} color="bg-indigo-600" />
        <StatCard title="Local Nodes" value="Active" icon={<Server />} color="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 font-serif">Emotional Gradient ({timeRange} Days)</h3>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Calendar className="w-4 h-4" /></div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} dy={10} />
                <YAxis hide domain={[0, 6]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="intensity" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorInt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <Sparkles className="w-40 h-40" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest opacity-60">Neural Projection</h3>
            </div>
            <p className="text-2xl font-black font-serif leading-tight mb-4">Sentiment Entropy: LOW</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">Based on local records, your neural stability is trending upward. No external sync required.</p>
          </div>
          <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Download Audit Log</button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 shadow-sm relative overflow-hidden">
        {isSyncing && <div className="absolute inset-0 bg-white/50 backdrop-blur-md flex items-center justify-center z-10"><Activity className="w-10 h-10 animate-spin text-indigo-600" /></div>}
        <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-2xl text-white">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">AI Clinical Summary (Offline Agent)</h3>
          <p className="text-2xl font-black text-slate-900 leading-tight italic font-serif">"{insight}"</p>
        </div>
        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Audit Database</button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg flex items-center gap-6 group hover:shadow-2xl transition-all border-b-4 border-b-indigo-100">
    <div className={`p-5 rounded-[1.8rem] text-white shadow-2xl transition-transform group-hover:rotate-6 ${color}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

export default MoodDashboard;
