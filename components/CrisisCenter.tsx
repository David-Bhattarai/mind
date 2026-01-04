
import React, { useState } from 'react';
import { ShieldAlert, Phone, User, Home, LifeBuoy, Heart, Share2, AlertTriangle, ArrowRight } from 'lucide-react';

const CrisisCenter: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const helplines = [
    { name: "Nepal Mental Health Support", number: "1166", desc: "Government of Nepal National Helpline" },
    { name: "TUTH Psych Hotline", number: "9840021212", desc: "Available 24/7 for counseling" },
    { name: "Suicide Lifeline (International)", number: "988", desc: "Global support standard" },
  ];

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto">
      <div className="mb-12 flex items-start gap-8">
        <div className="p-6 bg-red-600 rounded-[2.5rem] text-white shadow-2xl shadow-red-200">
           <ShieldAlert className="w-12 h-12" />
        </div>
        <div>
          <p className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mb-2">Emergency Hub</p>
          <h1 className="text-5xl font-black text-slate-900 mb-4 font-serif">You are not alone.</h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed italic">"अध्यारो पछि उज्यालो आउछ" - Light comes after darkness. Immediate tools for your safety.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white/80 backdrop-blur-xl border border-red-100 rounded-[4rem] p-12 shadow-2xl shadow-red-100/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <AlertTriangle className="w-64 h-64 text-red-600" />
             </div>
             <h2 className="text-3xl font-black mb-8 font-serif text-slate-900 flex items-center gap-4">
               Emergency Contact Numbers <Phone className="w-6 h-6 text-red-500" />
             </h2>
             <div className="grid md:grid-cols-2 gap-6">
                {helplines.map(h => (
                  <a key={h.name} href={`tel:${h.number.replace(/\D/g,'')}`} className="block p-8 bg-red-50/50 hover:bg-red-500 hover:text-white rounded-[3rem] border border-red-100 transition-all group relative">
                     <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-lg uppercase tracking-wider">{h.name}</span>
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                           <Phone className="w-5 h-5" />
                        </div>
                     </div>
                     <p className="text-3xl font-black mb-2">{h.number}</p>
                     <p className="opacity-60 text-sm font-bold uppercase tracking-widest">{h.desc}</p>
                     <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                        <ArrowRight className="w-6 h-6" />
                     </div>
                  </a>
                ))}
             </div>
          </section>

          <section className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-10">
               <h3 className="text-3xl font-black font-serif">Immediate Safety Plan</h3>
               <span className="px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Critical Steps</span>
             </div>
             <div className="grid md:grid-cols-2 gap-8">
                <SafetyCard icon={<Home />} label="Safe Environment" desc="Isolate from items that might trigger or harm. Move to a bright, open area." />
                <SafetyCard icon={<User />} label="Voice Connection" desc="Call your 'Anchor Person' (Mom, Best Friend, Mentor) right now. Don't speak, just listen." />
                <SafetyCard icon={<Heart />} label="Small Joy" desc="Find one physical object in your room. Describe its texture out loud. Ground yourself." />
                <SafetyCard icon={<LifeBuoy />} label="Professional Check-in" desc="We've pre-drafted a message for your doctor. Tap to send when you feel steady." />
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-100/10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg">
                    <Share2 className="w-6 h-6" />
                 </div>
                 <h4 className="font-black text-xl text-slate-800 tracking-tight">Your Circle</h4>
              </div>
              <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed italic">Notify your trusted network that you are feeling overwhelmed.</p>
              <div className="space-y-4">
                 <button className="w-full p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between hover:bg-indigo-50 hover:border-indigo-100 transition-all border border-transparent group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-slate-100">M</div>
                       <span className="font-bold text-slate-700">Aama (Primary)</span>
                    </div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full group-hover:animate-ping"></div>
                 </button>
                 <button className="w-full p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between hover:bg-indigo-50 hover:border-indigo-100 transition-all border border-transparent">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-slate-100">S</div>
                       <span className="font-bold text-slate-700">Subash (Anchor)</span>
                    </div>
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                 </button>
              </div>
              <button className="w-full mt-8 py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl">
                 Alert Everyone
              </button>
           </div>

           <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 transition-transform">
                 <AlertTriangle className="w-40 h-40" />
              </div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 opacity-80">AI Guardian Mode</h4>
              <p className="text-lg font-bold leading-relaxed mb-6">Our ML models are actively scanning context. You are protected by Mindcore's Ethical Safety Mesh.</p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">System Armed</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Fixed: Corrected React.cloneElement by casting 'icon' to React.ReactElement<any> to resolve the 'className' type error.
const SafetyCard: React.FC<{ icon: React.ReactNode; label: string; desc: string }> = ({ icon, label, desc }) => (
  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors group">
     <div className="p-4 bg-white/10 rounded-2xl shadow-sm w-fit mb-6 text-indigo-400 group-hover:text-white transition-colors">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
     </div>
     <h4 className="font-black text-xl mb-3 tracking-tight">{label}</h4>
     <p className="text-slate-400 text-sm font-medium leading-relaxed">{desc}</p>
  </div>
);

export default CrisisCenter;
