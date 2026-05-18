import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, RefreshCcw } from 'lucide-react';
import { bankingService } from '../services/bankingService';

const SecurePinModal = ({ isOpen, onClose, onSuccess, title = "Enter UPI PIN", description = "For security verification, please enter your 6-digit UPI PIN" }) => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setShake(false);
      // Auto focus with a small timeout to let the modal mount
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePinChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPin(value);
      setError('');

      if (value.length === 6) {
        // Automatically submit when 6 digits are typed
        await verifyAndSubmit(value);
      }
    }
  };

  const verifyAndSubmit = async (enteredPin) => {
    setIsVerifying(true);
    setError('');
    try {
      await bankingService.verifyPin(enteredPin);
      setIsVerifying(false);
      onSuccess();
    } catch (err) {
      setIsVerifying(false);
      setPin('');
      setShake(true);
      setError(err.response?.data?.error || 'Incorrect UPI PIN');
      setTimeout(() => setShake(false), 500);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Styled individual boxes
  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const hasValue = i < pin.length;
      const isFocused = i === pin.length && !isVerifying;
      boxes.push(
        <div
          key={i}
          className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
            isFocused
              ? 'border-primary-600 bg-white ring-4 ring-primary-100 shadow-md shadow-primary-600/5 scale-105'
              : hasValue
              ? 'border-slate-800 bg-slate-900 text-white'
              : 'border-slate-200 bg-slate-50 text-slate-300'
          }`}
        >
          {hasValue ? (
            <span className="w-3 h-3 bg-current rounded-full transition-all duration-300"></span>
          ) : (
            <span className="text-slate-300">•</span>
          )}
        </div>
      );
    }
    return boxes;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          ></motion.div>

          {/* Secure Dialog Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: shake ? [0, -10, 10, -10, 10, -5, 5, 0] : 0,
            }}
            transition={{
              type: 'spring',
              duration: shake ? 0.5 : 0.4,
              bounce: 0.15,
            }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center z-10 overflow-hidden"
          >
            {/* Background Decorative Rings */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-50 rounded-full blur-2xl opacity-70"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-70"></div>

            {/* Header / Title */}
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-5 relative">
              <ShieldCheck size={28} />
              <button
                onClick={onClose}
                className="absolute -top-8 -right-28 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-100/50 shadow-sm active:scale-90 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-2">
              {title}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-[280px] mb-8 leading-normal">
              {description}
            </p>

            {/* Hidden Input Box to capture numeric keyboard input */}
            <input
              ref={inputRef}
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={handlePinChange}
              onKeyDown={handleKeyDown}
              disabled={isVerifying}
              className="absolute w-1 h-1 opacity-0 pointer-events-none"
              aria-label="Enter your 6-digit UPI PIN"
            />

            {/* Box Click Trigger to focus hidden input */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="flex justify-center items-center gap-2.5 cursor-pointer mb-6"
            >
              {renderBoxes()}
            </div>

            {/* Feedback / Error */}
            <div className="h-6 flex items-center justify-center mb-6">
              <AnimatePresence mode="wait">
                {isVerifying && (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest"
                  >
                    <RefreshCcw size={12} className="animate-spin" />
                    Securing Connection...
                  </motion.div>
                )}

                {error && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[11px] font-bold text-rose-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Safety Banner */}
            <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">
                End-to-End Encrypted Session
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SecurePinModal;
