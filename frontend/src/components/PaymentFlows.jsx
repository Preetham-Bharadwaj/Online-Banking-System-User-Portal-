import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  ArrowRight, 
  Building2, 
  Smartphone, 
  Hash, 
  Zap, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2,
  Users,
  Plus,
  RefreshCcw,
  Clock,
  Calendar,
  MoreHorizontal
} from 'lucide-react';

const PaymentFlows = ({ isOpen, onClose, activeFlow, setFlow }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    setStep(1);
    setFormData({});
    setSearchQuery('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (step === 3) {
      return (
        <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request Processed</h2>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Reference ID: VRX-{Math.floor(Math.random() * 1000000)}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl w-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Details</p>
            <p className="text-lg font-black text-slate-900">{activeFlow === 'Bank Transfer' ? 'Transfer Initiated' : activeFlow + ' Successful'}</p>
            <p className="text-2xl font-black text-primary-600 mt-3">₹{formData.amount || '0'}</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
          >
            Done
          </button>
        </div>
      );
    }

    switch (activeFlow) {
      case 'Bank Transfer':
        return (
          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Beneficiary Details</label>
              <input 
                required
                placeholder="Account Number"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all"
                onChange={(e) => setFormData({...formData, acc: e.target.value})}
              />
              <input 
                required
                placeholder="IFSC Code"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all uppercase"
                onChange={(e) => setFormData({...formData, ifsc: e.target.value})}
              />
              <input 
                required
                placeholder="Beneficiary Name"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount & Remarks</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                <input 
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <input 
                placeholder="Remarks (Optional)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all"
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : 'Confirm Transfer'}
            </button>
          </form>
        );

      case 'UPI ID / Phone':
        return (
          <div className="p-8 lg:p-10 space-y-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Enter UPI ID or Phone..." 
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 text-sm font-bold text-slate-900 outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Beneficiaries</h4>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { n: 'Rahul', a: 'RS', c: 'bg-blue-500' },
                  { n: 'Priya', a: 'PV', c: 'bg-rose-500' },
                  { n: 'Mom', a: 'M', c: 'bg-emerald-500' },
                  { n: 'Rent', a: 'R', c: 'bg-slate-800' }
                ].map((item, i) => (
                  <button key={i} onClick={() => setStep(2)} className="flex flex-col items-center gap-2 group">
                    <div className={`w-12 h-12 ${item.c} text-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                      {item.a}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.n}</span>
                  </button>
                ))}
              </div>
            </div>

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-slate-100">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                  <input 
                    required
                    type="number"
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleSubmit}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  Pay Securely
                </button>
              </motion.div>
            )}
          </div>
        );

      case 'Split & Groups':
        return (
          <div className="p-8 lg:p-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-5 bg-white border border-slate-200 rounded-[2rem] hover:border-primary-200 hover:bg-primary-50/30 transition-all group text-left space-y-4">
                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Create Group</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Manage shared bills</p>
                </div>
              </button>
              <button className="p-5 bg-white border border-slate-200 rounded-[2rem] hover:border-primary-200 hover:bg-primary-50/30 transition-all group text-left space-y-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Split Bill</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">One-time expense</p>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Groups</h4>
              <div className="space-y-3">
                {[
                  { n: 'Flatmates Oct', m: 3, o: '₹2,400', s: 'Settled' },
                  { n: 'Goa Trip 2024', m: 5, o: '₹12,800', s: '2 Pending' }
                ].map((group, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{group.n}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.m} Members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{group.o}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${group.s === 'Settled' ? 'text-emerald-500' : 'text-amber-500'}`}>{group.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Mobile':
      case 'Utilities':
      case 'Card Bill':
      case 'Fastag':
      case 'Insurance':
        return (
          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Details</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input 
                  required
                  placeholder={`Search ${activeFlow} Biller or enter Number...`}
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary-500 text-sm font-bold text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { n: 'Airtel Postpaid', l: 'Last: ₹899' },
                 { n: 'BESCOM', l: 'Due: ₹2,450' },
                 { n: 'HDFC Card', l: 'Due: ₹12,800' },
                 { n: 'ICICI Fastag', l: 'Bal: ₹450' }
               ].map((b, i) => (
                 <button key={i} type="button" onClick={() => setStep(2)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-200 transition-all text-left space-y-2">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{b.n}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.l}</p>
                 </button>
               ))}
            </div>

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Amount</p>
                   <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest cursor-pointer">View Plans</span>
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                  <input 
                    required
                    type="number"
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3"
                >
                  Confirm Payment
                </button>
              </motion.div>
            )}
          </form>
        );

      case 'Schedule':
        return (
          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['One-time', 'Recurring'].map(t => (
                    <button key={t} type="button" className={`py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${t === 'Recurring' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Daily', 'Weekly', 'Monthly'].map(f => (
                    <button key={f} type="button" className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${f === 'Monthly' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Next Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                  <input 
                    required
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:bg-white transition-all"
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-3"
            >
              Save Schedule
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="relative w-full h-full lg:h-auto lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{activeFlow}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Secure Banking Portal</p>
              </div>
              <button onClick={handleClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
               {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentFlows;
