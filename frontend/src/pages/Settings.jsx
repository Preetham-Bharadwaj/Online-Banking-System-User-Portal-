import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Globe, 
  Lock, 
  Smartphone, 
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  Eye,
  Info,
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import SettingsModals from '../components/SettingsModals';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });

  const settingsSections = [
    {
      title: "App Experience",
      items: [
        { id: 'Notifications', icon: Bell, label: "Notifications", desc: "Alerts, sounds and push preferences" },
        { id: 'Appearance', icon: Palette, label: "Appearance", desc: "Dark mode, themes and font size" },
        { id: 'Language', icon: Globe, label: "Language", desc: "System display language: English (US)" },
      ]
    },
    {
      title: "Payment Security",
      items: [
        { id: 'UPI Security', icon: ShieldCheck, label: "UPI Settings", desc: "Change UPI PIN, manage limits & VPA" },
        { id: 'Cards Security', icon: CreditCard, label: "Card Security", desc: "Manage contactless, online & ATM limits" },
      ]
    },
    {
      title: "Privacy & Data",
      items: [
        { id: 'Privacy', icon: Lock, label: "Privacy Settings", desc: "Data sharing and tracking preferences" },
        { id: 'Permissions', icon: Smartphone, label: "App Permissions", desc: "Camera, location and contact access" },
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                  <SettingsIcon size={40} strokeWidth={2.5} />
               </div>
               <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">Settings</h1>
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-3">Application Preferences & UI</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-10">
            {settingsSections.map((section, i) => (
              <div key={i} className="space-y-6">
                 <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">{section.title}</h3>
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {section.items.map((item, j) => (
                      <motion.button 
                        key={j} 
                        whileHover={{ x: 4, backgroundColor: '#F8FAFC' }}
                        onClick={() => setModalState({ isOpen: true, type: item.id })}
                        className="w-full flex items-center justify-between p-7 transition-all text-left group"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
                               <item.icon size={22} />
                            </div>
                            <div>
                               <p className="font-black text-slate-900 text-[15px] leading-none tracking-tight">{item.label}</p>
                               <p className="text-[11px] text-slate-400 font-bold uppercase mt-2.5 tracking-tight">{item.desc}</p>
                            </div>
                         </div>
                         <ChevronRight size={18} className="text-slate-200 group-hover:text-primary-600 transition-colors" />
                      </motion.button>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         {/* Sidebar: App Status */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">App Information</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-slate-400 uppercase">Version</span>
                     <span className="text-[11px] font-black">2.4.0 (Gold)</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-slate-400 uppercase">Environment</span>
                     <span className="text-[11px] font-black text-emerald-400">Production</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-slate-400 uppercase">Last Sync</span>
                     <span className="text-[11px] font-black">2 mins ago</span>
                  </div>
               </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-[2.5rem] p-8 space-y-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                  <Info size={18} />
               </div>
               <p className="text-[13px] font-bold text-primary-900 leading-relaxed">Your preferences are synced across all devices linked to this account.</p>
            </div>
          </div>
       </div>

      <SettingsModals 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })} 
        type={modalState.type} 
      />
    </div>
  );
};

export default Settings;
