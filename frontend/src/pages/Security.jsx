import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Lock, 
  Fingerprint, 
  RefreshCcw, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';

const Security = () => {
  const [activeModal, setActiveModal] = useState(null);

  const securitySections = [
    {
      title: "Account Protection",
      items: [
        { id: '2FA', icon: Lock, label: "Two-Factor Authentication", desc: "Added layer of security for logins", status: "Enabled" },
        { id: 'Biometrics', icon: Fingerprint, label: "Biometric Login", desc: "FaceID and Fingerprint access", status: "Active" },
        { id: 'Password', icon: RefreshCcw, label: "Change Password", desc: "Last updated 3 months ago", status: null },
      ]
    },
    {
      title: "Access Management",
      items: [
        { id: 'Sessions', icon: Smartphone, label: "Active Sessions", desc: "3 devices currently logged in", status: "Review" },
        { id: 'Activity', icon: History, label: "Login Activity", desc: "Detailed log of account access", status: null },
      ]
    },
    {
      title: "Emergency Controls",
      items: [
        { id: 'Freeze', icon: AlertTriangle, label: "Freeze Account", desc: "Instantly disable all transactions", status: null, danger: true },
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full -translate-y-24 translate-x-24 blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-primary-600/20 rounded-[2rem] flex items-center justify-center text-primary-400 border border-primary-500/30">
                  <ShieldCheck size={40} strokeWidth={2.5} />
               </div>
               <div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-none">Security Center</h1>
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-3">Account Protection & Authentication</p>
               </div>
            </div>
            <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Score</p>
               <div className="flex items-center gap-3">
                  <p className="text-2xl font-black text-emerald-400">98%</p>
                  <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-400 w-[98%]" />
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-10">
            {securitySections.map((section, i) => (
              <div key={i} className="space-y-6">
                 <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">{section.title}</h3>
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {section.items.map((item, j) => (
                      <motion.button 
                        key={j} 
                        whileHover={{ x: 4, backgroundColor: '#F8FAFC' }}
                        onClick={() => setActiveModal(item.id)}
                        className="w-full flex items-center justify-between p-7 transition-all text-left group"
                      >
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 ${item.danger ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50'} rounded-2xl flex items-center justify-center transition-colors`}>
                               <item.icon size={22} />
                            </div>
                            <div>
                               <p className={`font-black ${item.danger ? 'text-rose-600' : 'text-slate-900'} text-[15px] leading-none tracking-tight`}>{item.label}</p>
                               <p className="text-[11px] text-slate-400 font-bold uppercase mt-2.5 tracking-tight">{item.desc}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-5">
                            {item.status && (
                               <span className={`text-[9px] font-black ${item.status === 'Review' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'} uppercase tracking-widest px-3 py-1.5 rounded-lg border`}>
                                  {item.status}
                               </span>
                            )}
                            <ChevronRight size={18} className="text-slate-200 group-hover:text-primary-600 transition-colors" />
                         </div>
                      </motion.button>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         {/* Sidebar: Status & Tips */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px] px-2">Privacy Settings</h3>
               <div className="space-y-6">
                  {[
                    { label: 'Profile Visibility', value: 'Private', icon: EyeOff },
                    { label: 'Login Alerts', value: 'Instant', icon: BellRing },
                    { label: 'Data Encryption', value: 'AES-256', icon: ShieldCheck }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                             <stat.icon size={18} />
                          </div>
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                       </div>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{stat.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <ShieldCheck size={24} />
               </div>
               <div className="space-y-2">
                  <h4 className="font-black text-lg tracking-tight">System Secured</h4>
                  <p className="text-emerald-50 text-[12px] font-medium leading-relaxed opacity-90">Your account is protected by multi-factor authentication and hardware-level encryption.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Modals Placeholder */}
      <AnimatePresence>
        {activeModal && (
           <div className="fixed inset-0 z-[130] flex items-center justify-center p-0 lg:p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} className="relative w-full h-full lg:h-auto lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center space-y-6" >
                 <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400">
                    <Shield size={40} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeModal} Settings</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2">Enhanced Security Management</p>
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed">This section is being synchronized with our security infrastructure. Please wait while we verify your session.</p>
                 <button onClick={() => setActiveModal(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Close Security Protocol</button>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Security;
