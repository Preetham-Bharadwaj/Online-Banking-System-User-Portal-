import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Camera,
  QrCode,
  Copy,
  Edit2,
  Laptop,
  Fingerprint,
  History,
  Download,
  Share2,
  X,
  Scan,
  Flashlight,
  ArrowRight,
  ShieldAlert,
  Check,
  Trophy,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Trash2,
  Calendar,
  CreditCard,
  MapPin,
  Users,
  FileText,
  Building2,
  BadgePercent,
  LogOut,
  Activity,
  FileCheck,
  Building,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useQR } from '../context/QRContext';

const Profile = () => {
  const { openScanner, openGenerator } = useQR();
  const [activeDetailModal, setActiveDetailModal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'Alex Lee',
    email: 'alex.lee@vertex.com',
    phone: '+91 98765 43210',
    address: '24th Avenue, Tech Park, Bengaluru, IN',
    kycStatus: 'Verified',
    accountType: 'Premium Savings',
    joinedDate: 'Oct 2023'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsEditModalOpen(false);
    }, 1500);
  };

  const sections = [
    { 
      title: "Account & Identity", 
      items: [
        { id: 'Personal', icon: User, label: "Personal Information", desc: "Legal name, DOB, and identity verification", status: "Verified" },
        { id: 'Communication', icon: Mail, label: "Communication Hub", desc: `${profileData.email} • ${profileData.phone}`, status: null },
        { id: 'KYC', icon: ShieldCheck, label: "KYC & Verification", desc: "View and update regulatory documents", status: "Complete" },
      ]
    },
    { 
      title: "Banking Portfolio", 
      items: [
        { id: 'Products', icon: Building2, label: "Banking Products", desc: "Active FD, RD, and Loan accounts", status: "3 Active" },
        { id: 'Nominee', icon: Users, label: "Nominee Management", desc: "Add or update account nominees", status: null },
        { id: 'Linked', icon: Building, label: "Linked Bank Accounts", desc: "Manage external accounts linked via UPI", status: "2 Linked" },
      ]
    },
    { 
      title: "Tax & Documents", 
      items: [
        { id: 'Tax', icon: BadgePercent, label: "Tax Documents", desc: "Interest certificates and 15G/H forms", status: null },
        { id: 'Statements', icon: FileText, label: "Account Statements", desc: "Download monthly and annual reports", status: null },
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-8 lg:space-y-12 animate-fadeIn">
      
      {/* 1. Profile Identity Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
         <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
               <div className="relative group/avatar">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-black text-4xl shadow-2xl border-4 border-white">
                     AL
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-500 border border-slate-100 hover:text-primary-600 transition-colors"
                  >
                     <Camera size={20} />
                  </motion.button>
               </div>

               <div className="space-y-5">
                  <div>
                     <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">{profileData.name}</h1>
                        <CheckCircle2 size={24} className="text-primary-600" />
                     </div>
                     <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Premium Member • Joined {profileData.joinedDate}</p>
                  </div>

                   <div className="flex flex-wrap justify-center md:justify-start gap-3">
                     <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                        <Edit2 size={14} /> Edit Profile
                     </button>
                     <button onClick={openGenerator} className="flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl">
                        <QrCode size={14} /> My QR
                     </button>
                     <button onClick={openScanner} className="flex items-center gap-2.5 px-5 py-3 bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl">
                        <Scan size={14} /> Scan QR
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Credit Health Refined */}
         <div className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Credit Health Score</h4>
                  <p className="text-5xl font-black text-emerald-400 tracking-tighter leading-none">842</p>
               </div>
               <div className="text-right">
                  <p className="text-emerald-400 font-black text-xs">+12.4%</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">This Month</p>
               </div>
            </div>
            <div className="space-y-3 relative z-10">
               <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1.5 }} className="h-full bg-emerald-400" />
               </div>
               <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Top 8% of users</p>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Excellent</p>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-8 space-y-12">
            
            {/* Regulatory Alert */}
            <div className="bg-amber-50/50 border border-amber-100/50 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-all" onClick={() => setActiveDetailModal('KYC')}>
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                     <FileCheck size={24} />
                  </div>
                  <div>
                     <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Regulatory Update Required</p>
                     <p className="text-[12px] text-amber-700 font-bold leading-tight">Please update your PAN details for continued international transactions.</p>
                  </div>
               </div>
               <ArrowRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {sections.map((section, i) => (
              <div key={i} className="space-y-6">
                 <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">{section.title}</h3>
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {section.items.map((item, j) => (
                      <motion.button 
                       key={j} 
                       whileHover={{ x: 4, backgroundColor: '#F8FAFC' }}
                       onClick={() => setActiveDetailModal(item.id)}
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
                         <div className="flex items-center gap-5">
                            {item.status && (
                               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
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

         {/* Sidebar: Banking Perks & Quick Stats */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
               <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1.5">
                     <h4 className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Savings Streak</h4>
                     <p className="text-4xl font-black tracking-tighter">12 Months</p>
                  </div>
                  <Trophy className="text-amber-300" size={32} strokeWidth={2.5} />
               </div>
               <p className="text-primary-50 text-[12px] font-medium leading-relaxed opacity-90">You’ve saved 15% more than last year. Your next rewards tier is within reach.</p>
               <button className="w-full py-4 bg-white text-primary-700 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl relative z-10">Claim Perks</button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px] px-2">Account Hub</h3>
               <div className="space-y-5">
                  {[
                    { label: 'Nominees Added', value: '2 Verified', icon: Users, color: 'text-emerald-500' },
                    { label: 'Linked Accounts', value: '4 Total', icon: Building, color: 'text-indigo-500' },
                    { label: 'Pending Requests', value: 'None', icon: History, color: 'text-slate-400' }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center ${stat.color} group-hover:bg-white group-hover:shadow-md transition-all`}>
                             <stat.icon size={18} />
                          </div>
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                       </div>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{stat.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <button className="w-full py-5 border-2 border-rose-50 text-rose-500 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-50 transition-all flex items-center justify-center gap-3">
               <LogOut size={18} /> Logout System
            </button>
         </div>
      </div>

      {/* ──────────────────────────── MODALS ──────────────────────────── */}
      {/* (Rest of modals remain similar but with banking-themed updates to content) */}
      <AnimatePresence>
        {activeDetailModal && (
           <div className="fixed inset-0 z-[130] flex items-center justify-center p-0 lg:p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveDetailModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} className="relative w-full h-full lg:h-auto lg:max-w-2xl bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col" >
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                          {activeDetailModal === 'Products' ? <Building2 size={24} /> : <FileCheck size={24} />}
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeDetailModal === 'Products' ? 'Banking Portfolio' : activeDetailModal === 'Nominee' ? 'Nominee Management' : 'Identity & Regulatory'}</h2>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Vertex Banking Ecosystem</p>
                       </div>
                    </div>
                    <button onClick={() => setActiveDetailModal(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
                 </div>
                 <div className="p-10 overflow-y-auto no-scrollbar max-h-[70vh]">
                    {activeDetailModal === 'Products' && (
                       <div className="space-y-8">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fixed & Recurring Deposits</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                   <div className="flex justify-between items-center"><p className="text-[10px] font-black text-indigo-600 uppercase">Fixed Deposit</p><BadgePercent size={18} className="text-indigo-400" /></div>
                                   <p className="text-xl font-black text-slate-900">₹4,50,000</p>
                                   <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>ROI: 7.5%</span><span>Maturity: 2025</span></div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                   <div className="flex justify-between items-center"><p className="text-[10px] font-black text-emerald-600 uppercase">Recurring Deposit</p><History size={18} className="text-emerald-400" /></div>
                                   <p className="text-xl font-black text-slate-900">₹12,000/mo</p>
                                   <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Progress: 14/24</span><span>Goal: ₹2.8L</span></div>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Loans</h4>
                             <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-[2rem] flex justify-between items-center">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-rose-600 uppercase">Personal Loan • 9012</p>
                                   <p className="text-2xl font-black text-slate-900">₹2,40,000 <span className="text-slate-400 text-xs font-bold">Remaining</span></p>
                                   <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">EMI: ₹12,400 due Oct 28</p>
                                </div>
                                <button className="px-6 py-3 bg-white text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">Repay Now</button>
                             </div>
                          </div>
                       </div>
                    )}
                    {activeDetailModal === 'Nominee' && (
                       <div className="space-y-6">
                          <div className="p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between border border-slate-100">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><User size={24} /></div>
                                <div><p className="font-black text-slate-900 text-[15px]">Sarah Lee</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Relation: Spouse • 100% Share</p></div>
                             </div>
                             <button className="text-primary-600 font-black text-[11px] uppercase tracking-widest">Edit</button>
                          </div>
                          <button className="w-full py-5 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-3">
                             <Plus size={18} /> Add New Nominee
                          </button>
                       </div>
                    )}
                    {activeDetailModal === 'Tax' && (
                       <div className="space-y-4">
                          {[
                            { name: 'Interest Certificate (FY 2023-24)', type: 'PDF • 1.2MB' },
                            { name: 'Form 16A (TDS Certificate)', type: 'PDF • 890KB' },
                            { name: 'Regulatory Form 15G/H', type: 'DIGITAL • SUBMITTED' }
                          ].map((doc, idx) => (
                             <div key={idx} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                                <div><p className="font-black text-slate-900 text-sm leading-none">{doc.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{doc.type}</p></div>
                                <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 shadow-sm transition-all"><Download size={18} /></button>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
                 <div className="p-8 border-t border-slate-50 flex justify-end">
                    <button onClick={() => setActiveDetailModal(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all">Done</button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
