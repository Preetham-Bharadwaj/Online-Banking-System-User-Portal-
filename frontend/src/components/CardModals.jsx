import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCcw, 
  Key, 
  Lock, 
  RotateCcw, 
  Plane, 
  Sliders,
  AlertTriangle,
  ArrowRight,
  Wallet,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';

const CardModals = ({ isOpen, onClose, type, card }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [paymentType, setPaymentType] = useState('full');
  const [limits, setLimits] = useState({
    atm: 50000,
    online: 100000,
    international: 25000
  });

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

  const renderContent = () => {
    switch (type) {
      case 'Pay Bill':
        return (
          <div className="p-8 lg:p-10 space-y-8">
            {step === 1 ? (
              <>
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Statement Balance</p>
                         <h3 className="text-3xl font-black tracking-tight">₹1,12,450</h3>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                         <Clock size={20} className="text-primary-400" />
                      </div>
                   </div>
                   <div className="flex items-center gap-4 text-[11px] font-bold text-rose-400 uppercase tracking-widest">
                      <span>Due Date: Oct 30, 2023</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Choose Payment Option</p>
                   <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => setPaymentType('full')}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${paymentType === 'full' ? 'bg-primary-50 border-primary-600 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentType === 'full' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <Wallet size={18} />
                            </div>
                            <div className="text-left">
                               <p className="text-[12px] font-black text-slate-900">Total Amount Due</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Clear entire balance</p>
                            </div>
                         </div>
                         <p className="text-sm font-black text-slate-900">₹1,12,450</p>
                      </button>

                      <button 
                        onClick={() => setPaymentType('min')}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${paymentType === 'min' ? 'bg-primary-50 border-primary-600 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentType === 'min' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <RefreshCcw size={18} />
                            </div>
                            <div className="text-left">
                               <p className="text-[12px] font-black text-slate-900">Minimum Amount Due</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Avoid late fees</p>
                            </div>
                         </div>
                         <p className="text-sm font-black text-slate-900">₹5,622</p>
                      </button>
                   </div>
                </div>

                <div className="pt-4">
                   <button 
                     onClick={() => setStep(2)}
                     className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3"
                   >
                     Proceed to Pay <ArrowRight size={18} />
                   </button>
                </div>
              </>
            ) : step === 2 ? (
              <div className="space-y-8 py-4">
                 <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-slate-900">Secure Authentication</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Confirm your card PIN</p>
                 </div>
                 <div className="flex justify-center gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <input 
                        key={i}
                        type="password"
                        maxLength="1"
                        className="w-14 h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-2xl font-black text-slate-900 outline-none focus:border-primary-600 transition-all"
                        value={pin[i]}
                        onChange={(e) => {
                          const newPin = [...pin];
                          newPin[i] = e.target.value;
                          setPin(newPin);
                          if (e.target.value && i < 3) e.target.nextSibling?.focus();
                        }}
                      />
                    ))}
                 </div>
                 <button 
                   onClick={handleAction}
                   disabled={loading}
                   className="w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-3"
                 >
                   {loading ? <RefreshCcw className="animate-spin" /> : 'Authorize Payment'}
                 </button>
              </div>
            ) : (
              <div className="py-10 text-center space-y-6 flex flex-col items-center">
                 <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
                    <CheckCircle2 size={48} />
                 </motion.div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Transaction ID: VRX-9923841</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-2xl w-full flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</span>
                    <span className="text-lg font-black text-slate-900">₹{paymentType === 'full' ? '1,12,450' : '5,622'}</span>
                 </div>
                 <button onClick={resetModal} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">Done</button>
              </div>
            )}
          </div>
        );

      case 'Change PIN':
        return (
          <div className="p-8 lg:p-10 space-y-8">
            {step === 1 ? (
              <div className="space-y-8">
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                      <ShieldCheck size={20} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Secure PIN Reset</h4>
                      <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                        We will send a 6-digit OTP to your registered mobile number ending in •••• 4492.
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-600 transition-all"
                >
                  Request OTP
                </button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-8">
                 <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-slate-900">New Card PIN</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Set a secure 4-digit PIN</p>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-center gap-4">
                       {[0, 1, 2, 3].map((i) => (
                         <input 
                           key={i}
                           type="password"
                           maxLength="1"
                           className="w-14 h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-2xl font-black text-slate-900 outline-none focus:border-primary-600 transition-all"
                         />
                       ))}
                    </div>
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New PIN</p>
                    <div className="flex justify-center gap-4">
                       {[0, 1, 2, 3].map((i) => (
                         <input 
                           key={`c-${i}`}
                           type="password"
                           maxLength="1"
                           className="w-14 h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-2xl font-black text-slate-900 outline-none focus:border-primary-600 transition-all"
                         />
                       ))}
                    </div>
                 </div>
                 <button 
                   onClick={handleAction}
                   disabled={loading}
                   className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-3"
                 >
                   {loading ? <RefreshCcw className="animate-spin" /> : 'Update PIN'}
                 </button>
              </div>
            ) : (
              <div className="py-10 text-center space-y-6 flex flex-col items-center">
                 <div className="w-24 h-24 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl">
                    <CheckCircle2 size={48} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">PIN Changed</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Your new PIN is now active</p>
                 </div>
                 <button onClick={resetModal} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">Done</button>
              </div>
            )}
          </div>
        );

      case 'Freeze Card':
        return (
          <div className="p-8 lg:p-10 space-y-10">
            <div className="text-center space-y-4">
               <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Lock size={40} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Freeze This Card?</h3>
               <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                 Freezing will temporarily disable all transactions. You can unfreeze it instantly from the app at any time.
               </p>
            </div>
            
            <div className="space-y-4">
               <button 
                 onClick={handleAction}
                 className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-rose-600 transition-all"
               >
                 {loading ? <RefreshCcw className="animate-spin" /> : 'Freeze Card Now'}
               </button>
               <button onClick={resetModal} className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">Cancel</button>
            </div>
          </div>
        );

      case 'Manage Limits':
        return (
          <div className="p-8 lg:p-10 space-y-10">
            <div className="space-y-1">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Transactional Limits</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customize your spending power</p>
            </div>
            
            <div className="space-y-8">
               {[
                 { id: 'atm', label: 'ATM Withdrawal', icon: Wallet, max: 100000 },
                 { id: 'online', label: 'Online / POS', icon: Smartphone, max: 500000 },
                 { id: 'international', label: 'International', icon: Globe, max: 200000 }
               ].map((limit) => (
                 <div key={limit.id} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                             <limit.icon size={16} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{limit.label}</span>
                       </div>
                       <span className="text-sm font-black text-slate-900">₹{limits[limit.id].toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={limit.max} 
                      step="5000"
                      value={limits[limit.id]}
                      onChange={(e) => setLimits({ ...limits, [limit.id]: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary-600" 
                    />
                 </div>
               ))}
            </div>

            <button 
              onClick={handleAction}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-600 transition-all"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : 'Save New Limits'}
            </button>
          </div>
        );

      default:
        return (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
               <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Feature Coming Soon</h3>
            <p className="text-[13px] text-slate-500 font-medium">We're working on making this action functional for your secure banking.</p>
            <button onClick={resetModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Close</button>
          </div>
        );
    }
  };

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
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{type}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vertex Card Engine</p>
            </div>
            <button onClick={resetModal} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CardModals;
