import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Send, QrCode } from 'lucide-react';
import SecurePinModal from './SecurePinModal';

const BalanceCard = ({ greeting = "", balance = 0, accountType = "Savings Account", onTransferClick, onScanClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    let timer;
    if (isVisible && isUnlocked) {
      // Auto-hide balance after 30 seconds for security
      timer = setTimeout(() => {
        setIsVisible(false);
        setIsUnlocked(false);
      }, 30000);
    }
    return () => clearTimeout(timer);
  }, [isVisible, isUnlocked]);

  const handleToggleClick = () => {
    if (isVisible) {
      // Hide immediately
      setIsVisible(false);
      setIsUnlocked(false);
    } else {
      // If locked, require PIN verification
      if (isUnlocked) {
        setIsVisible(true);
      } else {
        setIsPinModalOpen(true);
      }
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsUnlocked(true);
    setIsVisible(true);
  };

  return (
    <>
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden border border-white/10 group transition-all duration-300 w-full">
        {/* Premium Glassmorphic Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left Side: Greeting, Available Balance & Details */}
          <div className="space-y-4">
            {greeting && (
              <p className="text-[12px] font-black text-white/60 uppercase tracking-widest leading-none block">
                {greeting}
              </p>
            )}
            
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none block">
                Available Balance
              </span>
              <div className="flex items-center gap-4">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={isVisible ? 'visible' : 'hidden'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-4xl md:text-5xl font-black text-white tracking-tighter"
                  >
                    {isVisible ? `₹${Number(balance || 0).toLocaleString('en-IN')}` : '₹ ••••••••'}
                  </motion.h2>
                </AnimatePresence>
                
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleClick}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white/80 hover:text-white transition-all border border-white/10 shadow-sm"
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/5 rounded-xl">
              <p className="text-[10px] font-black text-white/90 uppercase tracking-widest leading-none">
                {accountType}
              </p>
            </div>
          </div>

          {/* Right Side: Quick Action Buttons (Transfer Funds & Scan & Pay) */}
          <div className="flex flex-row items-center gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onTransferClick}
              className="flex-1 md:flex-none px-6 py-4 bg-white text-blue-700 hover:text-blue-800 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Send size={14} strokeWidth={2.5} />
              Transfer Funds
            </motion.button>
            
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScanClick}
              className="flex-1 md:flex-none px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-black text-[11px] uppercase tracking-widest border border-white/10 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <QrCode size={14} />
              Scan & Pay
            </motion.button>
          </div>
        </div>
      </div>

      <SecurePinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="Verify UPI PIN"
        description="Enter your 6-digit UPI PIN to reveal your account balance."
      />
    </>
  );
};

export default BalanceCard;
