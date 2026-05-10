import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCcw, 
  Wallet,
  Sparkles,
  Calculator,
  ArrowUpRight
} from 'lucide-react';

const IntelligenceModals = ({ isOpen, onClose, type }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(120000);
  const tenure = 12; // months
  const interestRate = 7.5; // %

  const projectedInterest = (amount * interestRate * (tenure / 12)) / 100;
  const totalMaturity = amount + projectedInterest;

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const resetModal = () => {
    setStep(1);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetModal}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          className="relative w-full h-full lg:h-auto lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Savings Optimizer</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Smart Wealth Lab</p>
            </div>
            <button onClick={resetModal} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {step === 3 ? (
              <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-200"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Optimization Complete</h2>
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Growth Engine Started</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl w-full">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected Gains</span>
                      <span className="text-emerald-500 font-black text-xs">+₹{projectedInterest.toLocaleString()}</span>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Maturity</p>
                   <p className="text-2xl font-black text-slate-900">₹{totalMaturity.toLocaleString()}</p>
                </div>
                <button 
                  onClick={resetModal}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                >
                  Return to Intelligence
                </button>
              </div>
            ) : (
              <div className="p-8 lg:p-10 space-y-8">
                <div className="bg-primary-50 p-6 rounded-[2rem] border border-primary-100 flex items-start gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm text-primary-600">
                      <Sparkles size={20} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-primary-900 uppercase tracking-widest">Optimization Strategy</h4>
                      <p className="text-[12px] text-primary-700 font-medium leading-relaxed">
                        We recommend moving ₹{amount.toLocaleString()} to a high-yield Flexi-FD at {interestRate}% p.a.
                      </p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Investment Amount</label>
                      <div className="relative">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                         <input 
                           type="number"
                           value={amount}
                           onChange={(e) => setAmount(Number(e.target.value))}
                           className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:bg-white transition-all"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
                         <p className="text-sm font-black text-slate-900">{interestRate}% p.a.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tenure</p>
                         <p className="text-sm font-black text-slate-900">{tenure} Months</p>
                      </div>
                   </div>

                   <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Projected Growth</span>
                         </div>
                         <ArrowUpRight size={16} className="text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-2xl font-black tracking-tight">₹{projectedInterest.toLocaleString()}</p>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Earned Interest in {tenure} months</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-slate-400">
                      <ShieldCheck size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">DICGC Insured up to ₹5 Lakh</p>
                   </div>
                   <button 
                     onClick={handleAction}
                     disabled={loading}
                     className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-3"
                   >
                     {loading ? <RefreshCcw className="animate-spin" /> : 'Confirm & Move Money'}
                   </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IntelligenceModals;
