import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  LayoutDashboard, 
  LogOut, 
  ShieldAlert,
  Video,
  Scan,
  Cpu,
  Star,
  User as UserIcon,
  Lock,
  Zap,
  Layout,
  Gamepad2,
  BarChart3,
  ArrowRight,
  Activity,
  Layers,
  Terminal,
  Brain,
  Stethoscope,
  PhoneCall,
  Info,
  Key,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  Globe
} from 'lucide-react';
import AIChat from './components/AIChat';
import CrisisCenter from './components/CrisisCenter';
import EmotionScanner from './components/EmotionScanner';
import ProfessionalFrontier from './components/ProfessionalFrontier';
import StressReliefCenter from './components/StressReliefCenter';
import AnalyticsLab from './components/AnalyticsLab';
import ProfessionalSupport from './components/ProfessionalSupport';
import VideoCallSimulation from './components/VideoCallSimulation';
import ServerConsole from './components/ServerConsole';
import { API } from './api';
import { testConnection } from './geminiService';

type Tab = 'home' | 'chat' | 'doctors' | 'scanner' | 'frontier' | 'games' | 'crisis' | 'lab' | 'call' | 'console';

const NepalFlag = () => (
  <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-10 inline-block drop-shadow-xl">
    <path d="M0 0V28L24 14.5L7.5 14.5L20 0H0Z" fill="#DC143C"/>
    <path d="M0 0V28L24 14.5L7.5 14.5L20 0H0Z" stroke="#003893" strokeWidth="1.5"/>
    <circle cx="5" cy="19" r="2.5" fill="white"/>
    <circle cx="5" cy="7" r="2" fill="white"/>
  </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [backendMode, setBackendMode] = useState<'FLASK' | 'VIRTUAL'>('VIRTUAL');
  const [apiError, setApiError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    const active = API.auth.getCurrentUser();
    if (active) setUser(active);
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setApiStatus('checking');
    setBackendStatus('checking');
    
    // Test Gemini AI
    const apiResult = await testConnection();
    if (apiResult.success) {
      setApiStatus('ok');
    } else {
      setApiStatus('fail');
      setApiError(apiResult.error || 'API Key Error');
    }

    // Test Flask Backend
    const backendResult = await API.diagnostics.checkBackend();
    if (backendResult.online) {
      setBackendStatus('ok');
      setBackendMode(backendResult.mode as any);
    } else {
      setBackendStatus('fail');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) return;
    setLoading(true);
    try {
      let result = authMode === 'login' 
        ? await API.auth.login(username, pin) 
        : await API.auth.register(username, pin);

      if (result) {
        setUser(result);
        localStorage.setItem('mindcore_session', JSON.stringify(result));
      } else {
        alert("Login failed. Check your username and PIN.");
      }
    } catch (err) {
      alert("Authentication Error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const startDoctorCall = (doctor: any) => {
    setSelectedDoctor(doctor);
    setActiveTab('call');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans text-slate-200">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-indigo-600/10 blur-[200px] rounded-full animate-pulse"></div>
        <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-12 border border-white/10 shadow-3xl relative z-10 text-center">
          <div className="mb-10 flex flex-col items-center">
             <NepalFlag />
             <h1 className="text-4xl font-black text-white mt-6 tracking-tighter uppercase">Mindcore OS</h1>
             <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Professional Wellness Node</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Login</button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Register</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4 text-left">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Identity Hash</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/20 text-white rounded-2xl p-5 border border-white/5 focus:outline-none focus:border-indigo-500 transition-all font-bold" placeholder="Username" />
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Neural Pin</label>
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-black/20 text-white rounded-2xl p-5 border border-white/5 focus:outline-none focus:border-rose-500 transition-all font-bold" placeholder="••••" />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-3">
               {loading ? 'Booting...' : (authMode === 'login' ? 'Establish Connection' : 'Register Identity')} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {authMode === 'login' && (
            <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-4">
              <Key className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Guest Credentials</p>
                <p className="text-[11px] text-white/40">admin / 1234</p>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
             <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                By connecting, you acknowledge this is an AI clinical support tool.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 flex-col h-full hidden md:flex shrink-0">
        <div className="p-10 flex items-center gap-4">
          <NepalFlag />
          <span className="font-black text-2xl text-white font-serif">Mindcore</span>
        </div>
        <nav className="flex-1 px-6 space-y-1">
          <SideNav active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Layers />} label="Dashboard" />
          <SideNav active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageCircle />} label="AI Therapist" />
          <SideNav active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} icon={<Scan />} label="Bio Scanner" />
          <SideNav active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} icon={<Stethoscope />} label="Pro Support" />
          <SideNav active={activeTab === 'frontier'} onClick={() => setActiveTab('frontier')} icon={<Star />} label="Expansion Lab" />
          <SideNav active={activeTab === 'games'} onClick={() => setActiveTab('games')} icon={<Gamepad2 />} label="Stress Reliever" />
          <div className="h-px bg-white/5 my-6"></div>
          <SideNav active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal />} label="Server Console" />
          <SideNav active={activeTab === 'crisis'} onClick={() => setActiveTab('crisis')} icon={<ShieldAlert />} label="Emergency" color="text-rose-400" />
        </nav>
        <div className="p-8 border-t border-white/5">
           <button onClick={API.auth.logout} className="flex items-center gap-4 w-full p-4 rounded-xl text-slate-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Disconnect Node
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto relative bg-slate-50">
        <div className={`p-8 md:p-16 max-w-7xl mx-auto ${activeTab === 'call' || activeTab === 'console' ? 'max-w-none' : ''}`}>
          
          {/* Diagnostic Health Alert - Show only if AI is broken */}
          {(apiStatus === 'fail') && activeTab === 'home' && (
            <div className="mb-12 p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-rose-500 rounded-2xl text-white shadow-lg"><AlertCircle /></div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 font-serif">AI Connection Issues</h4>
                    <div className="flex gap-4 mt-2">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 text-rose-600`}>
                          AI Link Error: {apiError}
                       </span>
                    </div>
                  </div>
               </div>
               <div className="flex gap-3">
                 <button onClick={checkHealth} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl">
                   <RefreshCw size={14} /> Retry Sync
                 </button>
               </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h1 className="text-7xl font-black text-slate-900 font-serif tracking-tighter">Namaste, <span className="text-indigo-600">{user.username}.</span></h1>
                    <div className="flex items-center gap-3 mt-4">
                       <p className="text-slate-400 text-2xl font-medium italic">"System check complete. Cognitive load is normal."</p>
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${apiStatus === 'ok' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {apiStatus === 'ok' ? <Wifi size={10} /> : <WifiOff size={10} />}
                          AI Link: {apiStatus === 'ok' ? 'Secure' : 'Standby'}
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 bg-indigo-50 text-indigo-600`}>
                          <Cpu size={10} />
                          Backend: {backendMode} Mode
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white"><Zap size={20}/></div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">XP Core</p>
                           <p className="text-xl font-black text-slate-900">{user.xp || 0}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Activity size={250} className="text-indigo-400" /></div>
                     <div className="relative z-10">
                        <h3 className="text-3xl font-black font-serif mb-8">Neural Trajectory</h3>
                        <p className="text-slate-400 text-lg mb-10 max-w-xl italic">"Our AI detected a 12% rise in your calm markers today. Engaging in one deep breathing session could optimize this further."</p>
                        <button onClick={() => setActiveTab('scanner')} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase text-[10px] tracking-widest flex items-center gap-3">
                           Run Bio-Scan <Scan size={16} />
                        </button>
                     </div>
                  </div>
                  <div className="lg:col-span-4 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl">
                     <h4 className="text-xl font-black font-serif mb-6">Quick Actions</h4>
                     <div className="space-y-4">
                        <QuickAction icon={<MessageCircle />} label="Talk to Therapist" onClick={() => setActiveTab('chat')} />
                        <QuickAction icon={<PhoneCall />} label="Call Pro Support" onClick={() => setActiveTab('doctors')} />
                        <QuickAction icon={<Gamepad2 />} label="Instant Stress Relief" onClick={() => setActiveTab('games')} />
                     </div>
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'chat' && <AIChat onCrisisDetected={() => setActiveTab('crisis')} />}
          {activeTab === 'scanner' && <EmotionScanner onRecommendation={(tab) => setActiveTab(tab as any)} />}
          {activeTab === 'doctors' && <ProfessionalSupport onStartCall={startDoctorCall} />}
          {activeTab === 'frontier' && <ProfessionalFrontier />}
          {activeTab === 'games' && <StressReliefCenter />}
          {activeTab === 'crisis' && <CrisisCenter />}
          {activeTab === 'console' && <div className="max-w-5xl mx-auto"><ServerConsole /></div>}
          {activeTab === 'call' && <VideoCallSimulation doctor={selectedDoctor} onEnd={() => setActiveTab('doctors')} />}
        </div>
      </main>
    </div>
  );
};

const SideNav = ({ active, onClick, icon, label, color }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl' : `text-slate-400 hover:bg-white/5 hover:text-white ${color || ''}`}`}>
    <span className="w-4 h-4">{icon}</span>
    <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

const QuickAction = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group">
    <div className="flex items-center gap-4">
      <div className="text-indigo-600 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{label}</span>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default App;