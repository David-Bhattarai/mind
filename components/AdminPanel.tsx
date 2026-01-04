
import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Activity, Search, Trash2, Database, Server, RefreshCw, Terminal, AlertTriangle } from 'lucide-react';
import { API } from '../api';

const AdminPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const systemData = await API.admin.getSystemData();
    setData(systemData);
    setLoading(false);
  };

  const handleTerminate = async (userId: string) => {
    if (confirm('TERMINATE USER: Are you sure? All neural links will be severed.')) {
      await API.admin.terminateUser(userId);
      loadData();
    }
  };

  if (loading || !data) return <div className="p-20 text-center animate-pulse text-indigo-600 font-black">ACCESSING SECURE DATA...</div>;

  const filteredUsers = data.users.filter((u: any) => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-black text-slate-900 font-serif">Command Center</h1>
        <button onClick={loadData} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:rotate-180 transition-all duration-500">
          <RefreshCw className="w-5 h-5 text-indigo-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <StatCard label="Total Nodes" value={data.stats.users} icon={<Users />} />
        <StatCard label="Neural Logs" value={data.stats.activities} icon={<Activity />} />
        <StatCard label="Alert Triggers" value={data.stats.alerts} icon={<AlertTriangle />} />
        <StatCard label="Cluster Size" value={`${data.stats.storageUsed} KB`} icon={<Database />} />
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-black font-serif">Identity Registry</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by neural tag..."
              className="pl-12 pr-6 py-3 bg-slate-50 rounded-xl font-bold border-none"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="p-8">Neural Identity</th>
              <th className="p-8">Status</th>
              <th className="p-8">XP Core</th>
              <th className="p-8 text-right">Access Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((u: any) => (
              <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                <td className="p-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">{u.username[0]}</div>
                      <div>
                         <p className="font-black text-slate-800">{u.username}</p>
                         <p className="text-[10px] text-slate-400 font-mono">{u._id}</p>
                      </div>
                   </div>
                </td>
                <td className="p-8">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.plan === 'PRO' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {u.plan} NODE
                   </span>
                </td>
                <td className="p-8 font-black text-indigo-600">{u.xp || 0}</td>
                <td className="p-8 text-right">
                   {u.username !== 'admin' && (
                     <button onClick={() => handleTerminate(u._id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:scale-105 transition-all">
    <div className="p-5 bg-indigo-600 text-white rounded-2xl shadow-2xl group-hover:rotate-6 transition-transform">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

export default AdminPanel;
