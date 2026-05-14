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

import useStore from '../store/useStore';
import { bankingService } from '../services/bankingService';
import authService from '../services/authService';

const Payments = () => {
   const { openScanner } = useQR();
   const location = useLocation();
   const { balance, recentTransactions, beneficiaries, isLoading, setLoading, error, setError, setBankingData, activeAccount, cards, bills, platformUsers } = useStore();

   
   const [scanPayment, setScanPayment] = useState(null);
   const [amount, setAmount] = useState('');
   const [note, setNote] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
   const [paymentStep, setPaymentStep] = useState(1); // 1: Amount, 2: PIN
   const [upiPin, setUpiPin] = useState('');

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

   const [activeFlow, setActiveFlow] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [isSearching, setIsSearching] = useState(false);
   const [searchResults, setSearchResults] = useState(null);
   const [selectedRecipient, setSelectedRecipient] = useState(null);

   useEffect(() => {
      if (location.state?.flow === 'scan' && location.state?.receiver) {
         setScanPayment(location.state.receiver);
         if (location.state.receiver.am) setAmount(location.state.receiver.am);
      }
      
      if (location.state?.recipient) {
         setSelectedRecipient(location.state.recipient);
         setActiveFlow('UPI ID / Phone');
         // Clear state to prevent re-opening on back button
         window.history.replaceState({}, document.title);
      }
   }, [location.state]);


   const handlePaymentSubmit = async (e) => {
      e.preventDefault();
      
      if (paymentStep === 1) {
         if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
         }
         setPaymentStep(2);
         return;
      }

      if (!upiPin || upiPin.length < 4) {
         setError("Please enter your 4-digit UPI PIN");
         return;
      }

      setIsProcessing(true);
      setError(null);
      try {
         if (!scanPayment?.pa) {
            throw new Error("Invalid receiver information. Please scan again.");
         }

         await bankingService.upiTransfer({
            receiverUpi: scanPayment.pa,
            amount: parseFloat(amount),
            pin: upiPin,
            note
         });

         // Refresh data after payment
         const updatedData = await bankingService.getDashboardData();
         setBankingData(updatedData);

         setIsProcessing(false);
         setShowSuccess(true);
         setTimeout(() => {
            setShowSuccess(false);
            setScanPayment(null);
            setAmount('');
            setNote('');
            setUpiPin('');
            setPaymentStep(1);
         }, 3000);
      } catch (err) {
         setError(err.response?.data?.error || err.message || "Payment failed.");
         setIsProcessing(false);
         if (err.response?.data?.error?.includes('PIN')) {
            setPaymentStep(2);
         }
      }
   };

   useEffect(() => {
      if (searchQuery.length > 1) {
         setIsSearching(true);
         const timer = setTimeout(async () => {
            try {
               const query = searchQuery.toLowerCase();
               
               // 1. Fetch real users from Global Directory
               const globalUsers = await authService.searchUsers(query);
               
               // 2. Filter local beneficiaries
               const localContacts = beneficiaries
                  .filter(f => f.beneficiary_name.toLowerCase().includes(query) || f.upi_id?.toLowerCase().includes(query))
                  .map(f => ({
                     ...f,
                     name: f.beneficiary_name,
                     avatar: (f.beneficiary_name || 'U').substring(0, 1).toUpperCase(),
                     color: 'bg-primary-600'
                  }));

               setSearchResults({
                  contacts: localContacts,
                  global: globalUsers.filter(gu => !localContacts.some(lc => lc.upi_id === gu.upi_id)),
                  services: secondaryActions.filter(s => s.label.toLowerCase().includes(query))
               });
            } catch (err) {
               console.error("Search failed:", err);
            } finally {
               setIsSearching(false);
            }
         }, 400);
         return () => clearTimeout(timer);
      } else {
         setSearchResults(null);
      }
   }, [searchQuery, beneficiaries]);


   const recentPayments = recentTransactions.length > 0 ? recentTransactions.slice(0, 4).map(tx => ({
      id: tx.id,
      name: tx.description,
      amount: tx.amount,
      date: new Date(tx.created_at).toLocaleDateString(),
      type: tx.payment_method || 'UPI',
      avatar: (tx.description || 'TX').substring(0, 2).toUpperCase(),
      status: tx.status === 'completed' ? 'Success' : tx.status === 'pending' ? 'Pending' : 'Failed'
   })) : [];

    const favorites = platformUsers.length > 0 ? platformUsers.map(u => ({
       name: u.full_name,
       upi: u.upi_id,
       avatar: (u.full_name || 'U').substring(0, 1).toUpperCase(),
       color: 'bg-primary-600'
    })) : (beneficiaries.length > 0 ? beneficiaries.map(b => ({
       name: b.beneficiary_name,
       upi: b.upi_id,
       avatar: (b.beneficiary_name || 'U').substring(0, 1).toUpperCase(),
       color: 'bg-primary-600'
    })) : []);


   const scheduled = bills.slice(0, 3).map((bill) => ({
      name: bill.provider_name,
      date: bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'Due soon',
      amount: Number(bill.amount || 0),
      icon: Receipt
   }));


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
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-10 animate-fadeIn relative">

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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="space-y-1">
                  <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Payments Hub</h1>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl lg:rounded-lg focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 text-[12px] font-bold outline-none transition-all shadow-sm"
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
                                          <button 
                                             key={i} 
                                             onClick={() => { 
                                                setSelectedRecipient({ upi: c.upi_id, name: c.beneficiary_name });
                                                setActiveFlow('UPI ID / Phone'); 
                                                setSearchQuery(''); 
                                             }} 
                                             className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                          >
                                             <div className={`w-6 h-6 ${c.color} rounded-md text-[8px] flex items-center justify-center text-white font-black`}>{c.avatar}</div>
                                             <span className="text-[11px] font-bold text-slate-900">{c.name}</span>
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              )}
                              {searchResults.global?.length > 0 && (
                                  <div className="space-y-2">
                                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Global Discovery</p>
                                     <div className="space-y-1">
                                        {searchResults.global.map((gu, i) => (
                                           <button 
                                              key={i} 
                                              onClick={() => { 
                                                 setSelectedRecipient({ upi: gu.upi_id, name: gu.full_name });
                                                 setActiveFlow('UPI ID / Phone'); 
                                                 setSearchQuery(''); 
                                              }} 
                                              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                                           >
                                              <div className="flex items-center gap-3">
                                                 <div className="w-6 h-6 bg-slate-900 rounded-md text-[8px] flex items-center justify-center text-white font-black">
                                                    {gu.full_name.substring(0, 2).toUpperCase()}
                                                 </div>
                                                 <div>
                                                    <p className="text-[11px] font-black text-slate-900 leading-none">{gu.full_name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-1">{gu.upi_id}</p>
                                                 </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                 {gu.is_verified && <ShieldCheck size={12} className="text-primary-600" />}
                                                 <span className="text-[8px] font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Pay Now</span>
                                              </div>
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
               <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
                  <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-[9px]">UPI</div>
                  <div>
                     <p className="text-[10px] font-black text-slate-900 leading-none">{activeAccount?.upi_id || 'upi pending'}</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Default ID</p>
                  </div>
                  <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline ml-2">QR</button>
               </div>
            </div>

            {/* 3. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

               {/* Left: Action Grid & History (8 cols) */}
               <div className="lg:col-span-8 space-y-8">

                  {/* Primary Payment Cards (Compact Desktop Proportions) */}
                  <div className="bg-white p-5 lg:p-7 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                     <div className="flex justify-between items-center px-1">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Money Movement</h3>
                        <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1">
                           Manage Beneficiaries <ArrowRight size={10} />
                        </button>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {primaryActions.map((action, i) => (
                           <motion.button
                              key={i}
                              whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                 if (action.label.includes('Scan')) openScanner();
                                 else setActiveFlow(action.label);
                              }}
                              className="relative p-5 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all flex flex-col items-start gap-4 group overflow-hidden"
                           >
                              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg relative z-10 shrink-0`}>
                                 <action.icon size={20} />
                              </div>
                              <div className="text-left relative z-10">
                                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest block">{action.label}</span>
                                 <span className="text-[9px] font-bold text-slate-400 leading-tight mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{action.desc}</span>
                              </div>
                              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-primary-500/10 transition-colors"></div>
                           </motion.button>
                        ))}
                     </div>
                  </div>

                  {/* Quick Payees Section (Denser) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                     <div className="flex justify-between items-center px-1">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Recent Payees</h3>
                        <div className="flex bg-slate-50 p-0.5 rounded-lg">
                           <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-[9px] font-black text-slate-900 uppercase tracking-widest">All</button>
                           <button className="px-4 py-1.5 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Favorites</button>
                        </div>
                     </div>
                     <div className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2">
                        {favorites.map((fav, i) => (
                           <div key={i} onClick={() => {
                              setActiveFlow('UPI ID / Phone');
                              setSelectedRecipient({ upi_id: fav.upi, full_name: fav.name });
                           }}>
                              <ContactAvatar name={fav.name} avatar={fav.avatar} color={fav.color} />
                           </div>

                        ))}
                        <div className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer">
                           <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-primary-400 group-hover:text-primary-600 transition-all bg-white shadow-sm">
                              <Plus size={20} />
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Add</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Bills & Recharge Section (Compact Desktop) */}
                     <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px] px-1">Digital Services</h3>
                        <div className="grid grid-cols-5 gap-4">
                           {secondaryActions.map((item, i) => (
                              <motion.button
                                 key={i}
                                 whileHover={{ scale: 1.1, y: -2 }}
                                 onClick={() => setActiveFlow(item.label)}
                                 className="flex flex-col items-center gap-3 group"
                              >
                                 <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg transition-all group-hover:rotate-6`}>
                                    <item.icon size={18} />
                                 </div>
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-none truncate w-full">{item.label}</span>
                              </motion.button>
                           ))}
                        </div>
                     </div>

                     {/* Payment Reminder (Dense) */}
                     <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl flex gap-5 items-start group shadow-sm hover:bg-amber-50 transition-colors">
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                           <Bell size={18} />
                        </div>
                        <div className="space-y-1.5 flex-1">
                           <div className="flex justify-between items-center">
                              <h4 className="text-[9px] font-black text-amber-900 uppercase tracking-widest">Action Required</h4>
                              <button className="text-amber-400 hover:text-amber-600 transition-colors"><X size={14} /></button>
                           </div>
                           <p className="text-[12px] text-amber-800 font-bold leading-relaxed">Electricity bill (₹2,450) due tomorrow.</p>
                           <button className="text-[9px] font-black text-amber-900 uppercase tracking-[0.2em] hover:underline flex items-center gap-1.5 pt-2">Quick Pay <ArrowRight size={10} /></button>
                        </div>
                     </div>
                  </div>

                  {/* Payment History (Dense) */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                     <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Transaction Log</h3>
                        <div className="flex items-center gap-6">
                           <button className="text-[9px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors">Filter</button>
                           <button className="text-[9px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors">Download</button>
                        </div>
                     </div>
                     <div className="divide-y divide-slate-50">
                        {recentPayments.length > 0 ? recentPayments.map((pmt) => (
                           <div key={pmt.id} className="flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-5 flex-1">
                                 <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors text-[11px] shadow-sm">
                                    {pmt.avatar}
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 text-[14px] leading-tight">{pmt.name}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{pmt.type} • {pmt.date}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className={`font-black text-[14px] leading-tight ${pmt.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {pmt.amount > 0 ? '+' : '-'}₹{Math.abs(pmt.amount).toLocaleString()}
                                 </p>
                                 <div className="mt-1.5 flex justify-end">
                                    {getStatusChip(pmt.status)}
                                 </div>
                              </div>
                           </div>
                        )) : (
                           <div className="p-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent transactions</div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right: Insights & Upcoming (4 cols) */}
               <div className="lg:col-span-4 space-y-8">

                  {/* Virtual Card Utility (Refined) */}
                  <div className="bg-slate-900 rounded-[2rem] p-7 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                     <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                           <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/5">
                              <CreditCard size={24} className="text-primary-400" />
                           </div>
                           <div className="text-right">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Virtual Proxy</span>
                              <span className="text-[13px] font-black text-white tracking-widest">•••• {cards[0]?.card_number?.slice(-4) || cards[0]?.masked_card_number?.slice(-4) || '4589'}</span>
                           </div>
                        </div>
                        <div className="space-y-1 pt-2">
                           <p className="text-[14px] font-black tracking-tight leading-none">Instant Proxy Details</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Single-use secure numbers</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <button className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/5">Show Details</button>
                           <button className="py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl shadow-primary-900/20">Copy Number</button>
                        </div>
                     </div>
                  </div>

                  {/* Upcoming / Scheduled (Dense) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                     <div className="flex justify-between items-center px-1">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Scheduled</h3>
                        <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline transition-all">Calendar</button>
                     </div>
                     <div className="space-y-3">
                        {scheduled.length > 0 ? scheduled.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl group hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                              <div className="flex items-center gap-4">
                                 <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">
                                    <item.icon size={14} />
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-900 text-[12px] leading-tight">{item.name}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.date}</p>
                                 </div>
                              </div>
                              <p className="font-black text-slate-900 text-[12px]">₹{item.amount.toLocaleString()}</p>
                           </div>
                        )) : (
                           <p className="text-center text-[9px] font-black text-slate-400 uppercase py-4">No scheduled bills</p>
                        )}
                     </div>
                     <button
                        onClick={() => setActiveFlow('Schedule')}
                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
                     >
                        <Calendar size={14} /> Add Schedule
                     </button>
                  </div>

                  {/* Security Insight (NEW) */}
                  <div className="bg-emerald-50/30 border border-emerald-100/50 p-6 rounded-2xl space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
                           <ShieldCheck size={16} />
                        </div>
                        <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Security Safe</h4>
                     </div>
                     <p className="text-[11px] text-emerald-700 font-bold leading-relaxed">Your payment limit is set to ₹50,000/day for added protection.</p>
                     <button className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Adjust Limit</button>
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
                                    {(scanPayment.pn || 'PY').substring(0, 2).toUpperCase()}
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
                              {error && (
                                 <motion.div 
                                   initial={{ opacity: 0, y: -10 }} 
                                   animate={{ opacity: 1, y: 0 }}
                                   className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 mb-4"
                                 >
                                   <div className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                     <X size={14} />
                                   </div>
                                   <p className="text-[11px] font-black text-rose-600 uppercase tracking-tight">{error}</p>
                                 </motion.div>
                               )}

                               {paymentStep === 1 ? (
                                  <>
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
                                           className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all"
                                        />
                                     </div>

                                     <button
                                        type="submit"
                                        className="w-full py-5 bg-black text-white rounded-3xl font-bold flex items-center justify-center gap-2"
                                     >
                                        Continue
                                     </button>
                                  </>
                               ) : !user?.has_upi_pin ? (
                                  <>
                                     <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-slate-900">Set Your UPI PIN</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">You haven't set a PIN yet. Let's do it now.</p>
                                     </div>
                                     <div className="flex justify-center gap-3 py-4">
                                        {[0, 1, 2, 3].map((i) => (
                                           <input
                                              key={i}
                                              type="password"
                                              maxLength={1}
                                              className="w-16 h-16 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-center text-2xl font-bold focus:border-black outline-none transition-all"
                                              value={upiPin[i] || ''}
                                              onChange={(e) => {
                                                 const val = e.target.value;
                                                 if (val.length > 1) return;
                                                 const pinArr = upiPin.split('');
                                                 while(pinArr.length < 4) pinArr.push('');
                                                 pinArr[i] = val;
                                                 setUpiPin(pinArr.join(''));
                                                 if (val && i < 3) {
                                                    const next = e.target.nextSibling;
                                                    if (next) next.focus();
                                                 }
                                              }}
                                           />
                                        ))}
                                     </div>
                                     <button
                                        type="button"
                                        onClick={async () => {
                                           if (upiPin.length < 4) return;
                                           setIsProcessing(true);
                                           try {
                                              await bankingService.setupPin(upiPin);
                                              // Success! Now allow the payment to proceed
                                              const updatedData = await bankingService.getDashboardData();
                                              setBankingData(updatedData);
                                              setUpiPin(''); // Clear PIN for payment
                                              setError(null);
                                           } catch (err) {
                                              setError(err.response?.data?.error || "Failed to set PIN");
                                           } finally {
                                              setIsProcessing(false);
                                           }
                                        }}
                                        disabled={isProcessing || upiPin.length < 4}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2"
                                     >
                                        {isProcessing ? 'Setting PIN...' : 'Setup & Continue'}
                                     </button>
                                  </>
                               ) : (
                                  <>
                                     <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-slate-900">Enter UPI PIN</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Verify to complete payment</p>
                                     </div>
                                     <div className="flex justify-center gap-3 py-4">
                                        {[0, 1, 2, 3].map((i) => (
                                           <input
                                              key={i}
                                              type="password"
                                              maxLength={1}
                                              className="w-16 h-16 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-center text-2xl font-bold focus:border-black outline-none transition-all"
                                              value={upiPin[i] || ''}
                                              onChange={(e) => {
                                                 const val = e.target.value;
                                                 if (val.length > 1) return;
                                                 const pinArr = upiPin.split('');
                                                 while(pinArr.length < 4) pinArr.push('');
                                                 pinArr[i] = val;
                                                 setUpiPin(pinArr.join(''));
                                                 if (val && i < 3) {
                                                    const next = e.target.nextSibling;
                                                    if (next) next.focus();
                                                 }
                                              }}
                                           />
                                        ))}
                                     </div>
                                     <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full py-5 bg-black text-white rounded-3xl font-bold flex items-center justify-center gap-2"
                                     >
                                        {isProcessing ? 'Processing...' : 'Pay Securely'}
                                     </button>

                                     <button 
                                        type="button" 
                                        onClick={() => setPaymentStep(1)}
                                        className="w-full text-[10px] font-black text-primary-600 uppercase tracking-widest"
                                     >
                                        Back to details
                                     </button>
                                  </>
                               )}

                               <div className="p-6 bg-primary-50 rounded-[2rem] border border-primary-100 flex items-center gap-4">
                                  <ShieldCheck size={24} className="text-primary-600" />
                                  <div>
                                     <p className="text-[10px] font-black text-primary-900 uppercase tracking-widest leading-none mb-1">Encrypted Payment</p>
                                     <p className="text-[11px] text-primary-700 font-bold opacity-80">This transaction is protected by 256-bit encryption.</p>
                                  </div>
                               </div>
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
      onClose={() => { setActiveFlow(null); setSelectedRecipient(null); }}
      activeFlow={activeFlow}
      initialData={selectedRecipient}
   />

      </div>

   );
};

export default Payments;
