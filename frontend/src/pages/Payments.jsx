import { useState, useEffect, useRef, useMemo } from 'react';
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
   MoreHorizontal,
   X,
   RefreshCcw,
   Trash2,
   Edit,
   Sparkles,
   Star,
   Heart,
   PlusCircle,
   ChevronRight,
   Check,
   Tv,
   Droplet,
   Flame,
   Wifi,
   Car
} from 'lucide-react';
import ContactAvatar from '../components/ContactAvatar';
import { useLocation } from 'react-router-dom';
import { useQR } from '../context/QRContext';
import PaymentFlows from '../components/PaymentFlows';
import useStore from '../store/useStore';
import { bankingService } from '../services/bankingService';
import authService from '../services/authService';
import { supabase } from '../utils/supabaseClient';

const primaryActions = [
   { icon: Send, label: 'To Bank Account', color: 'bg-indigo-600 shadow-indigo-100', desc: 'Secure IMPS/NEFT transfers' },
   { icon: Zap, label: 'To Mobile / UPI', color: 'bg-violet-600 shadow-violet-100', desc: 'Instant VPA transfer' },
   { icon: ArrowLeftRight, label: 'To Self Account', color: 'bg-emerald-600 shadow-emerald-100', desc: 'Sweep connected funds' },
   { icon: Users, label: 'Split Expense', color: 'bg-rose-500 shadow-rose-100', desc: 'Settle shared groups' },
];

const secondaryActions = [
   { icon: Smartphone, label: 'Mobile Recharge', color: 'bg-rose-50' },
   { icon: Tv, label: 'DTH Recharge', color: 'bg-slate-50' },
   { icon: Zap, label: 'Electricity', color: 'bg-amber-50' },
   { icon: Droplet, label: 'Water', color: 'bg-sky-50' },
   { icon: Flame, label: 'Gas', color: 'bg-orange-50' },
   { icon: Wifi, label: 'Broadband', color: 'bg-indigo-50' },
   { icon: Car, label: 'FASTag', color: 'bg-blue-50' },
   { icon: Plus, label: 'Utilities', color: 'bg-purple-50' }
];

const Payments = () => {
   const { openScanner } = useQR();
   const location = useLocation();
   const { 
     balance, 
     recentTransactions, 
     beneficiaries, 
     isLoading, 
     setLoading, 
     setError, 
     setBankingData, 
     activeAccount, 
     cards, 
     bills, 
     platformUsers,
     user
   } = useStore();

   // Core Scan QR Payment States
   const [scanPayment, setScanPayment] = useState(null);
   const [amount, setAmount] = useState('');
   const [note, setNote] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
   const [paymentStep, setPaymentStep] = useState(1); // 1: Amount, 2: PIN
   const [upiPin, setUpiPin] = useState('');
   const [txReference, setTxReference] = useState('');
   const [localError, setLocalError] = useState(null);

   // Redesign Interaction States
   const [activeFlow, setActiveFlow] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [isSearching, setIsSearching] = useState(false);
   const [searchResults, setSearchResults] = useState(null);
   const [selectedRecipient, setSelectedRecipient] = useState(null);

   // Add Beneficiary Modal States
   const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false);
   const [newBeneName, setNewBeneName] = useState('');
   const [newBeneUpi, setNewBeneUpi] = useState('');
   const [newBeneAcc, setNewBeneAcc] = useState('');
   const [newBeneIfsc, setNewBeneIfsc] = useState('');
   const [newBeneNick, setNewBeneNick] = useState('');
   const [beneLoading, setBeneLoading] = useState(false);

   // Edit Schedule Modal States
   const [isEditingSchedule, setIsEditingSchedule] = useState(false);
   const [editingScheduleData, setEditingScheduleData] = useState(null);
   const [editAmount, setEditAmount] = useState('');
   const [editDueDate, setEditDueDate] = useState('');
   const [editProvider, setEditProvider] = useState('');
   const [editLoading, setEditLoading] = useState(false);

   // Dynamic Transaction Filter State
   const [txFilter, setTxFilter] = useState('ALL'); // ALL, CREDITS, DEBITS

   useEffect(() => {
      if (location.state?.flow === 'scan' && location.state?.receiver) {
         setScanPayment(location.state.receiver);
         if (location.state.receiver.am) setAmount(location.state.receiver.am);
      }

      if (location.state?.recipient) {
         setSelectedRecipient(location.state.recipient);
         setActiveFlow('UPI ID / Phone');
         window.history.replaceState({}, document.title);
      }
   }, [location.state]);

   // Core Scan QR Payment execution
   const handlePaymentSubmit = async (e) => {
      e.preventDefault();
      if (paymentStep === 1) {
         setPaymentStep(2);
         return;
      }

      setIsProcessing(true);
      setLocalError(null);
      try {
         const receiverUpi = scanPayment?.pa || selectedRecipient?.upi_id || selectedRecipient?.upi;

         if (!receiverUpi) {
            throw new Error("No recipient selected");
         }

         const paymentPayload = {
            receiverUpi: receiverUpi,
            amount: parseFloat(amount),
            pin: upiPin,
            note: note || 'QR Purchase'
         };

         const response = await bankingService.scanPay(paymentPayload);

         if (response.reference) {
            setTxReference(response.reference);
         }

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
            setTxReference('');
         }, 4000);
      } catch (err) {
         setLocalError(err.response?.data?.error || err.message || "Payment failed.");
         setIsProcessing(false);
         if (err.response?.data?.error?.includes('PIN')) {
            setPaymentStep(2);
         }
      }
   };

   // Client-Side O(1) Search Cache for Global Directory lookups (ADA O(1) Cache requirement)
   const apiSearchCache = useRef(new Map());

   // ADA O(1) Prefix-Suffix Hash Map for Instant Local Autocomplete Discovery
   const localSearchHashMap = useMemo(() => {
      const index = new Map();

      const indexItem = (queryKey, item, category) => {
         if (!queryKey) return;
         const lowerKey = String(queryKey).toLowerCase().trim();
         if (!lowerKey) return;

         // A. Index whole lowercased term prefixes
         for (let len = 1; len <= lowerKey.length; len++) {
            const prefix = lowerKey.slice(0, len);
            if (!index.has(prefix)) {
               index.set(prefix, { contacts: new Set(), global: new Set(), services: new Set() });
            }
            index.get(prefix)[category].add(item);
         }

         // B. Index tokenized sub-word prefixes to handle multi-word query entries (e.g. "Preetham Bharadwaj")
         const tokens = lowerKey.split(/[\s.@_-]+/);
         for (const token of tokens) {
            if (token.length < 2) continue;
            for (let len = 1; len <= token.length; len++) {
               const prefix = token.slice(0, len);
               if (!index.has(prefix)) {
                  index.set(prefix, { contacts: new Set(), global: new Set(), services: new Set() });
               }
               index.get(prefix)[category].add(item);
            }
         }
      };

      // 1. Index local beneficiaries into O(1) search buckets
      (beneficiaries || []).forEach(b => {
         const formatted = {
            id: b.id,
            name: b.beneficiary_name,
            upi_id: b.upi_id,
            phone_number: b.phone_number || b.account_number || '',
            is_verified: b.is_verified || false,
            avatar: (b.beneficiary_name || 'U').substring(0, 2).toUpperCase(),
            color: 'bg-indigo-600',
            _source: 'beneficiary'
         };
         
         indexItem(b.beneficiary_name, formatted, 'contacts');
         indexItem(b.upi_id, formatted, 'contacts');
         indexItem(b.nickname, formatted, 'contacts');
         if (b.phone_number) indexItem(b.phone_number, formatted, 'contacts');
      });

      // 2. Index platformUsers into O(1) search buckets
      (platformUsers || []).forEach(u => {
         const formatted = {
            id: u.id,
            full_name: u.full_name,
            upi_id: u.upi_id,
            phone_number: u.phone_number || '',
            is_verified: u.is_verified || false,
            profile_image: u.profile_image,
            avatar: (u.full_name || 'U').substring(0, 2).toUpperCase(),
            color: 'bg-slate-900',
            _source: 'platform'
         };

         indexItem(u.full_name, formatted, 'global');
         indexItem(u.upi_id, formatted, 'global');
         if (u.phone_number) indexItem(u.phone_number, formatted, 'global');
      });

      // 3. Index utility bill services and primary actions into O(1) search buckets
      primaryActions.forEach(action => {
         indexItem(action.label, action, 'services');
      });
      secondaryActions.forEach(service => {
         indexItem(service.label, service, 'services');
      });

      // Convert all Set references to pure Arrays for efficient direct React mapping
      const finalIndex = new Map();
      for (const [key, value] of index.entries()) {
         finalIndex.set(key, {
            contacts: Array.from(value.contacts),
            global: Array.from(value.global),
            services: Array.from(value.services)
         });
      }

      return finalIndex;
   }, [beneficiaries, platformUsers]);

   // Optimized search effect with O(1) local suggestion rendering and O(1) API response caching
   useEffect(() => {
      const cleanQuery = searchQuery.trim().toLowerCase();

      if (cleanQuery.length < 2) {
         setSearchResults(null);
         setIsSearching(false);
         return;
      }

      setIsSearching(true);

      // 1. Instant O(1) lookup in our local prefix hash map
      const localMatches = localSearchHashMap.get(cleanQuery) || { contacts: [], global: [], services: [] };

      // Update UI state instantly with local matching records to eliminate typings latency
      setSearchResults(prev => ({
         contacts: localMatches.contacts,
         global: localMatches.global,
         services: localMatches.services,
         isLoadingGlobal: true // set global directories loading state
      }));

      // 2. Debounced asynchronous global user query
      const timer = setTimeout(async () => {
         try {
            let globalUsers = [];

            // Retrieve from client-side O(1) cache if query has been resolved previously
            if (apiSearchCache.current.has(cleanQuery)) {
               globalUsers = apiSearchCache.current.get(cleanQuery);
            } else {
               globalUsers = await authService.searchUsers(cleanQuery);
               apiSearchCache.current.set(cleanQuery, globalUsers);
            }

            const localUpis = new Set(localMatches.contacts.map(c => c.upi_id?.toLowerCase()));
            
            // Format and merge results
            const formattedGlobal = globalUsers.map(gu => ({
               id: gu.id,
               full_name: gu.full_name,
               upi_id: gu.upi_id,
               phone_number: gu.phone_number || '',
               is_verified: gu.is_verified || false,
               profile_image: gu.profile_image,
               avatar: (gu.full_name || 'U').substring(0, 2).toUpperCase(),
               color: 'bg-slate-900',
               _source: 'api'
            }));

            const mergedGlobal = [
               ...localMatches.global,
               ...formattedGlobal
            ].filter(gu => !localUpis.has(gu.upi_id?.toLowerCase()));

            // Deduplicate lists by UPI ID to prevent UI key warnings
            const seenUpis = new Set();
            const dedupedGlobal = mergedGlobal.filter(gu => {
               const upi = gu.upi_id?.toLowerCase();
               if (!upi || seenUpis.has(upi)) return false;
               seenUpis.add(upi);
               return true;
            });

            setSearchResults({
               contacts: localMatches.contacts,
               global: dedupedGlobal,
               services: localMatches.services,
               isLoadingGlobal: false
            });
         } catch (err) {
            console.error("Global directory discovery failed:", err);
            setSearchResults(prev => ({
               ...prev,
               isLoadingGlobal: false,
               error: true
            }));
         } finally {
            setIsSearching(false);
         }
      }, 250); // 250ms debouncing delay

      return () => clearTimeout(timer);
   }, [searchQuery, localSearchHashMap]);

   // Create New Beneficiary directly to database
   const handleAddBeneficiary = async (e) => {
      e.preventDefault();
      setBeneLoading(true);
      setLocalError(null);
      try {
         await bankingService.addBeneficiary({
            beneficiary_name: newBeneName,
            upi_id: newBeneUpi,
            account_number: newBeneAcc || null,
            ifsc_code: newBeneIfsc || null,
            nickname: newBeneNick || newBeneName
         });

         const updatedData = await bankingService.getDashboardData();
         setBankingData(updatedData);

         setIsAddingBeneficiary(false);
         setNewBeneName('');
         setNewBeneUpi('');
         setNewBeneAcc('');
         setNewBeneIfsc('');
         setNewBeneNick('');
      } catch (err) {
         setLocalError("Failed to register beneficiary. Verify details.");
      } finally {
         setBeneLoading(false);
      }
   };

   // Cancel Auto-pay / Scheduled Bill from database
   const handleCancelSchedule = async (billId) => {
      if (!window.confirm("Are you sure you want to cancel this scheduled payment?")) return;
      try {
         const { error } = await supabase
            .from('bills')
            .delete()
            .eq('id', billId);

         if (error) throw error;

         const updatedData = await bankingService.getDashboardData();
         setBankingData(updatedData);
      } catch (err) {
         console.error("Failed to delete bill schedule:", err);
      }
   };

   // Open Edit Schedule Panel
   const openEditSchedule = (bill) => {
      setEditingScheduleData(bill);
      setEditAmount(bill.amount);
      setEditDueDate(bill.due_date);
      setEditProvider(bill.provider_name);
      setIsEditingSchedule(true);
   };

   // Update Schedule in database
   const handleUpdateSchedule = async (e) => {
      e.preventDefault();
      setEditLoading(true);
      try {
         const { error } = await supabase
            .from('bills')
            .update({
               amount: parseFloat(editAmount),
               due_date: editDueDate,
               provider_name: editProvider
            })
            .eq('id', editingScheduleData.id);

         if (error) throw error;

         setIsEditingSchedule(false);
         const updatedData = await bankingService.getDashboardData();
         setBankingData(updatedData);
      } catch (err) {
         console.error("Failed to update schedule:", err);
      } finally {
         setEditLoading(false);
      }
   };

   // Normalize transactions
   const recentPayments = recentTransactions.length > 0 ? recentTransactions.map(tx => {
      const isCredit = tx.receiver_id === user?.id;
      return {
         id: tx.id,
         name: tx.note || tx.sender_upi || tx.receiver_upi || 'Finova Transfer',
         amount: tx.amount,
         date: new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
         type: tx.payment_type || 'UPI',
         avatar: (tx.note || 'TX').substring(0, 2).toUpperCase(),
         status: tx.status === 'completed' ? 'Success' : tx.status === 'pending' ? 'Pending' : 'Failed',
         isCredit
      };
   }) : [];

   // Filtered Transactions
   const filteredPayments = recentPayments.filter(pmt => {
      if (txFilter === 'CREDITS') return pmt.isCredit;
      if (txFilter === 'DEBITS') return !pmt.isCredit;
      return true;
   });

   const favorites = platformUsers.length > 0 ? platformUsers.map(u => ({
      name: u.full_name,
      upi: u.upi_id,
      avatar: (u.full_name || 'U').substring(0, 2).toUpperCase(),
      color: 'bg-[#6366F1]'
   })) : (beneficiaries.length > 0 ? beneficiaries.map(b => ({
      name: b.beneficiary_name,
      upi: b.upi_id,
      avatar: (b.beneficiary_name || 'U').substring(0, 2).toUpperCase(),
      color: 'bg-[#6366F1]'
   })) : []);

   const scheduled = bills.map((bill) => ({
      id: bill.id,
      name: bill.provider_name,
      date: bill.due_date ? new Date(bill.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Due soon',
      due_date: bill.due_date,
      amount: Number(bill.amount || 0),
      status: bill.status || 'pending',
      icon: Receipt
   }));

   const getStatusChip = (status) => {
      switch (status) {
         case 'Success': return <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 bg-emerald-50/50 px-2 py-0.5 rounded-full"><CheckCircle2 size={9} /> SUCCESS</span>;
         case 'Pending': return <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 bg-amber-50/50 px-2 py-0.5 rounded-full"><Clock size={9} /> PENDING</span>;
         case 'Failed': return <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 bg-rose-50/50 px-2 py-0.5 rounded-full"><AlertCircle size={9} /> FAILED</span>;
         default: return null;
      }
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC]">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-6 space-y-8 animate-fadeIn relative">

            {/* Floating QR Quick Scanner for Mobile */}
            <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={openScanner}
               className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white"
            >
               <ScanIcon size={24} />
            </motion.button>

            {/* TOP NAVIGATION / BRAND BAR */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">Payments Hub</h1>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                     <ShieldCheck size={12} className="text-emerald-500" /> AES-256 SECURED ENVIRONMENT
                  </div>
               </div>

               {/* Unified Glassmorphic Search Bar */}
               <div className="flex-1 max-w-xl flex flex-col relative">
                  <div className="relative group">
                     <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-indigo-600 animate-pulse' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={16} />
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contact, UPI ID, vehicle or utility operator..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-xs font-bold outline-none transition-all shadow-sm"
                     />
                     {searchQuery && (
                       <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                         <X size={14} />
                       </button>
                     )}
                  </div>

                  {/* Search Results Dropdown Overlay */}
                  <AnimatePresence>
                     {searchResults && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto no-scrollbar"
                        >
                           <div className="p-5 space-y-4">
                              {/* Registered Contacts Section */}
                              {searchResults.contacts && searchResults.contacts.length > 0 && (
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Registered Contacts</p>
                                    <div className="space-y-1">
                                       {searchResults.contacts.map((c, i) => (
                                          <button
                                             key={i}
                                             onClick={() => {
                                                setSelectedRecipient({ upi: c.upi_id, name: c.name });
                                                setActiveFlow('To Mobile / UPI');
                                                setSearchQuery('');
                                             }}
                                             className="w-full flex items-center justify-between p-2.5 hover:bg-indigo-50/50 hover:shadow-sm rounded-xl transition-all text-left group"
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-xl text-[10px] flex items-center justify-center font-black uppercase shadow-inner">
                                                   {c.avatar}
                                                </div>
                                                <div>
                                                   <div className="flex items-center gap-1.5">
                                                      <p className="text-xs font-black text-slate-950 leading-none">{c.name}</p>
                                                      {c.is_verified && <ShieldCheck size={11} className="text-indigo-600 fill-indigo-50" />}
                                                   </div>
                                                   <div className="flex items-center gap-2 mt-1">
                                                      <span className="text-[9px] font-bold text-slate-450 leading-none">{c.upi_id}</span>
                                                      {c.phone_number && (
                                                         <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md leading-none">
                                                            {c.phone_number}
                                                         </span>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                             <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 shrink-0">Pay Now <ChevronRight size={10} /></span>
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {/* Global Directory Discovery Section */}
                              {((searchResults.global && searchResults.global.length > 0) || searchResults.isLoadingGlobal) && (
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Global Directory Discovery</p>
                                    <div className="space-y-1">
                                       {searchResults.global && searchResults.global.map((gu, i) => (
                                          <button
                                             key={i}
                                             onClick={() => {
                                                setSelectedRecipient({ upi: gu.upi_id, name: gu.full_name });
                                                setActiveFlow('To Mobile / UPI');
                                                setSearchQuery('');
                                             }}
                                             className="w-full flex items-center justify-between p-2.5 hover:bg-indigo-50/50 hover:shadow-sm rounded-xl transition-all text-left group"
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-900 text-slate-50 rounded-xl text-[10px] flex items-center justify-center font-black uppercase shadow-inner">
                                                   {gu.avatar}
                                                </div>
                                                <div>
                                                   <div className="flex items-center gap-1.5">
                                                      <p className="text-xs font-black text-slate-950 leading-none">{gu.full_name}</p>
                                                      {gu.is_verified && <ShieldCheck size={11} className="text-indigo-600 fill-indigo-50" />}
                                                   </div>
                                                   <div className="flex items-center gap-2 mt-1">
                                                      <span className="text-[9px] font-bold text-slate-450 leading-none">{gu.upi_id}</span>
                                                      {gu.phone_number && (
                                                         <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md leading-none">
                                                            {gu.phone_number}
                                                         </span>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                             <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 shrink-0">Pay Now <ChevronRight size={10} /></span>
                                          </button>
                                       ))}

                                       {/* Global Loading Skeletons */}
                                       {searchResults.isLoadingGlobal && (
                                          <div className="space-y-1.5">
                                             {[1, 2].map((n) => (
                                                <div key={n} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/40 animate-pulse">
                                                   <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
                                                      <div className="space-y-2">
                                                         <div className="w-24 h-2.5 bg-slate-200 rounded"></div>
                                                         <div className="w-36 h-2 bg-slate-150 rounded"></div>
                                                      </div>
                                                   </div>
                                                   <div className="w-10 h-3 bg-slate-200 rounded-md"></div>
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )}

                              {/* Actions & Billers Section */}
                              {searchResults.services && searchResults.services.length > 0 && (
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Actions & Billers</p>
                                    <div className="space-y-1">
                                       {searchResults.services.map((s, i) => (
                                          <button key={i} onClick={() => { setActiveFlow(s.label); setSearchQuery(''); }} className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                                             <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${s.color || 'bg-slate-100 text-slate-700'} rounded-xl flex items-center justify-center`}><s.icon size={14} /></div>
                                                <span className="text-xs font-bold text-slate-900">{s.label}</span>
                                             </div>
                                             <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 shrink-0">Open <ChevronRight size={10} /></span>
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {/* Fallback Empty State UI */}
                              {(!searchResults.contacts || searchResults.contacts.length === 0) &&
                               (!searchResults.global || searchResults.global.length === 0) &&
                               (!searchResults.services || searchResults.services.length === 0) &&
                               !searchResults.isLoadingGlobal && (
                                 <div className="p-8 text-center space-y-3">
                                    <AlertCircle className="mx-auto text-slate-350" size={32} />
                                    <div className="space-y-1">
                                       <p className="text-xs font-black text-slate-900 leading-none">No Results Found</p>
                                       <p className="text-[10px] font-bold text-slate-400 mt-1">We couldn't find any users or utilities matching "{searchQuery}"</p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {/* Desktop UPI Identifier Details */}
               <div className="hidden lg:flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="w-8 h-8 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-[9px] tracking-tight">VPA</div>
                  <div>
                     <p className="text-xs font-black text-slate-900 leading-none">{activeAccount?.upi_id || 'calculating VPA...'}</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1.5">Primary UPI Address</p>
                  </div>
                  <button onClick={openScanner} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline ml-2 flex items-center gap-1">Scan QR <QrCode size={10} /></button>
               </div>
            </div>

            {/* MAIN TWO-COLUMN DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

               {/* LEFT DIVISION: Core payments modules */}
               <div className="lg:col-span-8 space-y-8">

                  {/* SEND MONEY ACTION GRID */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm space-y-6">
                     <div className="flex justify-between items-center px-1">
                        <div className="space-y-1">
                           <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none">Money Movement</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Instant secure transfers</p>
                        </div>
                        <button 
                          onClick={() => setIsAddingBeneficiary(true)}
                          className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                        >
                           <PlusCircle size={12} /> Add Beneficiary
                        </button>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {primaryActions.map((action, i) => (
                           <motion.button
                              key={i}
                              whileHover={{ y: -4, boxShadow: '0 12px 20px -8px rgba(99, 102, 241, 0.15)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                 if (action.label.includes('Scan')) openScanner();
                                 else setActiveFlow(action.label);
                              }}
                              className="relative p-5 bg-[#F8FAFC]/60 border border-slate-100 rounded-3xl transition-all flex flex-col items-start gap-4 group overflow-hidden"
                           >
                              <div className={`w-10 h-10 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg relative z-10 shrink-0`}>
                                 <action.icon size={18} />
                              </div>
                              <div className="text-left relative z-10">
                                 <span className="text-xs font-black text-slate-950 uppercase tracking-wider block">{action.label}</span>
                                 <span className="text-[9px] font-semibold text-slate-400 leading-tight mt-1 block opacity-85 group-hover:opacity-100 transition-opacity">{action.desc}</span>
                              </div>
                              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                           </motion.button>
                        ))}
                     </div>
                  </div>

                  {/* RECENT CONTACTS CAROUSEL */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm space-y-6">
                     <div className="flex justify-between items-center px-1">
                        <div className="space-y-1">
                           <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none font-bold">Recent Payees</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tap to quick transfer</p>
                        </div>
                        <div className="flex bg-slate-50 p-0.5 rounded-xl border border-slate-100">
                           <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[9px] font-black text-slate-950 uppercase tracking-widest">All Contacts</button>
                        </div>
                     </div>

                     <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1">
                        {/* Add Beneficiary CTA Button Card */}
                        <div 
                           onClick={() => setIsAddingBeneficiary(true)}
                           className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer"
                        >
                           <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-all bg-white shadow-sm">
                              <Plus size={20} />
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">New Payee</span>
                        </div>

                        {favorites.map((fav, i) => (
                           <div 
                              key={i} 
                              onClick={() => {
                                 setActiveFlow('To Mobile / UPI');
                                 setSelectedRecipient({ upi_id: fav.upi, full_name: fav.name });
                              }}
                              className="cursor-pointer"
                           >
                              <ContactAvatar name={fav.name} avatar={fav.avatar} color={fav.color} />
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {/* SERVICES AND BILLERS GRID */}
                     <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm space-y-6">
                        <div className="space-y-1 px-1">
                           <h3 className="font-black text-slate-900 text-base tracking-tight leading-none font-bold">Utility Hub</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pay bills & instant recharges</p>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                           {secondaryActions.map((item, i) => (
                              <motion.button
                                 key={i}
                                 whileHover={{ scale: 1.05, y: -2 }}
                                 onClick={() => setActiveFlow(item.label)}
                                 className="flex flex-col items-center gap-2 group cursor-pointer"
                              >
                                 <div className={`w-11 h-11 ${item.color} border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white`}>
                                    <item.icon size={16} />
                                 </div>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center leading-none truncate w-full group-hover:text-slate-900">{item.label.split(' ')[0]}</span>
                              </motion.button>
                           ))}
                        </div>
                     </div>

                     {/* HIGH CONTRAST BILL REMINDER BOX */}
                     <div className="bg-gradient-to-tr from-amber-50/50 to-orange-50/20 border border-amber-100 p-6 sm:p-8 rounded-[2.5rem] flex gap-5 items-start group shadow-sm transition-all relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                           <Bell size={18} />
                        </div>
                        <div className="space-y-2 flex-1 relative z-10">
                           <div className="flex justify-between items-center">
                              <h4 className="text-[9px] font-black text-amber-900 uppercase tracking-widest leading-none">Auto-Pay Advisory</h4>
                           </div>
                           <p className="text-xs text-amber-800 font-bold leading-relaxed">Your monthly Broadband bill is upcoming soon. Pay now to avoid disruptions.</p>
                           <button 
                             onClick={() => setActiveFlow('Broadband')}
                             className="text-[9px] font-black text-amber-950 uppercase tracking-[0.15em] hover:underline flex items-center gap-1 pt-1.5"
                           >
                             Clear Bill Now <ArrowRight size={10} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* TRANSACTION LOG HISTORY */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm overflow-hidden">
                     <div className="px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
                        <div className="space-y-0.5">
                           <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider font-bold">Transaction Ledgers</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time ledger entries</p>
                        </div>
                        
                        {/* Credit/Debit Toggle Tabs */}
                        <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/50">
                           {['ALL', 'DEBITS', 'CREDITS'].map((filter) => (
                              <button
                                 key={filter}
                                 onClick={() => setTxFilter(filter)}
                                 className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    txFilter === filter 
                                       ? 'bg-white text-slate-950 shadow-sm' 
                                       : 'text-slate-400 hover:text-slate-600'
                                 }`}
                              >
                                 {filter}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="divide-y divide-slate-50 max-h-[450px] overflow-y-auto no-scrollbar">
                        {filteredPayments.length > 0 ? filteredPayments.map((pmt) => (
                           <div key={pmt.id} className="flex items-center justify-between px-8 py-4.5 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-4.5 flex-1 min-w-0">
                                 <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 text-white shadow-sm ${pmt.isCredit ? 'bg-emerald-600' : 'bg-slate-950'}`}>
                                    {pmt.avatar}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="font-black text-slate-950 text-sm leading-tight truncate">{pmt.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-none">{pmt.type} • {pmt.date}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className={`font-black text-sm leading-tight ${pmt.isCredit ? 'text-emerald-600' : 'text-slate-950'}`}>
                                    {pmt.isCredit ? '+' : '-'}₹{Math.abs(pmt.amount).toLocaleString('en-IN')}
                                 </p>
                                 <div className="mt-1.5 flex justify-end">
                                    {getStatusChip(pmt.status)}
                                 </div>
                              </div>
                           </div>
                        )) : (
                           <div className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching ledger entries</div>
                        )}
                     </div>
                  </div>
               </div>

               {/* RIGHT DIVISION: Credit Cards, Schedules & security */}
               <div className="lg:col-span-4 space-y-8">

                  {/* HIGH END GLASSMORPHIC CARD */}
                  <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100/50">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                     <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                           <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/5 shadow-inner">
                              <CreditCard size={22} className="text-indigo-400" />
                           </div>
                           <div className="text-right">
                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-1">Virtual Proxy Card</span>
                              <span className="text-xs font-black text-white tracking-widest block">•••• {cards[0]?.card_number?.slice(-4) || '7729'}</span>
                           </div>
                        </div>

                        <div className="space-y-1 pt-2">
                           <h4 className="text-sm font-black tracking-tight leading-none">Finova Security Proxy</h4>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Single-use secure credentialing</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 pt-2">
                           <button 
                             onClick={() => alert(`Virtual Card Details:\nNumber: ${cards[0]?.card_number || '4532 9901 8829 7729'}\nCVV: ***\nExpiry: **/**`)}
                             className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/5 cursor-pointer"
                           >
                             View Details
                           </button>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(cards[0]?.card_number || '4532990188297729');
                               alert("Card Number copied to clipboard!");
                             }}
                             className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-950/20 cursor-pointer"
                           >
                             Copy Card
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* INTERACTIVE SCHEDULED AUTO-PAY MODULE */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm space-y-6">
                     <div className="flex justify-between items-center px-1">
                        <div className="space-y-0.5">
                           <h3 className="font-black text-slate-900 text-base tracking-tight leading-none font-bold">Auto Pay</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scheduled reminders</p>
                        </div>
                        <button 
                          onClick={() => setActiveFlow('Schedule')}
                          className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                          Add Plan
                        </button>
                     </div>

                     <div className="space-y-3">
                        {scheduled.length > 0 ? scheduled.map((item, i) => (
                           <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-200 transition-all">
                              <div className="flex items-center gap-3.5 min-w-0">
                                 <div className="p-2 bg-white rounded-xl text-slate-400 shadow-inner group-hover:text-indigo-600 shrink-0">
                                    <item.icon size={14} />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="font-black text-slate-950 text-xs leading-none truncate">{item.name}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 leading-none">Due: {item.date}</p>
                                 </div>
                              </div>
                              
                              <div className="text-right flex items-center gap-3">
                                 <p className="font-black text-slate-950 text-xs">₹{item.amount.toLocaleString('en-IN')}</p>
                                 
                                 {/* Custom Actions */}
                                 <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => {
                                        setActiveFlow(item.name);
                                        setSelectedRecipient({ name: item.name, am: item.amount });
                                      }}
                                      className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors"
                                      title="Pay Now"
                                    >
                                       <Check size={12} />
                                    </button>
                                    <button 
                                      onClick={() => openEditSchedule(item)}
                                      className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
                                      title="Edit Schedule"
                                    >
                                       <Edit size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleCancelSchedule(item.id)}
                                      className="p-1 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"
                                      title="Delete Auto-Pay"
                                    >
                                       <Trash2 size={12} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )) : (
                           <p className="text-center text-[9px] font-black text-slate-300 uppercase py-6">No scheduled plans found</p>
                        )}
                     </div>

                     <button
                        onClick={() => setActiveFlow('Schedule')}
                        className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                     >
                        <Calendar size={14} /> Schedule New Bill
                     </button>
                  </div>

                  {/* SECURITY STAT CHIP */}
                  <div className="bg-emerald-50/20 border border-emerald-100 p-6 sm:p-7 rounded-[2.5rem] space-y-3.5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                           <ShieldCheck size={16} />
                        </div>
                        <h4 className="text-[9px] font-black text-emerald-950 uppercase tracking-widest leading-none">Security Limit Certified</h4>
                     </div>
                     <p className="text-xs text-emerald-800 font-bold leading-relaxed">Daily payment threshold is enforced at ₹50,000 for added defense.</p>
                     <button onClick={() => alert("Daily Limit Settings are secured via default bank parameters.")} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline block leading-none">Adjust Threshold</button>
                  </div>

               </div>
            </div>
         </div>

         {/* ──────────────────────────── MODALS & OVERLAYS ──────────────────────────── */}
         
         {/* 1. SECURE ADD BENEFICIARY MODAL */}
         <AnimatePresence>
            {isAddingBeneficiary && (
               <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsAddingBeneficiary(false)}
                     className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 30 }}
                     className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                  >
                     <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <div>
                           <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Add Beneficiary</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register new recipient</p>
                        </div>
                        <button onClick={() => setIsAddingBeneficiary(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                           <X size={16} />
                        </button>
                     </div>

                     <form onSubmit={handleAddBeneficiary} className="p-8 space-y-4">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                           <input
                              required
                              placeholder="e.g. Preetham Bharadwaj"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              value={newBeneName}
                              onChange={(e) => setNewBeneName(e.target.value)}
                           />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">UPI ID (VPA)</label>
                           <input
                              required
                              placeholder="e.g. user@finova"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              value={newBeneUpi}
                              onChange={(e) => setNewBeneUpi(e.target.value)}
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Account No (Opt)</label>
                              <input
                                 placeholder="e.g. 1099283478"
                                 className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                 value={newBeneAcc}
                                 onChange={(e) => setNewBeneAcc(e.target.value)}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">IFSC Code (Opt)</label>
                              <input
                                 placeholder="e.g. FNVA0001923"
                                 className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all uppercase"
                                 value={newBeneIfsc}
                                 onChange={(e) => setNewBeneIfsc(e.target.value)}
                              />
                           </div>
                        </div>

                        <button
                           type="submit"
                           disabled={beneLoading || !newBeneName || !newBeneUpi}
                           className="w-full py-4.5 bg-slate-950 text-white hover:bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50 mt-4"
                        >
                           {beneLoading ? <RefreshCcw className="animate-spin mx-auto" size={16} /> : 'Register Beneficiary'}
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* 2. SECURE EDIT SCHEDULE AUTO-PAY MODAL */}
         <AnimatePresence>
            {isEditingSchedule && (
               <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsEditingSchedule(false)}
                     className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 30 }}
                     className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                  >
                     <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <div>
                           <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none font-bold">Edit Auto-Pay</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Modify schedule parameters</p>
                        </div>
                        <button onClick={() => setIsEditingSchedule(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                           <X size={16} />
                        </button>
                     </div>

                     <form onSubmit={handleUpdateSchedule} className="p-8 space-y-4">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Provider Name</label>
                           <input
                              required
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              value={editProvider}
                              onChange={(e) => setEditProvider(e.target.value)}
                           />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Scheduled Amount</label>
                           <input
                              required
                              type="number"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                           />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Scheduled Date</label>
                           <input
                              required
                              type="date"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                           />
                        </div>

                        <button
                           type="submit"
                           disabled={editLoading || !editAmount || !editDueDate}
                           className="w-full py-4.5 bg-slate-950 text-white hover:bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50 mt-4"
                        >
                           {editLoading ? <RefreshCcw className="animate-spin mx-auto" size={16} /> : 'Save Schedule'}
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* 3. QR CODE PAYMENT DRAWER / OVERLAY */}
         <AnimatePresence>
            {scanPayment && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setScanPayment(null)}
                     className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 50 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 50 }}
                     className="relative w-full h-full lg:h-auto lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                  >
                     {showSuccess ? (
                        <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                           <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200"
                           >
                              <CheckCircle2 size={40} />
                           </motion.div>
                           
                           <div className="space-y-2">
                              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Payment Successful</h2>
                              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Transaction ID: {txReference || 'VRX982103'}</p>
                           </div>

                           <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl w-full text-left space-y-4">
                              <div>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Paid To</span>
                                 <p className="text-sm font-black text-slate-950 leading-none">{scanPayment.pn}</p>
                              </div>
                              <div className="h-px bg-slate-200/50"></div>
                              <div>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Amount Debited</span>
                                 <p className="text-2xl font-black text-primary-600 leading-none">₹{parseFloat(amount || 0).toLocaleString('en-IN')}</p>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <>
                           <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                    {(scanPayment.pn || 'QR').substring(0, 2).toUpperCase()}
                                 </div>
                                 <div>
                                    <h2 className="text-base font-black text-slate-950 leading-none truncate max-w-[200px]">{scanPayment.pn}</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{scanPayment.pa}</p>
                                 </div>
                              </div>
                              <button onClick={() => setScanPayment(null)} className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                 <X size={16} />
                              </button>
                           </div>

                           {localError && (
                             <div className="mx-8 mt-4 p-4.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                               <AlertCircle size={16} className="text-rose-500 shrink-0" />
                               <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight">{localError}</p>
                             </div>
                           )}

                           <form onSubmit={handlePaymentSubmit} className="p-8 space-y-6">
                              {paymentStep === 1 ? (
                                 <>
                                    <div className="space-y-3">
                                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Amount to Transfer</label>
                                       <div className="relative">
                                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
                                          <input
                                             required
                                             type="number"
                                             value={amount}
                                             onChange={(e) => setAmount(e.target.value)}
                                             placeholder="0.00"
                                             className="w-full pl-14 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-950 outline-none transition-all placeholder:text-slate-200"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Note (Optional)</label>
                                       <input
                                          type="text"
                                          value={note}
                                          onChange={(e) => setNote(e.target.value)}
                                          placeholder="e.g. Lunch split, shopping..."
                                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-950 outline-none focus:bg-white transition-all"
                                       />
                                    </div>
                                 </>
                              ) : (
                                 <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                       <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto">
                                          <ShieldCheck size={24} />
                                       </div>
                                       <h4 className="text-base font-black text-slate-900 tracking-tight leading-none">Verification PIN</h4>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Verify to execute transaction</p>
                                    </div>
                                    
                                    <div className="flex justify-center gap-3">
                                       <input
                                          required
                                          type="password"
                                          maxLength="6"
                                          value={upiPin}
                                          onChange={(e) => setUpiPin(e.target.value)}
                                          placeholder="••••••"
                                          autoFocus
                                          className="w-48 text-center py-5 bg-slate-50 border-2 border-slate-100 focus:border-primary-500/20 focus:bg-white rounded-2xl text-3xl font-black tracking-[0.5em] outline-none transition-all"
                                       />
                                    </div>
                                    
                                    <button
                                       type="button"
                                       onClick={() => setPaymentStep(1)}
                                       className="w-full text-[9px] font-black text-indigo-600 uppercase tracking-widest text-center hover:underline"
                                    >
                                       Back to details
                                    </button>
                                 </div>
                              )}

                              <div className="p-4.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center gap-3.5">
                                 <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                                 <div>
                                    <p className="text-[9px] font-black text-indigo-950 uppercase tracking-widest leading-none mb-1">Finova Shield Active</p>
                                    <p className="text-[10px] text-indigo-700 font-bold opacity-80 leading-normal">This transmission is completely locked and encrypted.</p>
                                 </div>
                              </div>

                              <button
                                 disabled={isProcessing || !amount}
                                 className="w-full py-5 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                 {isProcessing ? (
                                    <>
                                       <RefreshCcw size={14} className="animate-spin animate-infinite" /> Authorizing...
                                    </>
                                 ) : (
                                    <>
                                       {paymentStep === 1 ? 'Continue' : `Pay ₹${parseFloat(amount || 0).toLocaleString('en-IN')} Securely`}
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

         {/* Unified Payment Flow drawer/modal */}
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
