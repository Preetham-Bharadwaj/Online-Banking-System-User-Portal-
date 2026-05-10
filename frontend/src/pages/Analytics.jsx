import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Utensils, 
  Car, 
  Gamepad2, 
  Zap, 
  ShoppingBag, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  PieChart as LucidePieChart,
  ChevronRight,
  MoreVertical,
  Plus,
  Save,
  Info,
  Calendar,
  Filter,
  ArrowRight,
  Target,
  ShieldCheck,
  BadgePercent,
  Wallet,
  Activity,
  History,
  Sparkles,
  RefreshCcw,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import IntelligenceModals from '../components/IntelligenceModals';
import { X } from 'lucide-react';

// --- Shared Mock Data ---
const INITIAL_CATEGORIES = [
  { name: 'Housing', spent: 45000, limit: 45000, icon: Home, color: '#6366f1' },
  { name: 'Food & Dining', spent: 12400, limit: 15000, icon: Utensils, color: '#f59e0b' },
  { name: 'Transport', spent: 8500, limit: 10000, icon: Car, color: '#10b981' },
  { name: 'Entertainment', spent: 9200, limit: 8000, icon: Gamepad2, color: '#ec4899' },
  { name: 'Utilities', spent: 5600, limit: 6000, icon: Zap, color: '#06b6d4' },
  { name: 'Shopping', spent: 15600, limit: 12000, icon: ShoppingBag, color: '#8b5cf6' },
];

const MONTHLY_TRENDS = {
  Week: [
    { name: 'Mon', spent: 2400, income: 4000 },
    { name: 'Tue', spent: 1398, income: 3000 },
    { name: 'Wed', spent: 9800, income: 2000 },
    { name: 'Thu', spent: 3908, income: 2780 },
    { name: 'Fri', spent: 4800, income: 1890 },
    { name: 'Sat', spent: 3800, income: 2390 },
    { name: 'Sun', spent: 4300, income: 3490 },
  ],
  Month: [
    { name: 'Jun', spent: 72000, income: 95000 },
    { name: 'Jul', spent: 81000, income: 95000 },
    { name: 'Aug', spent: 78000, income: 110000 },
    { name: 'Sep', spent: 85000, income: 110000 },
    { name: 'Oct', spent: 96300, income: 125000 },
  ],
  Year: [
    { name: '2019', spent: 850000, income: 1200000 },
    { name: '2020', spent: 920000, income: 1300000 },
    { name: '2021', spent: 980000, income: 1400000 },
    { name: '2022', spent: 1100000, income: 1600000 },
    { name: '2023', spent: 1250000, income: 1800000 },
  ]
};

// --- Sub-Components ---

const SpendingInsights = ({ categories }) => {
  const chartData = categories.map(cat => ({ name: cat.name, value: cat.spent, color: cat.color }));
  const totalSpent = categories.reduce((acc, curr) => acc + curr.spent, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-50 shadow-xl shadow-slate-100/50 flex flex-col items-center">
            <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-10 self-start">Monthly Breakdown</h3>
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center min-h-[250px]">
               <ResponsiveContainer width="100%" aspect={1}>
                  <PieChart>
                     <Pie data={chartData} innerRadius="75%" outerRadius="100%" paddingAngle={6} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Spent</span>
                  <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">₹{(totalSpent/1000).toFixed(1)}k</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-12 w-full">
               {categories.map((cat, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-900 leading-none">{cat.name}</span>
                       <span className="text-[9px] font-bold text-slate-400 mt-1">{((cat.spent/totalSpent)*100).toFixed(0)}%</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-7 space-y-8">
            <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">Budget Tracking</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {categories.map((cat, i) => {
                 const percent = (cat.spent / cat.limit) * 100;
                 return (
                   <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cat.color }}><cat.icon size={22} /></div>
                         <div className="text-right">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${percent >= 100 ? 'text-rose-500' : percent >= 85 ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {percent >= 100 ? 'Over Limit' : percent >= 85 ? 'Caution' : 'Safe'}
                            </p>
                            <p className="text-lg font-black text-slate-900 mt-0.5">{percent.toFixed(0)}%</p>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <h4 className="font-black text-slate-900 text-sm">{cat.name}</h4>
                            <p className="text-[11px] font-bold text-slate-400">₹{cat.spent.toLocaleString()} <span className="text-slate-300">/ ₹{cat.limit.toLocaleString()}</span></p>
                         </div>
                         <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percent, 100)}%` }} className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : percent >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>
    </motion.div>
  );
};

const BudgetPlanner = ({ categories, onUpdateLimit, selectedMonth }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="font-black text-slate-900 text-lg tracking-tight">Monthly Limits</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set targets for each category</p>
                   </div>
                   <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-primary-600 transition-all">
                      <Save size={14} /> Save Changes
                   </button>
                </div>

                <div className="space-y-6">
                   {categories.map((cat, i) => (
                     <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-slate-50 rounded-[2rem] hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0`} style={{ backgroundColor: cat.color }}>
                           <cat.icon size={22} />
                        </div>
                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h4 className="font-black text-slate-900 text-sm leading-none">{cat.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">Recommended: ₹{ (cat.limit * 0.9).toLocaleString() }</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Limit</p>
                                    <input 
                                      type="number" 
                                      value={cat.limit} 
                                      onChange={(e) => onUpdateLimit(i, Number(e.target.value))}
                                      className="bg-transparent font-black text-slate-900 text-lg w-24 outline-none border-b border-transparent focus:border-primary-500 text-right" 
                                    />
                                 </div>
                              </div>
                           </div>
                           <input 
                            type="range" 
                            min="0" 
                            max={100000} 
                            value={cat.limit} 
                            onChange={(e) => onUpdateLimit(i, Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-600" 
                           />
                        </div>
                   
                   ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-primary-100">
                <Target size={32} className="text-primary-200" />
                <div className="space-y-1">
                   <h3 className="text-xl font-black tracking-tight">Remaining Budget</h3>
                   <p className="text-primary-100 text-[11px] font-bold uppercase tracking-widest">For {selectedMonth}</p>
                </div>
                <div className="text-4xl font-black tracking-tighter">₹{(categories.reduce((acc, c) => acc + c.limit, 0) - categories.reduce((acc, c) => acc + c.spent, 0)).toLocaleString()}</div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${Math.min((categories.reduce((acc, c) => acc + c.spent, 0) / categories.reduce((acc, c) => acc + c.limit, 0)) * 100, 100)}%` }} />
                </div>
                <p className="text-[11px] font-medium text-primary-50 text-center">You have used {((categories.reduce((acc, c) => acc + c.spent, 0) / categories.reduce((acc, c) => acc + c.limit, 0)) * 100).toFixed(0)}% of your total monthly allocation.</p>
             </div>

             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                   <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                   <h4 className="font-black text-[10px] uppercase tracking-widest">Planner Suggestion</h4>
                </div>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                   Based on your previous 3 months, we suggest increasing your "Food & Dining" budget by 10% to avoid overspending alerts.
                </p>
                <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Apply suggestion</button>
             </div>
          </div>
       </div>
    </motion.div>
  );
};

const SpendingTrends = ({ categories, timeFrame, setTimeFrame }) => {
  const trendData = MONTHLY_TRENDS[timeFrame] || MONTHLY_TRENDS.Month;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-10"
    >
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-50 shadow-sm space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h3 className="font-black text-slate-900 text-lg tracking-tight">Financial Trends</h3>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cashflow & Savings Performance</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                   {['Week', 'Month', 'Year'].map(t => (
                     <button 
                       key={t} 
                       onClick={() => setTimeFrame(t)}
                       className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFrame === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                     >
                        {t}
                     </button>
                   ))}
                </div>
             </div>

             <div className="h-80 w-full relative min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                   <AreaChart data={trendData}>
                      <defs>
                         <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'black', fill: '#94a3b8' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="income" stroke="#6366f1" fill="url(#colorIncome)" strokeWidth={3} />
                      <Area type="monotone" dataKey="spent" stroke="#ef4444" fill="url(#colorSpent)" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8 h-full flex flex-col">
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Category Intelligence</h3>
                <div className="space-y-6 flex-1">
                   {categories.slice(0, 4).map((cat, i) => (
                     <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                              <cat.icon size={18} />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-sm leading-none">{cat.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">vs last month</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1 font-black text-[12px] text-rose-500">
                           <ArrowUpRight size={14} /> 12%
                        </div>
                     </div>
                   ))}
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">AI Recommendation</p>
                   <p className="text-[11px] text-emerald-600 font-bold leading-relaxed">
                     Switching your "Housing" payment to early-bird autopay could save you ₹450 monthly.
                   </p>
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
};

const FinancialAdvisory = ({ onOptimize }) => {
   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.98 }}
         className="space-y-10"
      >
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Credit Health Advisor */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Credit utilization Advisor</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Health score & Eligibility</p>
                     </div>
                     <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <ShieldCheck size={32} />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
                     <div className="relative w-full aspect-square flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                           <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset="60" strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                           <span className="text-4xl font-black text-slate-900 tracking-tighter">784</span>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Excellent</span>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Utilization Rate</p>
                           <p className="text-lg font-black text-slate-900">22% <span className="text-emerald-500 text-xs font-bold">(Healthy)</span></p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Loan Eligibility</p>
                           <p className="text-lg font-black text-slate-900">Up to ₹12.5L</p>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-primary-600 transition-all">Detailed Report</button>
                     </div>
                  </div>
               </div>

               {/* Subscription Tracking */}
               <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight">Recurring Subscriptions</h3>
                     <p className="text-[11px] font-black text-primary-600 uppercase tracking-widest">₹4,240 Total Monthly</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                       { name: 'Netflix Premium', price: 649, date: 'Oct 28', color: 'bg-rose-50 text-rose-600' },
                       { name: 'Google One', price: 130, date: 'Nov 02', color: 'bg-blue-50 text-blue-600' },
                       { name: 'Spotify Duo', price: 149, date: 'Nov 05', color: 'bg-emerald-50 text-emerald-600' },
                       { name: 'Amazon Prime', price: 1499, date: 'Yearly', color: 'bg-amber-50 text-amber-600' },
                     ].map((sub, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-primary-100 transition-all">
                          <div className="flex items-center gap-3">
                             <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${sub.color}`}>
                                {sub.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-[12px] font-black text-slate-900 leading-none">{sub.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">{sub.date}</p>
                             </div>
                          </div>
                          <p className="text-[12px] font-black text-slate-900">₹{sub.price}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Wealth Advisor Cards */}
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl space-y-6 relative overflow-hidden">
                  <Sparkles size={40} className="text-primary-300 opacity-30 absolute top-4 right-4" />
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-primary-200">AI Savings Lab</p>
                     <h4 className="text-xl font-black tracking-tight">Interest Optimizer</h4>
                  </div>
                  <p className="text-xs font-medium text-primary-50 leading-relaxed opacity-90">
                     We found ₹1.2L sitting idle in your savings. Moving this to a "Vertex Flexi-FD" could earn you an extra ₹8,400 per year.
                  </p>
                  <button 
                    onClick={onOptimize}
                    className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform"
                  >
                    Optimize Now
                  </button>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <TrendingUp size={20} />
                     </div>
                     <h4 className="font-black text-slate-900 text-sm">Market Outlook</h4>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-400">Equity Portfolio</span>
                        <span className="text-xs font-black text-emerald-500">+1.24% today</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-400">FD Rates</span>
                        <span className="text-xs font-black text-indigo-600">Up +0.2%</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Wealth Index</span>
                        <span className="text-xs font-black text-slate-900">Stable</span>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Clock size={20} className="text-white" />
                     </div>
                     <h4 className="font-black text-sm">EMI Forecast</h4>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Next 30 Days</p>
                  <div className="space-y-3">
                     <div className="flex justify-between text-lg font-black tracking-tight">
                        <span>₹12,400</span>
                        <span className="text-primary-400">Due Oct 28</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full">
                        <div className="h-full bg-primary-500 w-1/3 rounded-full" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
};

// --- Main Component ---

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedMonth, setSelectedMonth] = useState('October 2023');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [timeFrame, setTimeFrame] = useState('Month');
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [showOptimizer, setShowOptimizer] = useState(false);

  const months = ['August 2023', 'September 2023', 'October 2023', 'November 2023'];

  const handleUpdateLimit = (index, newLimit) => {
    const updated = [...categories];
    updated[index].limit = newLimit;
    setCategories(updated);
  };

  const tabs = [
    { id: 'insights', label: 'Analysis', icon: LucidePieChart },
    { id: 'trends', label: 'Performance', icon: TrendingUp },
    { id: 'advisory', label: 'Financial Advisory', icon: Sparkles },
    { id: 'planner', label: 'Budgeting', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-8 animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Financial Intelligence Center</h1>
              <p className="text-slate-500 font-bold text-[11px] lg:text-[13px] uppercase tracking-[0.2em] mt-3">
                 AI-powered wealth management, credit insights, and advisory.
              </p>
           </div>
           
           <div className="relative">
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-[12px] font-black text-slate-700 hover:bg-slate-50 transition-all"
              >
                 {selectedMonth} <ChevronDown size={16} className={`text-slate-400 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMonthPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                  >
                    {months.map(m => (
                      <button 
                        key={m}
                        onClick={() => { setSelectedMonth(m); setShowMonthPicker(false); }}
                        className={`w-full px-5 py-3 text-[11px] font-black uppercase tracking-widest text-left hover:bg-slate-50 transition-colors ${selectedMonth === m ? 'text-primary-600 bg-primary-50/30' : 'text-slate-500'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Functional Tab Navigation */}
        <div className="bg-slate-50/50 p-1.5 lg:bg-transparent lg:p-0 rounded-[1.5rem] lg:rounded-none mb-10 border lg:border-0 lg:border-b border-slate-100 flex items-center w-full overflow-x-auto no-scrollbar">
           {tabs.map((tab) => (
             <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 lg:px-8 py-3.5 lg:py-5 text-[9px] lg:text-[11px] font-black uppercase tracking-tight lg:tracking-[0.25em] relative transition-all flex items-center justify-center gap-1.5 lg:gap-2.5 rounded-[1.2rem] lg:rounded-none ${
                activeTab === tab.id 
                  ? 'text-primary-600 bg-white lg:bg-transparent shadow-sm lg:shadow-none' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
             >
                <tab.icon size={12} className="shrink-0 lg:w-[15px] lg:h-[15px]" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="whitespace-nowrap">{tab.label}</span>
                
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="hidden lg:block absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 shadow-[0_0_15px_rgba(99,102,241,0.6)]" 
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
             </button>
           ))}
        </div>

        {/* Dynamic Tab Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
             {activeTab === 'insights' && <SpendingInsights key="insights" categories={categories} />}
             {activeTab === 'planner' && <BudgetPlanner key="planner" categories={categories} onUpdateLimit={handleUpdateLimit} selectedMonth={selectedMonth} />}
             {activeTab === 'trends' && <SpendingTrends key="trends" categories={categories} timeFrame={timeFrame} setTimeFrame={setTimeFrame} />}
             {activeTab === 'advisory' && <FinancialAdvisory key="advisory" onOptimize={() => setShowOptimizer(true)} />}
          </AnimatePresence>
        </div>

        <IntelligenceModals isOpen={showOptimizer} onClose={() => setShowOptimizer(false)} />

      </div>
    </div>
  );
};

export default Analytics;
