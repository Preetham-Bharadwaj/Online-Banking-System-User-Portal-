import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQR } from '../context/QRContext';
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
   ChevronRight,
   AlertCircle,
   Clock,
   Smartphone,
   Building2,
   CheckCircle2,
   X,
   RefreshCcw,
   BookOpen,
   FileDown,
   Download
} from 'lucide-react';

import BalanceCard from '../components/BalanceCard';
import TransferFlow from '../components/TransferFlow';
import useStore from '../store/useStore';
import { bankingService } from '../services/bankingService';

const Dashboard = () => {
   const navigate = useNavigate();
   const { openScanner } = useQR();
   const [isTransferOpen, setIsTransferOpen] = useState(false);
   
   // Add Money State
   const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
   const [addAmount, setAddAmount] = useState('');
   const [addNote, setAddNote] = useState('');
   const [addLoading, setAddLoading] = useState(false);
   const [addSuccess, setAddSuccess] = useState(false);
   const [addTxRef, setAddTxRef] = useState('');
   const [addError, setAddError] = useState(null);

   const { 
      balance, 
      recentTransactions, 
      user, 
      isLoading, 
      activeAccount, 
      fixedDeposits, 
      loans, 
      analytics, 
      platformUsers,
      bills,
      setBankingData 
   } = useStore();

   useEffect(() => {
      console.log('Current logged in user:', user?.email);
   }, [user]);

   // Passbook Inline State
   const [isPassbookOpen, setIsPassbookOpen] = useState(false);
   const [pbSearch, setPbSearch] = useState('');
   const [pbFilterType, setPbFilterType] = useState('ALL'); // ALL, CREDITS, DEBITS
   const [pbTxType, setPbTxType] = useState('ALL'); // ALL, UPI, DEPOSIT, IMPS, NEFT
   const [pbDateFrom, setPbDateFrom] = useState('');
   const [pbDateTo, setPbDateTo] = useState('');
   const [expandedTxId, setExpandedTxId] = useState(null); // Mobile accordion
   const passbookRef = useRef(null);

   // Auto-scroll when passbook opens
   useEffect(() => {
      if (isPassbookOpen && passbookRef.current) {
         setTimeout(() => {
            passbookRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }, 300);
      }
   }, [isPassbookOpen]);

   // Compute running balances chronologically (backtracking from current balance)
   const computedTx = [];
   if (recentTransactions && recentTransactions.length > 0) {
      let tempBalance = balance || 0;
      // Sort newest to oldest so we can backtrack from the current balance (which is the newest state)
      const sortedNewestFirst = [...recentTransactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      for (let i = 0; i < sortedNewestFirst.length; i++) {
         const tx = sortedNewestFirst[i];
         const isCredit = tx.receiver_id === user?.id;
         
         computedTx.push({
            ...tx,
            isCredit,
            runningBalance: tempBalance,
            name: tx.note || tx.description || 'Finova Transfer',
            dateStr: new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            timeStr: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         });
         
         // Backtrack: if this transaction credited money, then before this transaction, the balance was less.
         // If it debited money, then before this transaction, the balance was more.
         if (isCredit) {
            tempBalance -= Number(tx.amount || 0);
         } else {
            tempBalance += Number(tx.amount || 0);
         }
      }
   }

   // Filtered Transactions for Passbook
   const pbFilteredTransactions = computedTx.filter(tx => {
      // 1. Search Query filter (matches note/description, sender, receiver)
      if (pbSearch) {
         const searchLower = pbSearch.toLowerCase();
         const nameMatches = tx.name.toLowerCase().includes(searchLower);
         const idMatches = tx.id.toLowerCase().includes(searchLower);
         const upiMatches = (tx.sender_upi || '').toLowerCase().includes(searchLower) || (tx.receiver_upi || '').toLowerCase().includes(searchLower);
         if (!nameMatches && !idMatches && !upiMatches) return false;
      }
      // 2. Type Filter (debits vs credits)
      if (pbFilterType === 'CREDITS' && !tx.isCredit) return false;
      if (pbFilterType === 'DEBITS' && tx.isCredit) return false;
      
      // 3. Transaction Type (payment method: UPI, IMPS, NEFT, DEPOSIT)
      if (pbTxType !== 'ALL') {
         const method = (tx.payment_type || 'UPI').toUpperCase();
         if (pbTxType === 'UPI' && method !== 'UPI' && method !== 'QR') return false;
         if (pbTxType === 'DEPOSIT' && method !== 'DEPOSIT' && method !== 'TRANSFER') return false;
         if (pbTxType === 'IMPS' && method !== 'IMPS') return false;
         if (pbTxType === 'NEFT' && method !== 'NEFT') return false;
      }
      
      // 4. Date filter
      if (pbDateFrom && new Date(tx.created_at) < new Date(pbDateFrom)) return false;
      if (pbDateTo) {
         const toDate = new Date(pbDateTo);
         toDate.setHours(23, 59, 59, 999);
         if (new Date(tx.created_at) > toDate) return false;
      }
      
      return true;
   });

   // Action: Download CSV
   const downloadCSV = () => {
      const headers = ['Ref ID', 'Date', 'Time', 'Description', 'Method', 'Debit/Credit', 'Amount (INR)', 'Status', 'Running Balance (INR)'];
      const rows = pbFilteredTransactions.map(tx => [
         tx.id,
         tx.dateStr,
         tx.timeStr,
         `"${tx.name.replace(/"/g, '""')}"`,
         tx.payment_type || 'UPI',
         tx.isCredit ? 'Credit' : 'Debit',
         tx.amount,
         tx.status,
         tx.runningBalance
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
         + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Statement_${activeAccount?.account_number || 'Finova'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   // Action: Download PDF
   const downloadPDF = () => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
         <html>
           <head>
             <title>Account Statement - ${activeAccount?.account_number}</title>
             <style>
               body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
               .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
               .logo { font-size: 24px; font-weight: 900; color: #0284c7; tracking-tight }
               .summary { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; }
               .summary p { margin: 4px 0; font-size: 13px; color: #475569; }
               .summary p strong { color: #0f172a; }
               table { width: 100%; border-collapse: collapse; margin-top: 20px; }
               th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 14px; text-align: left; font-size: 12px; }
               th { background-color: #f1f5f9; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
               .credit { color: #10b981; font-weight: 800; }
               .debit { color: #f43f5e; font-weight: 800; }
               .mono { font-family: monospace; color: #64748b; font-size: 11px; }
             </style>
           </head>
           <body>
             <div class="header">
               <div>
                 <div class="logo">FINOVA BANKING SYSTEM</div>
                 <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Digital Account Statement</p>
               </div>
               <div style="text-align: right">
                 <p style="margin: 0; font-size: 12px; font-weight: bold;">Date Generated: ${new Date().toLocaleDateString('en-IN')}</p>
                 <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Generated securely online</p>
               </div>
             </div>
             <h3 style="font-weight: 800; font-size: 16px; margin-bottom: 12px; color: #0f172a;">Account Overview</h3>
             <div class="summary">
               <div>
                 <p><strong>Account Holder:</strong> ${user?.full_name}</p>
                 <p><strong>Account Number:</strong> ${activeAccount?.account_number}</p>
                 <p><strong>Account Type:</strong> ${activeAccount?.account_type || 'Savings'} Account</p>
               </div>
               <div>
                 <p><strong>IFSC Code:</strong> ${activeAccount?.ifsc_code || 'FNVA0001923'}</p>
                 <p><strong>Branch:</strong> ${activeAccount?.branch || 'Bengaluru Main'}</p>
                 <p><strong>Current balance:</strong> ₹${balance?.toLocaleString('en-IN')}</p>
               </div>
             </div>
             <h3 style="font-weight: 800; font-size: 16px; margin-bottom: 12px; color: #0f172a;">Transaction Ledger</h3>
             <table>
               <thead>
                 <tr>
                   <th>Date/Time</th>
                   <th>Reference ID</th>
                   <th>Description</th>
                   <th>Method</th>
                   <th>Amount (INR)</th>
                   <th style="text-align: right">Running Balance</th>
                 </tr>
               </thead>
               <tbody>
                 ${pbFilteredTransactions.map(tx => `
                   <tr>
                     <td>${tx.dateStr}<br/><span style="font-size: 10px; color: #94a3b8">${tx.timeStr}</span></td>
                     <td class="mono">${tx.id}</td>
                     <td style="font-weight: bold; color: #1e293b">${tx.name}</td>
                     <td><span style="font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${tx.payment_type || 'UPI'}</span></td>
                     <td class="${tx.isCredit ? 'credit' : 'debit'}">${tx.isCredit ? '+' : '-'}₹${tx.amount?.toLocaleString('en-IN')}</td>
                     <td style="text-align: right; font-weight: bold; color: #0f172a">₹${tx.runningBalance?.toLocaleString('en-IN')}</td>
                   </tr>
                 `).join('')}
               </tbody>
             </table>
           </body>
         </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
         printWindow.focus();
         printWindow.print();
      }, 500);
   };

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

   const compactTransactions = transactions.slice(0, 4);

   // Dynamic Alerts System
   const alerts = [];

   // 1. Low Balance Warning
   if (balance !== null && balance < 5000) {
      alerts.push({
         id: 'low_balance',
         title: 'Low Balance Warning',
         message: `Your balance is ₹${Number(balance).toLocaleString('en-IN')}. Maintain ₹5,000 to avoid non-maintenance charges.`,
         color: 'bg-rose-50/70 border-rose-100/50 text-rose-950 shadow-rose-50/10',
         iconColor: 'bg-rose-500 text-white',
         icon: <AlertCircle size={18} />
      });
   }

   // 2. Upcoming Bills
   if (bills && bills.length > 0) {
      bills.slice(0, 2).forEach((bill) => {
         alerts.push({
            id: `bill_${bill.id}`,
            title: 'Upcoming Bill Payment',
            message: `₹${Number(bill.amount || 0).toLocaleString('en-IN')} is due for ${bill.provider_name} soon.`,
            color: 'bg-amber-50/70 border-amber-100/50 text-amber-950 shadow-amber-50/10',
            iconColor: 'bg-amber-500 text-white',
            icon: <Calendar size={18} />
         });
      });
   }

   // 3. Active Loans EMI Alert
   if (loans && loans.length > 0) {
      loans.slice(0, 2).forEach((loan) => {
         alerts.push({
            id: `loan_${loan.id}`,
            title: 'EMI Reminder',
            message: `₹${Number(loan.emi_amount || 0).toLocaleString('en-IN')} is due for your ${loan.loan_type} loan.`,
            color: 'bg-blue-50/70 border-blue-100/50 text-blue-950 shadow-blue-50/10',
            iconColor: 'bg-blue-600 text-white',
            icon: <Clock size={18} />
         });
      });
   }

   // 4. KYC Status Security Alert
   if (user?.kyc_status !== 'verified') {
      alerts.push({
         id: 'kyc_pending',
         title: 'Security Notice',
         message: 'Your KYC profile verification is pending. Verify to unlock all features.',
         color: 'bg-slate-50 border-slate-200 text-slate-800',
         iconColor: 'bg-slate-900 text-white',
         icon: <ShieldCheck size={18} />
      });
   }

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
         <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24 pt-8 space-y-8 animate-fadeIn">
            
            {/* 1. Header (Ecosystem Hub Title) */}
            <div className="flex items-center justify-between px-1">
               <div className="space-y-1.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                     Finova Dashboard
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                     Online Banking Portal
                  </p>
               </div>
            </div>

            {/* 2. Hero Balance Section (Primary Focus) */}
            <div className="w-full">
               <BalanceCard
                  greeting={(() => {
                     const hour = new Date().getHours();
                     const firstName = user?.full_name?.split(' ')[0] || 'Alex';
                     if (hour < 12) return `Good morning, ${firstName}`;
                     if (hour < 17) return `Good afternoon, ${firstName}`;
                     return `Good evening, ${firstName}`;
                  })()}
                  balance={balance}
                  accountType={`${activeAccount?.account_type || 'Savings'} Account - •••• ${activeAccount?.account_number?.slice(-4) || 'New'}`}
                  onTransferClick={() => setIsTransferOpen(true)}
                  onScanClick={openScanner}
               />
            </div>

            {/* 3. Responsive 3-Column Desktop Grid / 2-Column Tablet Grid / Stacked Mobile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
               
               {/* Left two columns on large screens: Quick Actions, Month Summary, and Alerts */}
               <div className="lg:col-span-2 space-y-8">
                  
                  {/* Quick Actions Grid */}
                  <div className="space-y-4">
                     <div className="px-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                           Quick Actions
                        </h3>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Scan & Pay */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={openScanner}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <QrCode size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Scan & Pay
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 Pay any QR
                              </p>
                           </div>
                        </motion.button>

                        {/* Send Money */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => setIsTransferOpen(true)}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Send size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Send Money
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 To UPI or Phone
                              </p>
                           </div>
                        </motion.button>

                        {/* Pay Bills */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => navigate('/app/payments')}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-emerald-200 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Receipt size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Pay Bills
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 Bills & Dues
                              </p>
                           </div>
                        </motion.button>

                        {/* Recharge */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => navigate('/app/payments')}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-amber-200 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Smartphone size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Recharge
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 Mobile & Fastag
                              </p>
                           </div>
                        </motion.button>

                        {/* Bank Transfer */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => setIsTransferOpen(true)}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-violet-200 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Building2 size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Bank Transfer
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 IMPS or NEFT
                              </p>
                           </div>
                        </motion.button>

                        {/* Cards */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => navigate('/app/cards')}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-rose-200 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CreditCard size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Cards
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 Limits & settings
                              </p>
                           </div>
                        </motion.button>

                        {/* Passbook */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => setIsPassbookOpen(!isPassbookOpen)}
                           className={`p-5 rounded-[2rem] border transition-all flex flex-col justify-between h-36 text-left group ${isPassbookOpen ? 'bg-sky-50/50 border-sky-300 shadow-md ring-4 ring-sky-500/5' : 'bg-white border-slate-200/60 shadow-sm hover:border-sky-200'}`}
                        >
                           <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <History size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 Passbook
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 Track transactions
                              </p>
                           </div>
                        </motion.button>

                        {/* More */}
                        <motion.button
                           whileHover={{ y: -4 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => navigate('/app/settings')}
                           className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between h-36 text-left group"
                        >
                           <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus size={20} />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                 More
                              </h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                 Preferences
                              </p>
                           </div>
                        </motion.button>
                     </div>
                  </div>

                  {/* Month Summary Section */}
                  <div className="space-y-4">
                     <div className="px-1 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                           Monthly Overview
                        </h3>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                           {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Spent */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col justify-between h-36">
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</span>
                              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md">Debited</span>
                           </div>
                           <div>
                              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                 ₹{Number(analytics?.monthlySpend || 0).toLocaleString('en-IN')}
                              </h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                                 Outgoing payments
                              </p>
                           </div>
                        </div>

                        {/* Total Received */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col justify-between h-36">
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Received</span>
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">Credited</span>
                           </div>
                           <div>
                              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                 ₹{Number(analytics?.monthlyIncome || 0).toLocaleString('en-IN')}
                              </h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                                 Incoming payments
                              </p>
                           </div>
                        </div>

                        {/* Savings */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col justify-between h-36">
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Savings</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${(analytics?.savings || 0) >= 0 ? 'text-indigo-600 bg-indigo-50' : 'text-amber-600 bg-amber-50'}`}>
                                 {(analytics?.savings || 0) >= 0 ? 'Surplus' : 'Deficit'}
                              </span>
                           </div>
                           <div>
                              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                 ₹{Number(analytics?.savings || 0).toLocaleString('en-IN')}
                              </h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                                 Difference this month
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Priority Alerts Section */}
                  <div className="space-y-4">
                     <div className="px-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                           Priority Actions & Alerts
                        </h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerts.length === 0 ? (
                           <div className="bg-emerald-50/30 border border-emerald-100/50 p-6 rounded-[2rem] flex items-center justify-between col-span-2">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                                    <ShieldCheck size={20} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">
                                       Account Shield Active
                                    </p>
                                    <p className="text-[11px] text-emerald-700 font-bold leading-tight mt-0.5">
                                       Everything looks perfect! No pending bills or alerts found.
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           alerts.map((alert) => (
                              <div
                                 key={alert.id}
                                 className={`${alert.color} border p-5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:opacity-95 transition-all shadow-sm`}
                              >
                                 <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 ${alert.iconColor} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                                       {alert.icon}
                                    </div>
                                    <div className="truncate pr-4">
                                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">
                                          {alert.title}
                                       </p>
                                       <p className="text-[11px] font-bold leading-snug mt-1.5 truncate">
                                          {alert.message}
                                       </p>
                                    </div>
                                 </div>
                                 <ChevronRight size={16} className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                              </div>
                           ))
                        )}
                     </div>
                  </div>

               </div>

               {/* Right column: Recent Transactions (1 col on Desktop, stacks on Mobile/Tablet) */}
               <div className="space-y-4 md:col-span-2 lg:col-span-1">
                  <div className="flex justify-between items-center px-1">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Recent Activity
                     </h3>
                     <button 
                        onClick={() => navigate('/app/analytics')} 
                        className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                     >
                        View All
                     </button>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-50">
                     {compactTransactions.length === 0 ? (
                        <div className="px-6 py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           No recent transactions
                        </div>
                     ) : (
                        compactTransactions.map((tx) => (
                           <div 
                              key={tx.id} 
                              className="flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                           >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                 <div className={`w-10 h-10 rounded-xl ${tx.color} text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0`}>
                                    {tx.avatar}
                                 </div>
                                 <div className="truncate pr-4">
                                    <p className="font-black text-slate-900 text-sm leading-tight truncate">
                                       {tx.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                          {tx.category}
                                       </span>
                                       <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                          {tx.date}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className={`font-black text-[14px] tracking-tight leading-none ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                 </p>
                                 <p className={`text-[8px] font-black uppercase tracking-widest mt-1.5 leading-none ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-350'}`}>
                                    {tx.status}
                                 </p>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>

            </div>

            {/* 3. DYNAMIC IN-PAGE PASSBOOK PANEL */}
            <AnimatePresence>
               {isPassbookOpen && (
                  <motion.div
                     ref={passbookRef}
                     initial={{ opacity: 0, height: 0, y: 30 }}
                     animate={{ opacity: 1, height: 'auto', y: 0 }}
                     exit={{ opacity: 0, height: 0, y: 30 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                     className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/50 shadow-xl space-y-8 overflow-hidden mt-8"
                  >
                     {/* Passbook Title Header */}
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
                        <div className="space-y-1">
                           <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none flex items-center gap-2">
                              <History className="text-sky-500" size={20} /> Chronological Digital Passbook
                           </h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Statement of Account</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                           <button 
                              onClick={downloadCSV}
                              className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                           >
                              <FileDown size={14} /> Download CSV
                           </button>
                           <button 
                              onClick={downloadPDF}
                              className="flex-1 sm:flex-none px-4 py-2 bg-slate-950 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                           >
                              <Download size={14} /> Download PDF
                           </button>
                           <button 
                              onClick={() => setIsPassbookOpen(false)}
                              className="w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all"
                           >
                              <X size={16} />
                           </button>
                        </div>
                     </div>

                     {/* 1. MINI ACCOUNT SUMMARY */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                        <div>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account Holder</span>
                           <p className="text-xs font-black text-slate-800 truncate">{user?.full_name}</p>
                        </div>
                        <div>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account Number</span>
                           <p className="text-xs font-black text-slate-800 tracking-wider">{activeAccount?.account_number}</p>
                        </div>
                        <div>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">IFSC & Branch</span>
                           <p className="text-xs font-black text-slate-800">{activeAccount?.ifsc_code || 'FNVA0001923'} • {activeAccount?.branch || 'Bengaluru Main'}</p>
                        </div>
                        <div>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Balance & Type</span>
                           <p className="text-xs font-black text-emerald-600">₹{balance?.toLocaleString('en-IN')} ({activeAccount?.account_type || 'Savings'})</p>
                        </div>
                     </div>

                     {/* 3. STATEMENT FILTERS */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4.5 rounded-[1.75rem] border border-slate-150">
                        {/* Search */}
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                           <input
                              type="text"
                              value={pbSearch}
                              onChange={(e) => setPbSearch(e.target.value)}
                              placeholder="Search description/Ref ID..."
                              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl focus:bg-white focus:border-sky-500 outline-none text-xs font-bold transition-all"
                           />
                        </div>

                        {/* Credit/Debit Toggle */}
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                           {['ALL', 'DEBITS', 'CREDITS'].map((f) => (
                              <button
                                 key={f}
                                 type="button"
                                 onClick={() => setPbFilterType(f)}
                                 className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${pbFilterType === f ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                 {f}
                              </button>
                           ))}
                        </div>

                        {/* Payment Type */}
                        <select
                           value={pbTxType}
                           onChange={(e) => setPbTxType(e.target.value)}
                           className="px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-sky-500 transition-all"
                        >
                           <option value="ALL">All Methods</option>
                           <option value="UPI">UPI / QR Payments</option>
                           <option value="DEPOSIT">Deposits & Sweeps</option>
                           <option value="IMPS">IMPS Transfers</option>
                           <option value="NEFT">NEFT Transfers</option>
                        </select>

                        {/* Date Picker Range */}
                        <div className="flex gap-2">
                           <input
                              type="date"
                              value={pbDateFrom}
                              onChange={(e) => setPbDateFrom(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] font-bold text-slate-600 outline-none focus:bg-white focus:border-sky-500 transition-all"
                           />
                           <input
                              type="date"
                              value={pbDateTo}
                              onChange={(e) => setPbDateTo(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] font-bold text-slate-600 outline-none focus:bg-white focus:border-sky-500 transition-all"
                           />
                        </div>
                     </div>

                     {/* 2. BANK STATEMENT TABLE & CARDS */}
                     <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                           <table className="w-full border-collapse text-left">
                              <thead>
                                 <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">Date/Time</th>
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">Reference ID</th>
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">Debit/Credit</th>
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="py-4.5 px-6 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Running Balance</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {pbFilteredTransactions.length > 0 ? pbFilteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                       <td className="py-4 px-6 text-[10px] font-bold text-slate-500 leading-tight">
                                          <div>{tx.dateStr}</div>
                                          <div className="text-[9px] text-slate-350 mt-0.5">{tx.timeStr}</div>
                                       </td>
                                       <td className="py-4 px-6 font-mono text-[9px] text-slate-400 truncate max-w-[100px]">{tx.id}</td>
                                       <td className="py-4 px-6 text-xs font-black text-slate-800">{tx.name}</td>
                                       <td className="py-4 px-6">
                                          <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                             {tx.payment_type || 'UPI'}
                                          </span>
                                       </td>
                                       <td className={`py-4 px-6 text-xs font-black ${tx.isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {tx.isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                                       </td>
                                       <td className="py-4 px-6">
                                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'text-emerald-500 bg-emerald-50' : tx.status === 'pending' ? 'text-amber-500 bg-amber-50' : 'text-rose-500 bg-rose-50'}`}>
                                             {tx.status}
                                          </span>
                                       </td>
                                       <td className="py-4 px-6 text-right text-xs font-black text-slate-900">
                                          ₹{tx.runningBalance?.toLocaleString('en-IN')}
                                       </td>
                                    </tr>
                                 )) : (
                                    <tr>
                                       <td colSpan="7" className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No statement entries match your filter.</td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>

                        {/* Mobile Cards / Accordion View */}
                        <div className="lg:hidden space-y-3">
                           {pbFilteredTransactions.length > 0 ? pbFilteredTransactions.map((tx) => (
                              <div key={tx.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <p className="text-xs font-black text-slate-900 leading-tight">{tx.name}</p>
                                       <p className="text-[9px] font-bold text-slate-400 mt-1 leading-none">{tx.dateStr} • {tx.timeStr}</p>
                                    </div>
                                    <div className="text-right">
                                       <p className={`text-xs font-black leading-none ${tx.isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {tx.isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                                       </p>
                                       <p className="text-[9px] font-black text-slate-400 mt-1.5">Bal: ₹{tx.runningBalance?.toLocaleString('en-IN')}</p>
                                    </div>
                                 </div>
                                 
                                 {/* Expandable Accordion Toggle */}
                                 <div className="border-t border-slate-200/50 pt-2 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                       Ref: {tx.id.substring(0, 8)}...
                                    </span>
                                    <button 
                                       onClick={() => setExpandedTxId(expandedTxId === tx.id ? null : tx.id)}
                                       className="text-[9px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-1"
                                    >
                                       {expandedTxId === tx.id ? 'Hide Details' : 'Show Details'}
                                    </button>
                                 </div>

                                 {expandedTxId === tx.id && (
                                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-2 text-[10px] text-slate-500 font-bold">
                                       <p><strong className="text-slate-700">Full Ref ID:</strong> {tx.id}</p>
                                       <p><strong className="text-slate-700">Method:</strong> {tx.payment_type || 'UPI'}</p>
                                       <p><strong className="text-slate-700">Branch:</strong> {activeAccount?.branch || 'Bengaluru Main'}</p>
                                       <p><strong className="text-slate-700">Status:</strong> <span className="uppercase text-emerald-500">{tx.status}</span></p>
                                    </div>
                                 )}
                              </div>
                           )) : (
                              <p className="text-center text-[10px] font-black text-slate-300 uppercase py-8">No statement entries match your filter.</p>
                           )}
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>

         {/* ──────────────────────────── MODALS ──────────────────────────── */}
         
         {/* Send Money Modal (UPI Transfer Flow) */}
         <TransferFlow isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />

         {/* Add Money Modal */}
         <AnimatePresence>
            {isAddMoneyOpen && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => {
                        setIsAddMoneyOpen(false);
                        setAddSuccess(false);
                        setAddAmount('');
                        setAddNote('');
                        setAddError(null);
                     }}
                     className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                  />
                  {/* Modal Card */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 50 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 50 }}
                     className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-[201]"
                  >
                     {addSuccess ? (
                        <div className="p-10 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                           <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                           >
                              <CheckCircle2 size={38} />
                           </motion.div>
                           <div className="space-y-2">
                              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Funds Added Successfully</h2>
                              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                 Reference ID: {addTxRef || 'DEP-N/A'}
                              </p>
                           </div>
                           <div className="p-5 bg-slate-50 rounded-2xl w-full">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Default Account</p>
                              <p className="text-sm font-bold text-slate-700">{activeAccount?.account_type || 'Savings'} Account</p>
                              <p className="text-3xl font-black text-primary-600 mt-2">₹{Number(addAmount).toLocaleString('en-IN')}</p>
                           </div>
                           <button
                              onClick={() => {
                                 setIsAddMoneyOpen(false);
                                 setAddSuccess(false);
                                 setAddAmount('');
                                 setAddNote('');
                              }}
                              className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-md"
                           >
                              Done
                           </button>
                        </div>
                     ) : (
                        <>
                           <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                                    <Wallet size={20} />
                                 </div>
                                 <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Money</h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Fund your wallet instantly</p>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => setIsAddMoneyOpen(false)} 
                                 className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                              >
                                 <X size={18} />
                              </button>
                           </div>

                           <form 
                              onSubmit={async (e) => {
                                 e.preventDefault();
                                 if (!addAmount || Number(addAmount) <= 0) return;
                                 setAddLoading(true);
                                 setAddError(null);
                                 try {
                                    const res = await bankingService.deposit({
                                       amount: parseFloat(addAmount),
                                       note: addNote || 'Added Funds'
                                    });
                                    if (res.success) {
                                       setAddTxRef(res.reference);
                                       setAddSuccess(true);
                                       // Refresh Dashboard Data globally
                                       const updatedData = await bankingService.getDashboardData();
                                       setBankingData(updatedData);
                                    }
                                 } catch (err) {
                                    setAddError(err.response?.data?.error || 'Deposit failed');
                                 } finally {
                                    setAddLoading(false);
                                 }
                              }} 
                              className="p-8 space-y-6"
                           >
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">Amount to Add (INR)</label>
                                 <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                    <input
                                       required
                                       type="number"
                                       value={addAmount}
                                       onChange={(e) => setAddAmount(e.target.value)}
                                       placeholder="5,000"
                                       className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl text-2xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-200"
                                    />
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">Add Note (Optional)</label>
                                 <input
                                    type="text"
                                    value={addNote}
                                    onChange={(e) => setAddNote(e.target.value)}
                                    placeholder="e.g. Monthly savings contribution"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all"
                                 />
                              </div>

                              {addError && (
                                 <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black text-center uppercase tracking-wider">
                                    {addError}
                                 </div>
                              )}

                              <button
                                 type="submit"
                                 disabled={addLoading}
                                 className="w-full py-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-xl transition-all flex items-center justify-center gap-2"
                              >
                                 {addLoading ? (
                                    <>
                                       <RefreshCcw size={16} className="animate-spin" /> Adding Funds...
                                    </>
                                 ) : (
                                    <>Confirm Deposit</>
                                 )}
                              </button>
                           </form>
                        </>
                     )}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
   );
};

export default Dashboard;
