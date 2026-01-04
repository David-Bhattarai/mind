
import React from 'react';
import { 
  Stethoscope, 
  Video, 
  Star, 
  Award, 
  Clock, 
  ArrowRight,
  User,
  Activity,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface ProfessionalSupportProps {
  onStartCall: (doctor: any) => void;
}

const ProfessionalSupport: React.FC<ProfessionalSupportProps> = ({ onStartCall }) => {
  const dummyDoctors = [
    { 
      id: 'dr1', 
      name: 'Dr. Aarav Sharma', 
      specialty: 'CBT & Mental Wellness', 
      experience: '12+ Years', 
      status: 'Online', 
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
      rating: 4.9,
      bio: "Expert in anxiety reduction and stress management using advanced cognitive behavioral frameworks."
    },
    { 
      id: 'dr2', 
      name: 'Dr. Ishani Koirala', 
      specialty: 'Trauma & Mindfulness', 
      experience: '8 Years', 
      status: 'Online', 
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
      rating: 4.8,
      bio: "Focuses on trauma recovery and building resilience through mindfulness-based stress reduction."
    }
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-rose-500 rounded-lg text-white shadow-lg"><Award className="w-4 h-4" /></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Clinical Support Node</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 font-serif tracking-tighter leading-tight">Expert <span className="text-rose-500">Support.</span></h1>
          <p className="text-slate-400 font-medium text-lg mt-2 italic">Direct simulated link to licensed psychological agents.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {dummyDoctors.map(dr => (
          <div key={dr.id} className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all hover:-translate-y-2 flex flex-col md:flex-row">
            <div className="w-full md:w-64 relative grayscale group-hover:grayscale-0 transition-all duration-700">
              <img src={dr.image} alt={dr.name} className="w-full h-full object-cover" />
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {dr.status}
              </div>
            </div>
            <div className="p-10 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-3xl font-black text-slate-900 font-serif leading-none">{dr.name}</h3>
                   <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black text-slate-600">{dr.rating}</span>
                   </div>
                </div>
                <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest mb-6">{dr.specialty}</p>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 italic">"{dr.bio}"</p>
                <div className="flex gap-6 mb-10 text-slate-400">
                   <div className="flex items-center gap-2"><Clock size={14}/><span className="text-[9px] font-bold uppercase">{dr.experience}</span></div>
                   <div className="flex items-center gap-2"><CheckCircle size={14}/><span className="text-[9px] font-bold uppercase">Clinical</span></div>
                </div>
              </div>
              <button 
                onClick={() => onStartCall(dr)}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-95"
              >
                <Video size={16} /> Start Virtual Consult
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group border border-white/5">
         <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000"><Stethoscope size={250} /></div>
         <div className="relative z-10">
            <h3 className="text-3xl font-black font-serif mb-6">Disclaimer & Ethics</h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mb-10">
              The profiles above are **Simulated Clinical Agents** built for therapeutic roleplay and CBT practice. While the interactions follow professional psychological frameworks, these are not real doctors. In case of a psychiatric emergency, please visit our **Emergency Help** section immediately.
            </p>
            <div className="flex items-center gap-4">
               <ShieldCheck className="text-emerald-500" size={24} />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ethical AI Protocol Active</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProfessionalSupport;
