import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
   Zap,
   Send,
   QrCode,
   Receipt,
   CreditCard,
   TrendingUp,
   ShieldCheck,
   Plus,
   ArrowRight,
   LayoutDashboard,
   Search,
   Wallet,
   PiggyBank,
   BadgePercent,
   History,
   LineChart,
   Activity,
   ArrowUpRight,
   ArrowDownRight,
   Calendar,
   Lock,
   ChevronRight
} from 'lucide-react';

import QuickAction from '../components/QuickAction';
import InsightCard from '../components/InsightCard';
import ContactAvatar from '../components/ContactAvatar';
import BalanceCard from '../components/BalanceCard';
import TransferFlow from '../components/TransferFlow';
import { useState } from 'react';

import useStore from '../store/useStore';

const Dashboard = () => {
   const navigate = useNavigate();
   const [isTransferOpen, setIsTransferOpen] = useState(false);
   const { balance, recentTransactions, user, isLoading, activeAccount, fixedDeposits, loans, analytics, platformUsers } = useStore();


   const transactions = recentTransactions.length > 0 ? recentTransactions.map(tx => ({
      id: tx.id,
      name: tx.description,
      category: tx.category,
      date: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: tx.amount,
      type: tx.type,
      avatar: (tx.description || 'TX').substring(0, 2).toUpperCase(),
      color: tx.type === 'income' ? 'bg-emerald-500' : 'bg-slate-900',
      status: tx.status
   })) : [];

   const fdTotal = fixedDeposits.reduce((sum, item) => sum + Number(item.principal_amount || 0), 0);
   const loanTotal = loans.reduce((sum, item) => sum + Number(item.outstanding_amount || 0), 0);
   const nextLoan = loans[0];

   const ecosystemProducts = [
      {
         id: 'fd',
         title: 'Fixed Deposits',
         value: `INR ${fdTotal.toLocaleString()}`,
         detail: fixedDeposits[0]?.maturity_date ? `Maturity: ${new Date(fixedDeposits[0].maturity_date).toLocaleDateString()}` : 'No active deposits',
         trend: `${fixedDeposits.length} Active`,
         icon: <Lock size={20} />,
         color: 'text-indigo-600',
         bg: 'bg-indigo-50'
      },
      {
         id: 'loan',
         title: 'Active Loans',
         value: `INR ${loanTotal.toLocaleString()}`,
         detail: nextLoan ? `EMI: INR ${Number(nextLoan.emi_amount || 0).toLocaleString()} due ${nextLoan.next_emi_date ? new Date(nextLoan.next_emi_date).toLocaleDateString() : 'soon'}` : 'No active loans',
         trend: `${loans.length} Active`,
         icon: <Wallet size={20} />,
         color: 'text-rose-600',
         bg: 'bg-rose-50'
      },
      {
         id: 'credit',
         title: 'Credit Score',
         value: 'Pending',
         detail: user?.kyc_status === 'verified' ? 'Profile verified' : 'KYC pending',
         trend: user?.kyc_status || 'Pending',
         icon: <ShieldCheck size={20} />,
         color: 'text-emerald-600',
         bg: 'bg-emerald-50'
      }
   ];

   if (isLoading && !balance) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Loading Ecosystem...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#F8FAFC]">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-8 space-y-10 animate-fadeIn">

            {/* 1. Premium Header (Greeting & Context) */}
            <div className="flex items-center justify-between px-1">
               <div className="space-y-1.5">
                  <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                     {(() => {
                        const hour = new Date().getHours();
                        const firstName = user?.full_name?.split(' ')[0] || 'Alex';
                        if (hour < 12) return `Good morning, ${firstName}`;
                        if (hour < 17) return `Good afternoon, ${firstName}`;
                        return `Good evening, ${firstName}`;
                     })()}
                  </h1>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                     Here’s your financial overview
                  </p>
               </div>
            </div>

            {/* 2. Hero Balance Section (Primary Focus) */}
            <div className="lg:max-w-4xl">
               <BalanceCard
                  balance={balance}
                  growth="+12.4%"
                  accountType={`${activeAccount?.account_type || 'Savings'} - ${activeAccount?.account_number?.slice(-4) || 'New'}`}
                  onTransferClick={() => setIsTransferOpen(true)}
               />
            </div>

            {/* 3. Banking Ecosystem Highlights (NEW) */}
            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Banking Ecosystem</h3>
                  <button onClick={() => navigate('/app/analytics')} className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Explore Products</button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ecosystemProducts.map((product) => (
                     <motion.div
                        key={product.id}
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm group cursor-pointer hover:border-primary-100 transition-all flex flex-col justify-between h-40"
                     >
                        <div className="flex justify-between items-start">
                           <div className={`w-10 h-10 ${product.bg} ${product.color} rounded-xl flex items-center justify-center`}>
                              {product.icon}
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${product.color} bg-white px-2 py-1 rounded-md border border-slate-100`}>
                              {product.trend}
                           </span>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{product.title}</p>
                           <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{product.value}</h4>
                           <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                              {product.detail}
                              <ChevronRight size={12} className="text-slate-300" />
                           </p>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* 3.5 Quick Pay Contacts (GPay Style) */}
            {platformUsers.length > 0 && (
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Quick Pay</h3>
                     <button onClick={() => navigate('/app/payments')} className="text-[9px] font-black text-primary-600 uppercase tracking-widest">View All</button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
                     {platformUsers.slice(0, 10).map((u) => (
                        <motion.button
                           key={u.id}
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => navigate('/app/payments', { state: { recipient: { upi_id: u.upi_id, full_name: u.full_name } } })}
                           className="flex flex-col items-center gap-2 min-w-[64px] group"
                        >
                           <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900 font-black text-lg shadow-sm group-hover:border-primary-500 group-hover:bg-primary-50 transition-all">
                              {(u.full_name || 'U').substring(0, 1).toUpperCase()}
                           </div>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate w-16 text-center">
                              {u.full_name.split(' ')[0]}
                           </span>
                        </motion.button>
                     ))}
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app/payments')}
                        className="flex flex-col items-center gap-2 min-w-[64px]"
                     >
                        <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary-400 hover:text-primary-600 transition-all bg-white">
                           <Plus size={20} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">More</span>
                     </motion.button>
                  </div>
               </div>
            )}

            {/* 4. Intelligence Hub */}
            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Intelligence Hub</h3>
               </div>


               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Compact Monthly Status */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary-100 transition-all" onClick={() => navigate('/app/analytics')}>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Monthly Spend</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{`INR ${Number(analytics?.monthlySpend || 0).toLocaleString()}`}</p>
                        <div className="w-32 h-1 bg-slate-50 rounded-full overflow-hidden mt-2">
                           <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-primary-600" />
                        </div>
                     </div>
                     <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} />
                     </div>
                  </div>

                  {/* Investments Summary */}
                  <div className="bg-slate-900 p-5 rounded-2xl shadow-xl relative overflow-hidden group cursor-pointer lg:col-span-2" onClick={() => navigate('/app/analytics')}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
                     <div className="relative z-10 flex flex-row items-center justify-between h-full">
                        <div className="space-y-4 flex-1">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Investment Portfolio</p>
                              <p className="text-2xl font-black text-white tracking-tighter">₹8,42,500</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Equity</span>
                                 <span className="text-xs font-black text-emerald-400 leading-none mt-1">+12.4%</span>
                              </div>
                              <div className="h-4 w-px bg-slate-800"></div>
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mutual Funds</span>
                                 <span className="text-xs font-black text-primary-400 leading-none mt-1">₹3.2L</span>
                              </div>
                           </div>
                        </div>
                        <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-50 transition-all shadow-xl">Manage Wealth</button>
                     </div>
                  </div>
               </div>
            </div>


            {/* 6. Smart Insight & EMI Alerts (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-amber-50/50 border border-amber-100/50 p-5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-all" onClick={() => navigate('/app/analytics')}>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-sm">
                        <Calendar size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">EMI Alert</p>
                        <p className="text-[11px] text-amber-700 font-bold leading-tight">₹12,400 due for Personal Loan in 3 days.</p>
                     </div>
                  </div>
                  <ChevronRight size={16} className="text-amber-400" />
               </div>

               <div className="bg-primary-50/50 border border-primary-100/50 p-5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-primary-50 transition-all" onClick={() => navigate('/app/analytics')}>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                        <BadgePercent size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-primary-900 uppercase tracking-widest">Wealth Insight</p>
                        <p className="text-[11px] text-primary-700 font-bold leading-tight">Your RD interest rate has increased by 0.5%.</p>
                     </div>
                  </div>
                  <ChevronRight size={16} className="text-primary-400" />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               {/* 7. Dense Activity Feed */}
               <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Transaction History</h3>
                     <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest">View All</button>
                  </div>
                  <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-50">
                     {transactions.length === 0 ? (
                        <div className="px-6 py-8 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">No transactions yet</div>
                     ) : transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                           <div className="flex items-center gap-5 flex-1">
                              <div className={`w-10 h-10 rounded-xl ${tx.color} text-white flex items-center justify-center font-black text-xs shadow-sm`}>
                                 {tx.avatar}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-[14px] leading-tight">{tx.name}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`font-black text-[14px] tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                 {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                              </p>
                              <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                 {tx.status}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* 8. Premium Products Banner */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-2">
                           <BadgePercent size={20} className="text-primary-200" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-primary-100">Credit Privilege</span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-2xl font-black tracking-tight leading-tight">Pre-approved <br /> Personal Loan</p>
                           <p className="text-primary-100 text-[11px] font-bold opacity-80">Zero documentation. Instant disbursal up to ₹5,00,000.</p>
                        </div>
                        <button onClick={() => navigate('/app/payments')} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl">Claim Offer</button>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-4">
                     <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Health</h4>
                        <Activity size={14} className="text-emerald-500" />
                     </div>
                     <div className="flex items-end justify-between">
                        <div>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">Healthy</p>
                           <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">94/100 Score</p>
                        </div>
                        <div className="w-20 h-10 flex items-end gap-1">
                           {[40, 70, 45, 90, 65, 80].map((h, i) => (
                              <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative overflow-hidden">
                                 <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1 }}
                                    className="absolute bottom-0 left-0 right-0 bg-primary-600"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <TransferFlow isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
      </div>
   );
};

export default Dashboard;
