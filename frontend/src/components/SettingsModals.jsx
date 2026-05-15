import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Volume2, 
  Mail, 
  MessageSquare, 
  CheckCircle2,
  RefreshCcw,
  Sun,
  Moon,
  Monitor,
  Camera,
  MapPin,
  Users,
  Key,
  Shield
} from 'lucide-react';
import { bankingService } from '../services/bankingService';

const SettingsModals = ({ isOpen, onClose, type }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // States for various settings
  const [notifs, setNotifs] = useState({
    push: true,
    sound: true,
    email: false,
    sms: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'normal'
  });

  const [upiStep, setUpiStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [upiPin, setUpiPin] = useState(['', '', '', '', '', '']);
  const [confirmUpiPin, setConfirmUpiPin] = useState(['', '', '', '', '', '']);

  const resetModalState = () => {
    setLoading(false);
    setSuccess(false);
    setError('');
    setUpiStep(1);
    setOtp(['', '', '', '', '', '']);
    setUpiPin(['', '', '', '', '', '']);
    setConfirmUpiPin(['', '', '', '', '', '']);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleSave = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    }, 1000);
  };

  const handlePinDigitChange = (setter, values, index, value, prefix) => {
    const digits = value.replace(/\D/g, '').slice(0, values.length - index);
    const next = [...values];

    if (!digits) {
      next[index] = '';
      setter(next);
      return;
    }

    digits.split('').forEach((digit, offset) => {
      next[index + offset] = digit;
    });

    setter(next);

    const nextFocusIndex = Math.min(index + digits.length, values.length - 1);
    if (nextFocusIndex !== index || index < values.length - 1) {
      document.getElementById(`${prefix}-${nextFocusIndex}`)?.focus();
    }
  };

  const handlePinKeyDown = (values, index, event, prefix) => {
    if (event.key === 'Backspace' && !values[index] && index > 0) {
      document.getElementById(`${prefix}-${index - 1}`)?.focus();
    }
  };

  const handleOtpProceed = () => {
    setError('');

    if (otp.join('').length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setUpiStep(3);
  };

  const handleUpiPinSave = async () => {
    const newPin = upiPin.join('');
    const confirmPin = confirmUpiPin.join('');

    setError('');

    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setError('Please enter and confirm a 6-digit UPI PIN.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('UPI PIN and confirmation PIN do not match.');
      return;
    }

    try {
      setLoading(true);
      await bankingService.setupPin(newPin);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update UPI PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'Notifications':
        return (
          <div className="p-8 lg:p-10 space-y-10">
            <div className="space-y-6">
              {[
                { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts for transactions', icon: Bell },
                { id: 'sound', label: 'Alert Sounds', desc: 'Play sounds for incoming alerts', icon: Volume2 },
                { id: 'email', label: 'Email Alerts', desc: 'Monthly statements & security logs', icon: Mail },
                { id: 'sms', label: 'SMS Notifications', desc: 'OTP and login alerts', icon: MessageSquare }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                         <item.icon size={18} />
                      </div>
                      <div>
                         <p className="text-[13px] font-black text-slate-900 leading-none">{item.label}</p>
                         <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-tight">{item.desc}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setNotifs({...notifs, [item.id]: !notifs[item.id]})}
                    className={`w-10 h-6 rounded-full relative transition-all duration-300 ${notifs[item.id] ? 'bg-primary-600' : 'bg-slate-200'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${notifs[item.id] ? 'left-5' : 'left-1'}`} />
                   </button>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3">
               {loading ? <RefreshCcw className="animate-spin" /> : 'Save Preferences'}
            </button>
          </div>
        );

      case 'Appearance':
        return (
          <div className="p-8 lg:p-10 space-y-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Theme Preference</p>
                <div className="grid grid-cols-3 gap-3">
                   {[
                     { id: 'light', icon: Sun, label: 'Light' },
                     { id: 'dark', icon: Moon, label: 'Dark' },
                     { id: 'system', icon: Monitor, label: 'System' }
                   ].map((t) => (
                     <button 
                       key={t.id}
                       onClick={() => setAppearance({...appearance, theme: t.id})}
                       className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all ${appearance.theme === t.id ? 'bg-primary-50 border-primary-600 text-primary-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                     >
                        <t.icon size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                     </button>
                   ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Text Scaling</p>
                <div className="p-6 bg-slate-50 rounded-[2rem] space-y-6">
                   <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400">Small</span>
                      <span className="text-sm font-black text-slate-900">Normal</span>
                      <span className="text-lg text-slate-900">Large</span>
                   </div>
                   <input type="range" min="0" max="2" defaultValue="1" className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-600" />
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3">
               {loading ? <RefreshCcw className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        );

      case 'Permissions':
        return (
          <div className="p-8 lg:p-10 space-y-10">
            <div className="space-y-6">
               {[
                 { id: 'camera', label: 'Camera Access', desc: 'Used for QR scanning & KYC', icon: Camera, status: 'Allowed' },
                 { id: 'location', label: 'Location Services', desc: 'Fraud detection & ATM locator', icon: MapPin, status: 'Allowed' },
                 { id: 'contacts', label: 'Contact List', desc: 'Quick money transfers', icon: Users, status: 'Restricted' }
               ].map((item) => (
                 <div key={item.id} className="p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-white transition-all space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                             <item.icon size={18} />
                          </div>
                          <div>
                             <p className="text-[13px] font-black text-slate-900 leading-none">{item.label}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tight">{item.status}</p>
                          </div>
                       </div>
                       <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Manage</button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-4">
               <Shield size={18} className="text-primary-600 shrink-0" />
               <p className="text-[11px] text-primary-900 font-bold leading-relaxed">
                 Finova only accesses these permissions when you use specific features. Your data is encrypted and never sold.
               </p>
            </div>
          </div>
        );

      case 'UPI Security':
        return (
          <div className="p-8 lg:p-10 space-y-8">
             {upiStep === 1 ? (
               <div className="space-y-10">
                  <div className="text-center space-y-4">
                     <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Key size={40} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">UPI PIN Management</h3>
                     <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                       To change your UPI PIN, we first need to verify your identity via a secure OTP.
                     </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Mobile</p>
                        <p className="text-sm font-black text-slate-900">+91 •••••• 4492</p>
                     </div>
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 size={20} />
                     </div>
                  </div>
                  <button onClick={() => setUpiStep(2)} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-600 transition-all">Request Secure OTP</button>
               </div>
             ) : upiStep === 2 ? (
               <div className="space-y-8">
                  <div className="text-center space-y-2">
                     <h4 className="text-xl font-black text-slate-900">Verify Identity</h4>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enter 6-digit OTP sent to phone</p>
                  </div>
                  <div className="flex justify-center gap-2">
                     {[0,1,2,3,4,5].map((i) => (
                       <input
                         key={i}
                         id={`upi-otp-${i}`}
                         type="text"
                         inputMode="numeric"
                         maxLength="6"
                         value={otp[i]}
                         onChange={(event) => handlePinDigitChange(setOtp, otp, i, event.target.value, 'upi-otp')}
                         onKeyDown={(event) => handlePinKeyDown(otp, i, event, 'upi-otp')}
                         className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:border-primary-600"
                       />
                     ))}
                  </div>
                  {error && (
                    <p className="text-center text-[11px] font-bold text-rose-600 leading-relaxed">{error}</p>
                  )}
                  <button onClick={handleOtpProceed} className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-700 transition-all">Verify & Proceed</button>
               </div>
             ) : (
               <div className="space-y-8">
                  <div className="text-center space-y-2">
                     <h4 className="text-xl font-black text-slate-900">Set New UPI PIN</h4>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enter new 6-digit PIN</p>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-center gap-2">
                        {[0,1,2,3,4,5].map((i) => (
                          <input
                            key={i}
                            id={`upi-pin-${i}`}
                            type="password"
                            inputMode="numeric"
                            maxLength="1"
                            value={upiPin[i]}
                            onChange={(event) => handlePinDigitChange(setUpiPin, upiPin, i, event.target.value, 'upi-pin')}
                            onKeyDown={(event) => handlePinKeyDown(upiPin, i, event, 'upi-pin')}
                            className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:border-primary-600"
                          />
                        ))}
                     </div>
                     <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New PIN</p>
                     <div className="flex justify-center gap-2">
                        {[0,1,2,3,4,5].map((i) => (
                          <input
                            key={`c-${i}`}
                            id={`confirm-upi-pin-${i}`}
                            type="password"
                            inputMode="numeric"
                            maxLength="1"
                            value={confirmUpiPin[i]}
                            onChange={(event) => handlePinDigitChange(setConfirmUpiPin, confirmUpiPin, i, event.target.value, 'confirm-upi-pin')}
                            onKeyDown={(event) => handlePinKeyDown(confirmUpiPin, i, event, 'confirm-upi-pin')}
                            className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:border-primary-600"
                          />
                        ))}
                     </div>
                     {error && (
                       <p className="text-center text-[11px] font-bold text-rose-600 leading-relaxed">{error}</p>
                     )}
                  </div>
                  <button
                    onClick={handleUpiPinSave}
                    disabled={loading}
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <RefreshCcw className="animate-spin" /> : 'Complete PIN Setup'}
                  </button>
               </div>
             )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Finova System Preferences</p>
            </div>
            <button onClick={handleClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {success ? (
               <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl">
                     <CheckCircle2 size={48} />
                  </motion.div>
                  <div className="space-y-2">
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">Preferences Updated</h2>
                     <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Your changes have been saved</p>
                  </div>
               </div>
            ) : renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModals;
