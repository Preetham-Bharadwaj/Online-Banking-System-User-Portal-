import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Volume2, 
  Mail, 
  MessageSquare, 
  Smartphone,
  CheckCircle2,
  Lock,
  RefreshCcw,
  Sun,
  Moon,
  Monitor,
  Camera,
  MapPin,
  Users,
  ShieldCheck,
  Eye,
  Key,
  Shield
} from 'lucide-react';

const SettingsModals = ({ isOpen, onClose, type }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
  const [upiPin, setUpiPin] = useState(['', '', '', '', '', '']);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
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
                 Vertex only accesses these permissions when you use specific features. Your data is encrypted and never sold.
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
                       <input key={i} type="text" maxLength="1" className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:border-primary-600" />
                     ))}
                  </div>
                  <button onClick={() => setUpiStep(3)} className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary-700 transition-all">Verify & Proceed</button>
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
                          <input key={i} type="password" maxLength="1" className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:border-primary-600" />
                        ))}
                     </div>
                     <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New PIN</p>
                     <div className="flex justify-center gap-2">
                        {[0,1,2,3,4,5].map((i) => (
                          <input key={`c-${i}`} type="password" maxLength="1" className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 outline-none focus:border-primary-600" />
                        ))}
                     </div>
                  </div>
                  <button onClick={handleSave} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
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
          onClick={onClose}
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vertex System Preferences</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
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
