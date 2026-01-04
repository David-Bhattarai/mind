
import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle, Smartphone, ArrowRight, Loader2, Award, Zap } from 'lucide-react';
import { API } from '../api';

interface PaymentHubProps {
  onSuccess: (plan: string) => void;
}

const PaymentHub: React.FC<PaymentHubProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState<'esewa' | 'fonepay' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'PRO'>('PRO');

  const plans = {
    BASIC: { name: 'Standard Shanti', price: 499, features: ['Daily AI Chat', 'Mood Tracker', 'Basic Meditations'] },
    PRO: { name: 'Ultimate Mindcore', price: 1499, features: ['Unlimited Video Consultation', 'Priority AI Models', 'Full Biometric Scan', 'Art Therapy'] }
  };

  const handleEsewa = async () => {
    setLoading('esewa');
    try {
      // 1. Initialize
      const res = await API.payments.init('ESEWA', plans[selectedPlan].price);
      // 2. Immediate Verify (Removed 2s artificial delay)
      await API.payments.verify(res.data.tx_id, 'ESEWA');
      setLoading(null);
      onSuccess(selectedPlan);
    } catch (err) {
      setLoading(null);
      alert("Payment Node Busy.");
    }
  };

  const handleFonepay = async () => {
    setLoading('fonepay');
    try {
      // 1. Initialize
      const res = await API.payments.init('FONEPAY', plans[selectedPlan].price);
      // 2. Immediate Verify (Removed 2s artificial delay)
      await API.payments.verify(res.data.tx_id, 'FONEPAY');
      setLoading(null);
      onSuccess(selectedPlan);
    } catch (err) {
      setLoading(null);
      alert("Payment Node Busy.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 font-serif mb-4">Unlock Professional Care</h2>
        <p className="text-slate-500 font-medium">Choose a plan and pay securely via eSewa or Fonepay.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {Object.entries(plans).map(([key, plan]) => (
          <button 
            key={key}
            onClick={() => setSelectedPlan(key as any)}
            className={`p-10 rounded-[3rem] border-4 transition-all text-left relative overflow-hidden ${selectedPlan === key ? 'border-indigo-600 bg-white shadow-2xl' : 'border-transparent bg-slate-50 opacity-60'}`}
          >
            {selectedPlan === key && <div className="absolute top-6 right-6 text-indigo-600"><CheckCircle className="fill-indigo-600 text-white" /></div>}
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-slate-900">Rs. {plan.price}</span>
              <span className="text-slate-400 font-bold">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="text-emerald-500" />
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Secure Payment Gateway</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={handleEsewa}
            disabled={!!loading}
            className="flex items-center justify-between px-8 py-6 bg-emerald-600 text-white rounded-3xl font-black hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg">
                <img src="https://esewa.com.np/common/images/esewa-logo.png" alt="eSewa" className="h-4" />
              </div>
              <span>Pay with eSewa</span>
            </div>
            {loading === 'esewa' ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          </button>

          <button 
            onClick={handleFonepay}
            disabled={!!loading}
            className="flex items-center justify-between px-8 py-6 bg-rose-600 text-white rounded-3xl font-black hover:bg-rose-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg">
                <Smartphone className="text-rose-600 w-4 h-4" />
              </div>
              <span>Fonepay QR / App</span>
            </div>
            {loading === 'fonepay' ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Transactions are instant and processed via Mindcore High-Speed Bridge.
        </p>
      </div>
    </div>
  );
};

export default PaymentHub;
