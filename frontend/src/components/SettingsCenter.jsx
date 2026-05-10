import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Lock, 
  CreditCard, 
  Bell, 
  Smartphone, 
  Palette, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  BellRing,
  Fingerprint,
  Activity,
  History,
  ShieldAlert,
  SmartphoneIcon,
  Globe,
  Monitor,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const SettingsCenter = ({ isOpen, onClose, isMobile, initialCategory = 'Account' }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Sync state if initialCategory changes while open
  React.useEffect(() => {
    if (isOpen) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = [
    { 
      id: 'Account', 
      icon: <User size={18} />, 
      label: 'Account', 
      description: 'Personal info & KYC verification',
      items: [
        { label: 'Legal Name', value: 'Alex Lee', type: 'text' },
        { label: 'KYC Status', value: 'Verified', type: 'badge', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Account Level', value: 'Premium Savings', type: 'text' },
        { label: 'Linked Phone', value: '+91 98765 43210', type: 'text' },
      ]
    },
    { 
      id: 'Security', 
      icon: <Lock size={18} />, 
      label: 'Security', 
      description: 'Privacy & login protection',
      items: [
        { label: 'Change Password', type: 'link' },
        { label: 'Two-Factor Auth', value: 'Active', type: 'toggle', active: true },
        { label: 'Biometrics', value: 'Enabled', type: 'toggle', active: true },
        { label: 'App Lock', value: 'Disabled', type: 'toggle', active: false },
        { label: 'Session History', type: 'link' },
      ]
    },
    { 
      id: 'Payments', 
      icon: <Zap size={18} />, 
      label: 'Payments', 
      description: 'UPI, Autopay & Banks',
      items: [
        { label: 'UPI Settings', type: 'link' },
        { label: 'Default Bank', value: 'HDFC Bank', type: 'text' },
        { label: 'Auto Payments', value: '4 Active', type: 'text' },
        { label: 'Bill Reminders', value: 'Active', type: 'toggle', active: true },
      ]
    },
    { 
      id: 'Cards', 
      icon: <CreditCard size={18} />, 
      label: 'Cards', 
      description: 'Limits & card security',
      items: [
        { label: 'Transaction Limits', type: 'link' },
        { label: 'International Usage', type: 'toggle', active: false },
        { label: 'Contactless Pay', type: 'toggle', active: true },
        { label: 'ATM Withdrawal', type: 'toggle', active: true },
      ]
    },
    { 
      id: 'Notifications', 
      icon: <BellRing size={18} />, 
      label: 'Notifications', 
      description: 'Alert preferences',
      items: [
        { label: 'Push Notifications', type: 'toggle', active: true },
        { label: 'Email Alerts', type: 'toggle', active: true },
        { label: 'SMS Updates', type: 'toggle', active: false },
        { label: 'Promotional', type: 'toggle', active: false },
      ]
    },
    { 
      id: 'Appearance', 
      icon: <Palette size={18} />, 
      label: 'Appearance', 
      description: 'Theme & UX settings',
      items: [
        { label: 'Dark Mode', type: 'toggle', active: false },
        { label: 'Privacy Mode', value: 'Enabled', type: 'toggle', active: true },
        { label: 'Language', value: 'English (US)', type: 'text' },
      ]
    }
  ];

  const panelVariants = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' }
  };

  const handleLogoutAll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed top-0 right-0 z-[110] bg-white shadow-2xl h-full flex flex-col overflow-hidden ${
              isMobile ? 'w-full' : 'w-full max-w-4xl lg:rounded-l-[2.5rem]'
            }`}
          >
            {/* Header: Refined for Desktop */}
            <div className="px-8 lg:px-12 py-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                  <User size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Settings Hub</h2>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage your core Vertex account</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Layout: Sidebar + Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/30">
              
              {/* Sidebar Navigation: Better for Desktop */}
              <div className={`overflow-y-auto no-scrollbar border-r border-slate-100 bg-white shrink-0 ${isMobile ? 'flex flex-row p-4 gap-2 whitespace-nowrap overflow-x-auto' : 'w-[280px] p-6 space-y-2'}`}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-4 transition-all ${
                      isMobile 
                        ? `px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border ${activeCategory === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100'}` 
                        : `w-full px-5 py-4 rounded-[1.25rem] text-left group ${activeCategory === cat.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
                    }`}
                  >
                    <span className={`${activeCategory === cat.id ? 'text-white' : 'text-slate-400 group-hover:text-primary-600'} transition-colors`}>
                      {cat.icon}
                    </span>
                    {!isMobile && (
                      <div className="flex-1">
                        <p className="text-[12px] font-black uppercase tracking-widest leading-none">{cat.label}</p>
                        <p className={`text-[9px] font-bold mt-1.5 uppercase tracking-tight opacity-60`}>{cat.id === activeCategory ? 'Viewing' : 'Manage'}</p>
                      </div>
                    )}
                    {!isMobile && activeCategory === cat.id && <ChevronRight size={14} className="opacity-60" />}
                  </button>
                ))}
              </div>

              {/* Items Area: Fix Overflow & Spacing */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12 pb-24">
                <div className="max-w-2xl mx-auto space-y-10">
                  
                  {/* Category Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeCategory}</h3>
                    </div>
                    <p className="text-slate-400 font-bold text-sm ml-5">{categories.find(c => c.id === activeCategory)?.description}</p>
                  </div>

                  {/* Settings Grid: Proper alignment for Desktop */}
                  <div className="grid grid-cols-1 gap-4">
                    {categories.find(c => c.id === activeCategory)?.items.map((item, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-primary-100 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="relative z-10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2.5">{item.label}</p>
                          {item.type === 'text' && <p className="text-[15px] font-black text-slate-900">{item.value}</p>}
                          {item.type === 'badge' && (
                            <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${item.color}`}>
                              <CheckCircle2 size={12} /> {item.value}
                            </span>
                          )}
                          {item.type === 'link' && (
                            <div className="flex items-center gap-2 text-primary-600">
                               <span className="text-[12px] font-black uppercase tracking-widest">Update Settings</span>
                               <ArrowRight size={14} />
                            </div>
                          )}
                        </div>

                        {item.type === 'toggle' && (
                          <div className={`w-12 h-6.5 rounded-full p-1 transition-all shadow-inner relative z-10 ${item.active ? 'bg-primary-600' : 'bg-slate-200'}`}>
                            <motion.div 
                              animate={{ x: item.active ? 22 : 0 }}
                              className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                            />
                          </div>
                        )}
                        
                        {/* Hover Decoration */}
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl translate-x-12 translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Security Recommendation: Compact for Desktop */}
                  <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-2xl -translate-y-12 translate-x-12 opacity-50" />
                     
                     <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200 shrink-0 relative z-10 group-hover:scale-105 transition-transform">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                     </div>
                     <div className="text-center md:text-left relative z-10">
                        <h4 className="text-emerald-900 font-black text-lg tracking-tight">Security Level: Maximum</h4>
                        <p className="text-emerald-700 text-xs font-bold mt-1 opacity-80 leading-relaxed">
                          Your account uses Advanced Threat Protection. All transactions are hardware-verified.
                        </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Session: High Contrast for Clarity */}
            <div className="p-8 lg:p-10 border-t border-slate-50 bg-white shrink-0">
              <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
                <button 
                  onClick={handleLogoutAll}
                  disabled={isProcessing}
                  className="flex-1 py-4.5 border-2 border-rose-50 text-rose-500 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Activity size={18} className="animate-spin" />
                  ) : (
                    <><LogOut size={18} /> Logout All Sessions</>
                  )}
                </button>
                <div className="flex items-center justify-center gap-6 px-4">
                   <div className="flex flex-col items-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Version</p>
                      <p className="text-[10px] font-black text-slate-400">2.4.0-PRO</p>
                   </div>
                   <div className="w-px h-8 bg-slate-100" />
                   <div className="flex flex-col items-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Region</p>
                      <p className="text-[10px] font-black text-slate-400">Global (IN)</p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsCenter;
