
import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Cpu, Loader2, Sparkles, ShieldCheck, Heart, Info } from 'lucide-react';
import { getTherapyResponse, detectCrisis } from '../geminiService';
import { Message } from '../types';
import { API } from '../api';

interface AIChatProps {
  onCrisisDetected: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ onCrisisDetected }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChat = async () => {
      const history = await API.chat.getHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        const welcome: Message = {
          id: '1',
          role: 'model',
          content: "Hello. I'm your Mindcore AI Therapist. I'm here to listen, support you through CBT techniques, and provide a safe space for your thoughts. How are you feeling right now?",
          timestamp: Date.now()
        };
        setMessages([welcome]);
      }
    };
    loadChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    await API.chat.saveMessage(userMsg);
    
    setInput('');
    setIsLoading(true);

    try {
      const isCrisis = await detectCrisis(input);
      if (isCrisis) {
        onCrisisDetected();
        return;
      }

      const history = messages.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      const aiResponse = await getTherapyResponse(history, input);
      
      const botMsg: Message = { id: (Date.now()+1).toString(), role: 'model', content: aiResponse, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      await API.chat.saveMessage(botMsg);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] w-full bg-white rounded-[4rem] shadow-3xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500 relative">
      <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl text-white">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-2xl text-slate-900 font-serif tracking-tight">AI Therapist</h2>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Listening Node</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-2 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-2">
           <ShieldCheck size={12} className="text-indigo-600" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local Encrypted History</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 scroll-smooth">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-8 rounded-[2.5rem] text-lg shadow-xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
              <div className="relative z-10 whitespace-pre-wrap font-medium leading-relaxed">{m.content}</div>
              <div className="mt-4 text-[9px] opacity-30 font-mono">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Agent Processing...</span>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-10 bg-white border-t border-slate-100 flex gap-6">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts..." 
          className="flex-1 bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-6 text-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
        />
        <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-12 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
           <Send size={18} />
        </button>
      </form>

      <div className="px-10 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
         <Info size={12} className="text-slate-400" />
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Licensed as an AI Clinical Support Agent. Always consult a real doctor for medical emergencies.
         </p>
      </div>
    </div>
  );
};

export default AIChat;
