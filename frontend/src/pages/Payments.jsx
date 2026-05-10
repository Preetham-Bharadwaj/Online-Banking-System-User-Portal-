import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  QrCode, 
  Smartphone, 
  Receipt, 
  ArrowLeftRight, 
  History,
  Users,
  Search,
  Plus,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Scan as ScanIcon,
  CreditCard,
  Bell,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import ContactAvatar from '../components/ContactAvatar';
import { useLocation } from 'react-router-dom';
import { useQR } from '../context/QRContext';
import PaymentFlows from '../components/PaymentFlows';
import { X, RefreshCcw } from 'lucide-react';

const Payments = () => {
  const { openScanner } = useQR();
  const location = useLocation();
  const [scanPayment, setScanPayment] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // New States for refactored functionality
  const [activeFlow, setActiveFlow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (location.state?.flow === 'scan' && location.state?.receiver) {
      setScanPayment(location.state.receiver);
      if (location.state.receiver.am) setAmount(location.state.receiver.am);
    }
  }, [location.state]);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setScanPayment(null);
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        setSearchResults({
          contacts: favorites.filter(f => f.name.toLowerCase().includes(query)),
          services: secondaryActions.filter(s => s.label.toLowerCase().includes(query))
        });
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);
  const recentPayments = [
    { id: 1, name: 'Zomato Order', amount: -450, date: 'Today, 2:40 PM', type: 'UPI', avatar: 'ZO', status: 'Success' },
    { id: 2, name: 'Priya Verma', amount: -2500, date: 'Yesterday', type: 'Transfer', avatar: 'PV', status: 'Pending' },
    { id: 3, name: 'Airtel Postpaid', amount: -899, date: 'Oct 24', type: 'Bill', avatar: 'AT', status: 'Success' },
    { id: 4, name: 'Refund: Amazon', amount: 1200, date: 'Oct 22', type: 'Credit', avatar: 'AZ', status: 'Failed' },
  ];

  const favorites = [
    { name: 'Mom', avatar: 'M', color: 'bg-rose-500' },
    { name: 'Rent', avatar: 'R', color: 'bg-slate-800' },
    { name: 'Rahul', avatar: 'RS', color: 'bg-indigo-500' },
    { name: 'Electricity', avatar: 'E', color: 'bg-amber-500' },
  ];

  const scheduled = [
    { name: 'Netflix Premium', date: 'Oct 28', amount: 649, icon: Smartphone },
    { name: 'Act Fiber', date: 'Oct 30', amount: 1199, icon: Zap },
    { name: 'Quant SIP', date: 'Nov 02', amount: 5000, icon: ArrowLeftRight },
  ];

  const primaryActions = [
    { icon: Send, label: 'Bank Transfer', color: 'bg-primary-600', desc: 'To any bank a/c' },
    { icon: ScanIcon, label: 'Scan any QR', color: 'bg-emerald-600', desc: 'Pay merchants' },
    { icon: Zap, label: 'UPI ID / Phone', color: 'bg-indigo-600', desc: 'Instant transfer' },
    { icon: Users, label: 'Split & Groups', color: 'bg-violet-600', desc: 'Manage expenses' },
  ];

  const secondaryActions = [
    { icon: Smartphone, label: 'Mobile', color: 'bg-rose-500' },
    { icon: Receipt, label: 'Utilities', color: 'bg-amber-500' },
    { icon: CreditCard, label: 'Card Bill', color: 'bg-slate-800' },
    { icon: Zap, label: 'Fastag', color: 'bg-blue-500' },
    { icon: ShieldCheck, label: 'Insurance', color: 'bg-emerald-600' },
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case 'Success': return <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-1.5 py-0.5 rounded-md"><CheckCircle2 size={10} /> {status}</span>;
      case 'Pending': return <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase bg-amber-50 px-1.5 py-0.5 rounded-md"><Clock size={10} /> {status}</span>;
      case 'Failed': return <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase bg-rose-50 px-1.5 py-0.5 rounded-md"><AlertCircle size={10} /> {status}</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-6 animate-fadeIn relative">
        
        {/* 1. Mobile-only Floating Action Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openScanner}
          className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white"
        >
          <ScanIcon size={24} />
        </motion.button>

        {/* 2. Top Navigation Utility Bar (Refined Desktop Density) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
           <div className="space-y-1">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none">Payments Hub</h1>
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-emerald-500" /> AES-256 Encryption Active
              </div>
           </div>
           
           <div className="flex-1 max-w-2xl flex flex-col relative">
              <div className="relative group">
                 <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-primary-600 animate-pulse' : 'text-slate-400'}`} size={14} />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name, phone, or UPI ID..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl lg:rounded-lg focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 text-[12px] font-bold outline-none transition-all shadow-sm"
                 />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                 {searchResults && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden"
                   >
                      <div className="p-4 space-y-4">
                         {searchResults.contacts.length > 0 && (
                           <div className="space-y-2">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">People</p>
                              <div className="space-y-1">
                                 {searchResults.contacts.map((c, i) => (
                                   <button key={i} onClick={() => { setActiveFlow('UPI ID / Phone'); setSearchQuery(''); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                      <div className={`w-6 h-6 ${c.color} rounded-md text-[8px] flex items-center justify-center text-white font-black`}>{c.avatar}</div>
                                      <span className="text-[11px] font-bold text-slate-900">{c.name}</span>
                                   </button>
                                 ))}
                              </div>
                           </div>
                         )}
                         {searchResults.services.length > 0 && (
                           <div className="space-y-2">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Services</p>
                              <div className="space-y-1">
                                 {searchResults.services.map((s, i) => (
                                   <button key={i} onClick={() => { setActiveFlow(s.label); setSearchQuery(''); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                      <div className={`w-6 h-6 ${s.color} rounded-md flex items-center justify-center text-white`}><s.icon size={12} /></div>
                                      <span className="text-[11px] font-bold text-slate-900">{s.label}</span>
                                   </button>
                                 ))}
                              </div>
                           </div>
                         )}
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
              
              {/* Compact UPI Widget for Desktop */}
              <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                 <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-[9px]">UPI</div>
                 <div>
                    <p className="text-[10px] font-black text-slate-900 leading-none">alexlee@vertex</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Default ID</p>
                 </div>
                 <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline ml-2">QR</button>
              </div>
           </div>
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Action Grid & History (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Payment Cards (Compact Desktop Proportions) */}
            <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-5">
               <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Money Movement</h3>
                  <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1">
                    Manage Beneficiaries <ArrowRight size={10} />
                  </button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {primaryActions.map((action, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (action.label.includes('Scan')) openScanner();
                        else setActiveFlow(action.label);
                      }}
                      className="relative p-4 lg:p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center lg:flex-col lg:items-start gap-4 lg:gap-3 group overflow-hidden"
                    >
                      <div className={`w-10 h-10 lg:w-9 lg:h-9 ${action.color} rounded-lg flex items-center justify-center text-white shadow-md relative z-10 shrink-0`}>
                         <action.icon size={20} className="lg:w-4 lg:h-4" />
                      </div>
                      <div className="text-left relative z-10">
                        <span className="text-[12px] lg:text-[11px] font-black text-slate-900 uppercase tracking-widest block">{action.label}</span>
                        <span className="text-[10px] lg:text-[9px] font-bold text-slate-400 leading-tight hidden lg:block">{action.desc}</span>
                      </div>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/5 rounded-full -translate-y-8 translate-x-8 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                  ))}
               </div>
            </div>

            {/* Quick Payees Section (Denser) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
               <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Recent Payees</h3>
                  <div className="flex bg-slate-50 p-0.5 rounded-md">
                     <button className="px-3 py-1 bg-white shadow-sm rounded-md text-[9px] font-black text-slate-900 uppercase tracking-widest">All</button>
                     <button className="px-3 py-1 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Favorites</button>
                  </div>
               </div>
               <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth">
                  {favorites.map((fav, i) => (
                    <ContactAvatar key={i} name={fav.name} avatar={fav.avatar} color={fav.color} />
                  ))}
                  <div className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-primary-400 group-hover:text-primary-600 transition-all bg-white">
                       <Plus size={18} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Add</span>
                  </div>
               </div>
            </div>

            {/* Bills & Recharge Section (Compact Desktop) */}
            <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-5">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px] px-1">Digital Services</h3>
               <div className="grid grid-cols-4 lg:grid-cols-5 gap-4 px-2">
                  {secondaryActions.map((item, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveFlow(item.label)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-10 h-10 lg:w-11 lg:h-11 ${item.color} rounded-lg flex items-center justify-center text-white shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1`}>
                         <item.icon size={18} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center leading-none">{item.label}</span>
                    </motion.button>
                  ))}
               </div>
            </div>

            {/* Payment History (Dense) */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
               <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                 <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Transaction Log</h3>
                 <div className="flex items-center gap-4">
                    <button className="text-[9px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest">Filter</button>
                    <button className="text-[9px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest">Download</button>
                 </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {recentPayments.map((pmt) => (
                    <div key={pmt.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-4 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors text-[10px] shadow-sm">
                             {pmt.avatar}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-[13px] leading-tight">{pmt.name}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 leading-none">{pmt.type} • {pmt.date}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`font-black text-[13px] leading-tight ${pmt.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                             {pmt.amount > 0 ? '+' : '-'}₹{Math.abs(pmt.amount).toLocaleString()}
                          </p>
                          <div className="mt-1 flex justify-end">
                             {getStatusChip(pmt.status)}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right: Insights & Upcoming (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Payment Reminder (Dense) */}
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex gap-4 items-start group shadow-sm">
               <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <Bell size={16} />
               </div>
               <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                     <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Action Required</h4>
                     <button className="text-amber-400 hover:text-amber-600"><Plus size={14} className="rotate-45" /></button>
                  </div>
                  <p className="text-[11px] text-amber-700 font-bold leading-relaxed">Electricity bill (₹2,450) due tomorrow.</p>
                  <button className="text-[9px] font-black text-amber-900 uppercase tracking-[0.15em] hover:underline flex items-center gap-1 pt-1">Quick Pay <ArrowRight size={10} /></button>
               </div>
            </div>

            {/* Upcoming / Scheduled (Dense) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-5">
               <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Scheduled</h3>
                  <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Calendar</button>
               </div>
               <div className="space-y-2">
                  {scheduled.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl group hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-white rounded-lg text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">
                             <item.icon size={12} />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 text-[11px] leading-tight">{item.name}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.date}</p>
                          </div>
                       </div>
                       <p className="font-black text-slate-900 text-[11px]">₹{item.amount.toLocaleString()}</p>
                    </div>
                  ))}
               </div>
               <button 
                 onClick={() => setActiveFlow('Schedule')}
                 className="w-full py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
               >
                  <Calendar size={12} /> Add Schedule
               </button>
            </div>

            {/* Virtual Card Utility (Reduced Height) */}
            <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden group shadow-lg shadow-slate-200/50">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                     <CreditCard size={20} className="text-primary-400" />
                     <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Virtual Proxy</span>
                        <span className="text-[10px] font-black text-white">•••• 4421</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[11px] font-black tracking-tight leading-none">Instant Proxy Details</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-black text-[8px] uppercase tracking-widest transition-all">Show Details</button>
                    <button className="py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-black text-[8px] uppercase tracking-widest transition-all shadow-md">Copy Number</button>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* ──────────────────────────── MODALS ──────────────────────────── */}
        <AnimatePresence>
          {scanPayment && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setScanPayment(null)} 
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: 50 }}
                 className="relative w-full h-full lg:h-auto lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
               >
                  {showSuccess ? (
                    <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                       <motion.div 
                         initial={{ scale: 0.5, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200"
                       >
                          <CheckCircle2 size={48} />
                       </motion.div>
                       <div className="space-y-2">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful</h2>
                          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Transaction ID: VRX982103</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-2xl w-full">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sent To</p>
                          <p className="text-lg font-black text-slate-900">{scanPayment.pn}</p>
                          <p className="text-2xl font-black text-primary-600 mt-3">₹{amount}</p>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-black text-lg">
                               {scanPayment.pn?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                               <h2 className="text-xl font-black text-slate-900 tracking-tight">{scanPayment.pn}</h2>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{scanPayment.pa}</p>
                            </div>
                         </div>
                         <button onClick={() => setScanPayment(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
                         </button>
                      </div>

                      <form onSubmit={handlePaymentSubmit} className="p-10 space-y-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">Amount to Pay</label>
                            <div className="relative">
                               <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
                               <input 
                                required
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-14 pr-8 py-8 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-200"
                               />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">Note (Optional)</label>
                            <input 
                              type="text" 
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="What's this for?"
                              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all"
                            />
                         </div>

                         <div className="p-6 bg-primary-50 rounded-[2rem] border border-primary-100 flex items-center gap-4">
                            <ShieldCheck size={24} className="text-primary-600" />
                            <div>
                               <p className="text-[10px] font-black text-primary-900 uppercase tracking-widest leading-none mb-1">Encrypted Payment</p>
                               <p className="text-[11px] text-primary-700 font-bold opacity-80">This transaction is protected by 256-bit encryption.</p>
                            </div>
                         </div>

                         <button 
                          disabled={isProcessing}
                          className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-3 ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-primary-600'}`}
                         >
                            {isProcessing ? (
                              <>
                                <RefreshCcw size={18} className="animate-spin" /> Verifying...
                              </>
                            ) : (
                              <>
                                Pay ₹{amount || '0'} Securely
                              </>
                            )}
                         </button>
                      </form>
                    </>
                  )}
               </motion.div>
            </div>
          )}
         </AnimatePresence>

         {/* Unified Payment Flows Modal */}
         <PaymentFlows 
           isOpen={!!activeFlow} 
           onClose={() => setActiveFlow(null)} 
           activeFlow={activeFlow} 
         />
      </div>
   
  );
};

export default Payments;
