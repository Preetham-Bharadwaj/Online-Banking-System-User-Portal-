import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, ArrowUpRight, QrCode } from 'lucide-react';
import { useQR } from '../context/QRContext';

const BalanceCard = ({ balance = 2456000, growth = "+12.4%", accountType = "Savings Account • 4921", onTransferClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { openScanner } = useQR();

  return (
    <div className="relative bg-white p-1 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200/50 group overflow-hidden transition-all duration-300 w-full">
      {/* Background Sophistication: Subtle & Professional */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/[0.03] rounded-full -translate-y-12 translate-x-12 blur-3xl transition-colors duration-700"></div>
      
      <div className="relative z-10 px-8 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        {/* Balance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-slate-900 rounded-lg shadow-lg shadow-slate-200">
               <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{accountType}</p>
            </div>
            <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp size={12} /> {growth}
            </span>
          </div>
          
          <div className="flex items-center gap-5 h-12">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={isVisible ? 'visible' : 'hidden'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter"
              >
                {isVisible ? `₹${balance.toLocaleString()}` : '₹ ••••••••'}
              </motion.h2>
            </AnimatePresence>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVisible(!isVisible)}
              className="w-11 h-11 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-white transition-all border border-slate-100 shadow-sm"
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Available Balance</p>
        </div>

        {/* Action Controls: Compact & Utility-Focused */}
        <div className="flex items-center gap-3 shrink-0">
           <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTransferClick}
            className="flex-1 lg:flex-none px-7 py-4 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2.5"
           >
              <ArrowUpRight size={16} strokeWidth={3} />
              Transfer
           </motion.button>
           <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={openScanner}
            className="flex-1 lg:flex-none px-7 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-slate-200 hover:border-primary-200 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2.5"
           >
              <QrCode size={16} strokeWidth={2.5} />
              Scan & Pay
           </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
