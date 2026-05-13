import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Plus,
   Lock,
   Settings,
   Eye,
   EyeOff,
   ShieldCheck,
   Smartphone,
   Globe,
   CreditCard,
   ArrowRight,
   TrendingUp,
   Zap,
   MoreHorizontal,
   History,
   Key,
   RotateCcw,
   Sliders,
   ShoppingBag,
   BadgePercent,
   Calculator,
   Gift,
   Plane,
   ChevronRight,
   Sparkles,
   Info,
   Clock
} from 'lucide-react';
import CardModals from '../components/CardModals';
import useStore from '../store/useStore';
import { cardService } from '../services/cardService';

const Cards = () => {
   const [activeCardIndex, setActiveCardIndex] = useState(0);
   const [isRevealed, setIsRevealed] = useState(false);
   const [modalState, setModalState] = useState({ isOpen: false, type: '', card: null });
   const { cards, isLoading, recentTransactions } = useStore();

   const displayCards = cards.length > 0 ? cards.map(c => ({
      id: c.id,
      type: c.card_type === 'credit' ? 'Premium Credit' : 'Virtual Debit',
      number: c.card_number || c.masked_card_number || '•••• •••• •••• 0000',
      expiry: c.expiry_date,
      cvv: c.cvv || '***',
      name: c.card_holder_name,
      status: c.status,
      gradient: c.card_type === 'credit' ? 'from-slate-900 to-slate-800' : 'from-primary-600 to-indigo-700',
      brand: c.network || 'Visa',
      limit: c.transaction_limit || c.online_limit || 0,
      spent: 0,
      rewardPoints: c.reward_points || 0
   })) : [];

   const eligibleEmiTransactions = recentTransactions
      .filter((tx) => tx.type === 'expense' && Math.abs(Number(tx.amount || 0)) >= 5000)
      .slice(0, 2)
      .map((tx) => ({
         name: tx.description,
         date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '',
         amount: Math.abs(Number(tx.amount || 0)),
         emiOption: `INR ${Math.round(Math.abs(Number(tx.amount || 0)) / 12).toLocaleString()} x 12 months`
      }));

   const cardActions = [
      { icon: Key, label: 'Change PIN', type: 'Change PIN' },
      { icon: Lock, label: 'Freeze Card', type: 'Freeze Card' },
      { icon: RotateCcw, label: 'Replace Card', type: 'Replace Card' },
      { icon: Plane, label: 'Travel Mode', type: 'Travel Mode' },
      { icon: Sliders, label: 'Manage Limits', type: 'Manage Limits' },
   ];

   const [settings, setSettings] = useState({
      international: true,
      online: true,
      contactless: false,
      atm: true
   });

   const toggleSetting = (key) => {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const currentCard = displayCards[activeCardIndex] || {
      id: 'empty',
      type: 'No Active Card',
      number: '•••• •••• •••• 0000',
      expiry: '--/--',
      cvv: '***',
      name: 'Awaiting Provisioning',
      status: 'Pending',
      gradient: 'from-slate-900 to-slate-800',
      brand: 'Vertex',
      limit: 0,
      spent: 0,
      rewardPoints: 0
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC]">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-8 animate-fadeIn">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="space-y-1">
                  <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Credit & Card Intelligence</h1>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                     <ShieldCheck size={14} className="text-emerald-500" /> PCI DSS Certified Platform • Finova Secure
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                     <CreditCard size={16} /> Manage All
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all">
                     <Plus size={16} /> New Virtual Card
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

               {/* Left: Card Engine & Controls (7 cols) */}
               <div className="lg:col-span-7 space-y-10">

                  {/* Card Carousel / Preview */}
                  <div className="space-y-8">
                     <div className="flex justify-between items-center px-1">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Active Cards</h3>
                        <div className="flex gap-1.5">
                           {displayCards.map((_, i) => (
                              <button
                                 key={i}
                                 onClick={() => setActiveCardIndex(i)}
                                 className={`h-1.5 rounded-full transition-all duration-500 ${activeCardIndex === i ? 'w-10 bg-primary-600' : 'w-2 bg-slate-200'}`}
                              />
                           ))}
                        </div>
                     </div>

                     {/* Premium Card Display */}
                     <div className="relative group perspective">
                        <AnimatePresence mode="wait">
                           <motion.div
                              key={currentCard.id}
                              initial={{ opacity: 0, rotateY: -10, x: -20 }}
                              animate={{ opacity: 1, rotateY: 0, x: 0 }}
                              exit={{ opacity: 0, rotateY: 10, x: 20 }}
                              className={`aspect-[1.58/1] w-full max-w-md mx-auto bg-gradient-to-br ${currentCard.gradient} rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden`}
                           >
                              {/* Card Background Patterns */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/10 rounded-full translate-y-12 -translate-x-12 blur-3xl"></div>

                              <div className="relative z-10 h-full flex flex-col justify-between">
                                 <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                       <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 w-fit">
                                          {currentCard.type}
                                       </div>
                                       <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">{currentCard.brand}</p>
                                    </div>
                                    <div className="w-12 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center">
                                       <div className="w-7 h-5 bg-amber-500/30 rounded-sm"></div>
                                    </div>
                                 </div>

                                 <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                       <AnimatePresence mode="wait">
                                          <motion.p
                                             key={isRevealed}
                                             initial={{ opacity: 0 }}
                                             animate={{ opacity: 1 }}
                                             className="text-2xl lg:text-3xl font-black tracking-[0.25em] font-mono"
                                          >
                                             {isRevealed ? currentCard.number : '•••• •••• •••• ' + currentCard.number.split(' ')[3]}
                                          </motion.p>
                                       </AnimatePresence>
                                    </div>

                                    <div className="flex justify-between items-end">
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-black opacity-60 uppercase tracking-[0.2em]">Card Holder</p>
                                          <p className="text-sm font-black tracking-tight">{currentCard.name}</p>
                                       </div>
                                       <div className="flex gap-10">
                                          <div className="space-y-1">
                                             <p className="text-[9px] font-black opacity-60 uppercase tracking-[0.2em]">Expires</p>
                                             <p className="text-sm font-black tracking-tight">{currentCard.expiry}</p>
                                          </div>
                                          <div className="space-y-1">
                                             <p className="text-[9px] font-black opacity-60 uppercase tracking-[0.2em]">CVV</p>
                                             <p className="text-sm font-black tracking-tight">{isRevealed ? currentCard.cvv : '•••'}</p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        </AnimatePresence>
                     </div>

                     {/* Card Quick Actions */}
                     <div className="flex items-center justify-center gap-4 py-2">
                        <button
                           onClick={() => setIsRevealed(!isRevealed)}
                           className="flex items-center gap-2.5 px-8 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                           {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />} {isRevealed ? 'Hide Details' : 'Reveal Details'}
                        </button>
                        <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm">
                           <MoreHorizontal size={20} />
                        </button>
                     </div>
                  </div>

                  {/* Credit Services: EMI Conversion (NEW) */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8">
                     <div className="flex justify-between items-center px-2">
                        <div className="space-y-1">
                           <h3 className="font-black text-slate-900 text-sm tracking-tight leading-none">EMI Conversion Center</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Convert recent purchases to low-interest EMIs</p>
                        </div>
                        <BadgePercent size={22} className="text-primary-600" />
                     </div>
                     <div className="space-y-4">
                        {eligibleEmiTransactions.map((tx, i) => (
                           <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-primary-100 hover:bg-white transition-all group cursor-pointer">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 shadow-sm">
                                    <ShoppingBag size={20} />
                                 </div>
                                 <div>
                                    <p className="text-[13px] font-black text-slate-900 leading-none">{tx.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Spent ₹{tx.amount.toLocaleString()} • {tx.date}</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                 <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                                    {tx.emiOption}
                                 </span>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-primary-600 transition-colors">
                                    Convert Now <ChevronRight size={10} strokeWidth={3} />
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Security & Controls Grid */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8">
                     <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">Card Ecosystem Controls</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                           { id: 'international', icon: Globe, label: 'International Usage', desc: 'Overseas transactions control' },
                           { id: 'online', icon: Smartphone, label: 'E-Commerce', desc: 'Online & App payments' },
                           { id: 'contactless', icon: Zap, label: 'Tap-to-Pay', desc: 'NFC contactless payments' },
                           { id: 'atm', icon: Lock, label: 'ATM Access', desc: 'Cash withdrawal control' }
                        ].map((item) => {
                           const isActive = settings[item.id];
                           return (
                              <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] group hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                       <item.icon size={20} />
                                    </div>
                                    <div>
                                       <p className="text-[12px] font-black text-slate-900 leading-none">{item.label}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-tight">{item.desc}</p>
                                    </div>
                                 </div>
                                 <button
                                    onClick={() => toggleSetting(item.id)}
                                    className={`w-10 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${isActive ? 'bg-primary-600' : 'bg-slate-200'}`}
                                 >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isActive ? 'left-5' : 'left-1'}`} />
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* Right: Wealth & Billing Sidebar (5 cols) */}
               <div className="lg:col-span-5 space-y-10">

                  {/* Credit Card Billing & Rewards (NEW) */}
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-10 relative overflow-hidden shadow-2xl group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>

                     <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1.5">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Bill Due</p>
                              <h4 className="text-4xl font-black tracking-tighter">₹1,12,450</h4>
                              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                 <Clock size={12} strokeWidth={3} /> Due in 6 Days
                              </p>
                           </div>
                           <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-400 border border-white/10">
                              <History size={24} />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Min Amount</p>
                              <p className="text-lg font-black text-white leading-none">₹5,622</p>
                           </div>
                           <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Credit Limit</p>
                              <p className="text-lg font-black text-white leading-none">₹5,00,000</p>
                           </div>
                        </div>

                        <button
                           onClick={() => setModalState({ isOpen: true, type: 'Pay Bill', card: currentCard })}
                           className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform"
                        >
                           Pay Bill Now
                        </button>
                     </div>

                     <div className="pt-8 border-t border-white/10 space-y-6 relative z-10">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                 <Gift size={20} />
                              </div>
                              <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Finova Rewards</p>
                                 <p className="text-lg font-black text-white tracking-tight leading-none">12,450 pts</p>
                              </div>
                           </div>
                           <ChevronRight size={18} className="text-slate-600" />
                        </div>
                        <div className="flex items-center gap-2.5">
                           <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 w-3/4 rounded-full" />
                           </div>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Redeem at 15k</span>
                        </div>
                     </div>
                  </div>

                  {/* Card Management Sidebar */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8">
                     <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">Management Center</h3>
                     <div className="space-y-1">
                        {cardActions.map((action, i) => (
                           <button
                              key={i}
                              onClick={() => setModalState({ isOpen: true, type: action.type, card: currentCard })}
                              className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50 rounded-2xl transition-all group"
                           >
                              <div className="flex items-center gap-4 text-slate-600 group-hover:text-primary-600 transition-colors">
                                 <action.icon size={18} strokeWidth={2.5} />
                                 <span className="text-[11px] font-black uppercase tracking-widest">{action.label}</span>
                              </div>
                              <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Wealth Tip: FD-Backed Credit (NEW) */}
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                           <Sparkles size={20} />
                        </div>
                        <h3 className="font-black text-indigo-900 uppercase tracking-widest text-[10px]">Wealth Booster</h3>
                     </div>
                     <p className="text-[12px] text-indigo-700 font-bold leading-relaxed">
                        Improve your credit limit instantly! Back your credit card with a Fixed Deposit to enjoy 100% limit and 7.5% p.a interest.
                     </p>
                     <button className="w-full py-4 bg-white border border-indigo-200 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all shadow-sm">Explore FD-Backing</button>
                  </div>

               </div>
            </div>
         </div>

         <CardModals
            isOpen={modalState.isOpen}
            onClose={() => setModalState({ ...modalState, isOpen: false })}
            type={modalState.type}
            card={modalState.card}
         />
      </div>
   );
};

export default Cards;
