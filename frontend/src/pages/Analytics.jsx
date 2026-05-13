// FINOVA BANK - INTELLIGENCE CENTER (ANALYTICS)
// Complete Production File

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Utensils, Car, Gamepad2, Zap, ShoppingBag, ArrowUpRight,
  TrendingUp, TrendingDown, PieChart as LucidePieChart,
  Target, ShieldCheck, Wallet, Activity, Sparkles, BarChart2,
  Save, AlertCircle, CheckCircle2, DollarSign, CreditCard, Calendar,
  RefreshCcw, Loader2, X, Brain, Lightbulb, Bell, Edit3
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';
import IntelligenceModals from '../components/IntelligenceModals';
import useStore from '../store/useStore';
import { bankingService } from '../services/bankingService';

const safeNum = (v) => { const n = Number(v); return isFinite(n) ? n : 0; };
const safePct = (num, den) => { const n = safeNum(num), d = safeNum(den); return d === 0 ? 0 : Math.min((n / d) * 100, 100); };
const fmt = (amount) => {
  const v = safeNum(amount);
  if (v === 0) return '\u20b90';
  if (v >= 10000000) return '\u20b9' + (v / 10000000).toFixed(1) + 'Cr';
  if (v >= 100000) return '\u20b9' + (v / 100000).toFixed(1) + 'L';
  if (v >= 1000) return '\u20b9' + (v / 1000).toFixed(1) + 'k';
  return '\u20b9' + Math.round(v).toLocaleString('en-IN');
};

const CAT_COLORS = {
  Food: '#f59e0b', Shopping: '#8b5cf6', Bills: '#6366f1', Transport: '#10b981',
  Entertainment: '#ec4899', Recharge: '#06b6d4', Transfer: '#64748b', EMI: '#ef4444',
  Investment: '#10b981', Salary: '#10b981', Income: '#10b981', Other: '#94a3b8'
};
const CAT_ICONS = {
  Food: Utensils, Shopping: ShoppingBag, Bills: Wallet, Transport: Car,
  Entertainment: Gamepad2, Recharge: Zap, Transfer: ArrowUpRight, EMI: Home,
  Investment: TrendingUp, Salary: DollarSign, Income: DollarSign, Other: Activity
};
const BUDGET_CATS = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Recharge'];

const calcSnapshot = (txs) => {
  let inc = 0, exp = 0, emi = 0, bills = 0;
  (txs || []).forEach(tx => {
    const a = Math.abs(safeNum(tx.amount));
    if (tx.type === 'income') inc += a;
    else if (tx.type === 'expense') { exp += a; if (tx.category === 'EMI') emi += a; if (tx.category === 'Bills') bills += a; }
  });
  return { totalIncome: inc, totalExpense: exp, netSavings: inc - exp, emiPaid: emi, billsPaid: bills };
};

const buildCats = (txs, budgets) => {
  const g = {};
  (txs || []).forEach(tx => {
    if (tx.type !== 'expense') return;
    const c = tx.category || 'Other';
    if (!g[c]) { const b = (budgets || []).find(b => b.category === c); g[c] = { name: c, spent: 0, limit: safeNum(b?.monthly_limit) || 10000, icon: CAT_ICONS[c] || Activity, color: CAT_COLORS[c] || '#94a3b8' }; }
    g[c].spent += Math.abs(safeNum(tx.amount));
  });
  (budgets || []).forEach(b => {
    if (!g[b.category]) g[b.category] = { name: b.category, spent: 0, limit: safeNum(b.monthly_limit) || 10000, icon: CAT_ICONS[b.category] || Activity, color: CAT_COLORS[b.category] || '#94a3b8' };
    else g[b.category].limit = safeNum(b.monthly_limit) || g[b.category].limit;
  });
  return Object.values(g);
};

const buildTrend = (txs, frame) => {
  const empty = keys => keys.map(name => ({ name, spent: 0, income: 0 }));
  if (!txs || !txs.length) {
    if (frame === 'Week') return empty(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    if (frame === 'Year') { const yr = new Date().getFullYear(); return empty([yr - 4, yr - 3, yr - 2, yr - 1, yr].map(String)); }
    return empty(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, new Date().getMonth() + 1));
  }
  const g = {};
  txs.forEach(tx => {
    const d = new Date(tx.created_at);
    let k;
    if (frame === 'Week') k = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    else if (frame === 'Year') k = String(d.getFullYear());
    else k = d.toLocaleString('en-IN', { month: 'short' });
    if (!g[k]) g[k] = { name: k, spent: 0, income: 0 };
    const a = Math.abs(safeNum(tx.amount));
    if (tx.type === 'expense') g[k].spent += a; else g[k].income += a;
  });
  return Object.values(g);
};

const genInsights = (txs, cats) => {
  const ins = [];
  if (!txs || !txs.length) return ins;
  const top = cats.reduce((m, c) => safeNum(c.spent) > safeNum(m?.spent || 0) ? c : m, null);
  if (top && safeNum(top.spent) > 0) ins.push({ type: 'info', icon: top.icon, text: 'Highest spend: ' + top.name + ' (' + fmt(top.spent) + ')' });
  cats.forEach(c => {
    const p = safePct(c.spent, c.limit);
    if (p >= 100) ins.push({ type: 'danger', icon: AlertCircle, text: c.name + ' exceeded by ' + fmt(safeNum(c.spent) - safeNum(c.limit)) });
    else if (p >= 85) ins.push({ type: 'warning', icon: AlertCircle, text: c.name + ' nearing limit (' + p.toFixed(0) + '% used)' });
  });
  const ec = txs.filter(t => t.type === 'expense').length;
  if (ec > 0) ins.push({ type: 'info', icon: Activity, text: ec + ' expense transactions this month' });
  return ins.slice(0, 4);
};

const calcHealth = (bal, inc, exp, cats) => {
  let s = 500;
  const sr = inc > 0 ? (inc - exp) / inc : 0;
  s += Math.min(sr * 300, 300);
  const ad = cats.length > 0 ? cats.filter(c => safePct(c.spent, c.limit) <= 100).length / cats.length : 0.5;
  s += ad * 200;
  if (bal > 50000) s += 200; else if (bal > 10000) s += 100; else if (bal > 0) s += 50;
  return Math.min(Math.max(Math.round(s), 0), 1000);
};

const healthLabel = (score) => {
  if (score >= 850) return { label: 'Excellent', color: '#10b981' };
  if (score >= 700) return { label: 'Very Good', color: '#10b981' };
  if (score >= 550) return { label: 'Good', color: '#f59e0b' };
  if (score >= 400) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Needs Attention', color: '#ef4444' };
};

const detectSubs = (txs) => {
  const kws = ['netflix', 'spotify', 'prime', 'youtube', 'google one', 'apple', 'disney', 'hotstar'];
  const d = {};
  (txs || []).forEach(tx => {
    const desc = (tx.description || tx.transaction_note || '').toLowerCase();
    kws.forEach(k => {
      if (desc.includes(k)) {
        if (!d[k]) d[k] = { name: k.charAt(0).toUpperCase() + k.slice(1), amount: Math.abs(safeNum(tx.amount)), count: 0 };
        d[k].count++;
      }
    });
  });
  return Object.values(d);
};

const genAdvisory = (bal, inc, exp, cats) => {
  const s = [];
  const sr = inc > 0 ? (inc - exp) / inc : 0;
  if (bal > 100000 && sr > 0.3) s.push({ type: 'investment', title: 'High Savings Detected', message: 'You have ' + fmt(bal) + ' idle. Consider moving ' + fmt(bal * 0.5) + ' to a Fixed Deposit for better returns.', action: 'Explore FD Options' });
  const top = cats.reduce((m, c) => safeNum(c.spent) > safeNum(m?.spent || 0) ? c : m, null);
  if (top && safeNum(top.spent) > safeNum(top.limit) * 0.8) s.push({ type: 'spending', title: top.name + ' Spending High', message: 'Your ' + top.name + ' expenses are ' + fmt(top.spent) + '. Reducing by 15% saves ' + fmt(top.spent * 0.15) + '/month.', action: 'View Budget' });
  if (bal < exp * 3) s.push({ type: 'emergency', title: 'Build Emergency Fund', message: 'Aim for ' + fmt(exp * 6) + ' (6 months expenses). You are ' + fmt(Math.max(0, exp * 6 - bal)) + ' away.', action: 'Start Saving' });
  if (sr < 0.1 && inc > 0) s.push({ type: 'warning', title: 'Low Savings Rate', message: 'You are saving only ' + (sr * 100).toFixed(0) + '% of income. Aim for at least 20%.', action: 'Optimize Budget' });
  if (!s.length) s.push({ type: 'info', title: 'Great Financial Health', message: 'Your spending is well-balanced. Keep maintaining your current habits.', action: 'View Details' });
  return s.slice(0, 3);
};

// ── SKELETON ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => <div className={'animate-pulse bg-slate-100 rounded-2xl ' + className} />;

// ── ANALYSIS TAB ──────────────────────────────────────────────────────────────
const AnalysisTab = ({ categories, transactions, isLoading, trendFrame, setTrendFrame }) => {
  const hasData = categories.some(c => safeNum(c.spent) > 0);
  const chartData = hasData ? categories.filter(c => safeNum(c.spent) > 0).map(c => ({ name: c.name, value: safeNum(c.spent), color: c.color })) : [];
  const totalSpent = chartData.reduce((a, c) => a + safeNum(c.value), 0);
  const snap = useMemo(() => calcSnapshot(transactions), [transactions]);
  const insights = useMemo(() => genInsights(transactions, categories), [transactions, categories]);
  const trendData = useMemo(() => buildTrend(transactions, trendFrame), [transactions, trendFrame]);

  if (isLoading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-5 h-96" />
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36" />)}</div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {[
          { label: 'Total Income', value: snap.totalIncome, icon: TrendingUp, color: 'emerald' },
          { label: 'Total Expense', value: snap.totalExpense, icon: TrendingDown, color: 'rose' },
          { label: 'Net Savings', value: snap.netSavings, icon: Wallet, color: snap.netSavings >= 0 ? 'emerald' : 'rose' },
          { label: 'EMI Paid', value: snap.emiPaid, icon: Home, color: 'indigo' },
          { label: 'Bills Paid', value: snap.billsPaid, icon: Zap, color: 'amber' }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-5 lg:p-6 border border-slate-50 shadow-sm hover:shadow-md transition-all">
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-' + item.color + '-50 text-' + item.color + '-600'}><item.icon size={20} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
            <p className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{fmt(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Donut + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-50 shadow-xl flex flex-col items-center">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-10 self-start">Monthly Breakdown</h3>
          {hasData ? (
            <>
              <div className="relative w-full max-w-[260px] mx-auto" style={{ aspectRatio: '1' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius="70%" outerRadius="95%" paddingAngle={4} dataKey="value" stroke="none">
                      {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0/0.1)' }} formatter={v => [fmt(v), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(totalSpent)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-10 w-full">
                {chartData.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-900 truncate">{c.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{safePct(c.value, totalSpent).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 w-full">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center"><BarChart2 size={40} className="text-slate-200" /></div>
              <div className="text-center"><p className="font-black text-slate-400 text-sm">No spending data yet</p><p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mt-1">Make transactions to see insights</p></div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">Budget Tracking</h3>
          {categories.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 flex flex-col items-center justify-center min-h-[200px] space-y-4">
              <Target size={32} className="text-slate-200" />
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center">No budget categories yet.<br />Set budgets in the Budgeting tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {categories.map((cat, i) => {
                const spent = safeNum(cat.spent), limit = safeNum(cat.limit) || 1, pct = safePct(spent, limit);
                return (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cat.color }}><cat.icon size={22} /></div>
                      <div className="text-right">
                        <p className={'text-[10px] font-black uppercase tracking-widest ' + (pct >= 100 ? 'text-rose-500' : pct >= 85 ? 'text-amber-500' : 'text-emerald-500')}>{pct >= 100 ? 'Over Limit' : pct >= 85 ? 'Caution' : 'Safe'}</p>
                        <p className="text-lg font-black text-slate-900 mt-0.5">{pct.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between"><h4 className="font-black text-slate-900 text-sm">{cat.name}</h4><p className="text-[11px] font-bold text-slate-400">{fmt(spent)} <span className="text-slate-300">/ {fmt(limit)}</span></p></div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 0.8, ease: 'easeOut' }} className={'h-full rounded-full ' + (pct >= 100 ? 'bg-rose-500' : pct >= 85 ? 'bg-amber-500' : 'bg-emerald-500')} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-slate-900 text-lg tracking-tight">Spending Trend</h3>
          <div className="flex gap-2">
            {['Week', 'Month', 'Year'].map(f => (
              <button key={f} onClick={() => setTrendFrame(f)} className={'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ' + (trendFrame === f ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}>{f}</button>
            ))}
          </div>
        </div>
        {trendData.some(d => d.spent > 0 || d.income > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={60} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0/0.1)' }} formatter={v => [fmt(v)]} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#ig)" name="Income" />
              <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={2.5} fill="url(#sg)" name="Expense" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-3"><BarChart2 size={32} className="text-slate-200" /><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No trend data yet</p></div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Transaction Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, i) => (
              <div key={i} className={'p-5 rounded-2xl border flex items-start gap-4 ' + (ins.type === 'danger' ? 'bg-rose-50 border-rose-100' : ins.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100')}>
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' + (ins.type === 'danger' ? 'bg-rose-100 text-rose-600' : ins.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600')}><ins.icon size={20} /></div>
                <p className="text-[12px] font-bold text-slate-900 leading-relaxed pt-2">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};


// PERFORMANCE TAB
const PerformanceTab = ({ categories, transactions, balance, isLoading }) => {
  const snap = useMemo(() => calcSnapshot(transactions), [transactions]);
  const score = useMemo(() => calcHealth(balance, snap.totalIncome, snap.totalExpense, categories), [balance, snap, categories]);
  const lbl = healthLabel(score);
  const subs = useMemo(() => detectSubs(transactions), [transactions]);
  const totalSubCost = subs.reduce((s, x) => s + safeNum(x.amount), 0);
  const savingsRatio = snap.totalIncome > 0 ? ((snap.totalIncome - snap.totalExpense) / snap.totalIncome) * 100 : 0;
  const efTarget = snap.totalExpense * 6;
  const efPct = safePct(balance, efTarget);

  const monthly = useMemo(() => {
    const m = {};
    (transactions || []).forEach(tx => {
      const d = new Date(tx.created_at);
      const k = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (!m[k]) m[k] = { name: k, income: 0, expense: 0 };
      const a = Math.abs(safeNum(tx.amount));
      if (tx.type === 'income') m[k].income += a; else m[k].expense += a;
    });
    return Object.values(m).slice(-6);
  }, [transactions]);

  if (isLoading) return (
    <div className="space-y-8">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}</div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

      {/* Health Score */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-50 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center lg:items-start">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Financial Health Score</p>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={lbl.color} strokeWidth="8"
                  strokeDasharray={`${(score / 1000) * 263.9} 263.9`} strokeLinecap="round" />
              </svg>
              <div className="text-center z-10">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{score}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: lbl.color }}>{lbl.label}</p>
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-4 text-center lg:text-left">Score out of 1000 based on savings, spending habits and balance</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Savings Rate', value: `${Math.max(0, savingsRatio).toFixed(0)}%`, icon: TrendingUp, good: savingsRatio >= 20 },
              { label: 'Budget Adherence', value: `${categories.length > 0 ? (categories.filter(c => safePct(c.spent, c.limit) <= 100).length / categories.length * 100).toFixed(0) : 100}%`, icon: Target, good: true },
              { label: 'Balance', value: fmt(balance), icon: Wallet, good: balance > 10000 },
              { label: 'Monthly Cashflow', value: fmt(snap.netSavings), icon: Activity, good: snap.netSavings >= 0 }
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${item.good ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${item.good ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}><item.icon size={16} /></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-base font-black text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income vs Expense */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Income vs Expense</h3>
        {monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={60} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0/0.1)' }} formatter={v => [fmt(v)]} />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#6366f1" radius={[6, 6, 0, 0]} name="Expense" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <BarChart2 size={32} className="text-slate-200" />
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No comparison data yet</p>
          </div>
        )}
      </div>

      {/* Savings + Emergency Fund */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-900 text-base tracking-tight mb-6">Savings Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Monthly Savings Rate</p>
                <p className={`text-sm font-black ${savingsRatio >= 20 ? 'text-emerald-600' : savingsRatio >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>{Math.max(0, savingsRatio).toFixed(1)}%</p>
              </div>
              <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(Math.max(0, savingsRatio), 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${savingsRatio >= 20 ? 'bg-emerald-500' : savingsRatio >= 10 ? 'bg-amber-500' : 'bg-rose-500'}`} />
              </div>
              <p className="text-[10px] font-bold text-slate-300 mt-2">Target: 20% of income</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saved This Month</p>
                <p className="text-base font-black text-slate-900">{fmt(Math.max(0, snap.netSavings))}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-base font-black text-slate-900">{fmt(balance)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-900 text-base tracking-tight mb-6">Emergency Fund</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{efPct.toFixed(0)}%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">of 6-month target</p>
              </div>
              <div className="w-20 h-20 relative flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={efPct >= 100 ? '#10b981' : efPct >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="10"
                    strokeDasharray={`${(efPct / 100) * 251.3} 251.3`} strokeLinecap="round" />
                </svg>
                <ShieldCheck size={20} className="text-slate-400 z-10" />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <div className="flex justify-between"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current</p><p className="text-[11px] font-black text-slate-900">{fmt(balance)}</p></div>
              <div className="flex justify-between"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p><p className="text-[11px] font-black text-slate-900">{fmt(efTarget)}</p></div>
              <div className="flex justify-between"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</p><p className="text-[11px] font-black text-rose-500">{fmt(Math.max(0, efTarget - balance))}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-900 text-lg tracking-tight">Subscription Monitoring</h3>
          {subs.length > 0 && (
            <div className="px-4 py-2 bg-rose-50 rounded-xl">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{fmt(totalSubCost)}/mo</p>
            </div>
          )}
        </div>
        {subs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <CreditCard size={32} className="text-slate-200" />
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center">No subscriptions detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subs.map((sub, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-600 font-black text-lg">{sub.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">{sub.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{fmt(sub.amount)}/mo</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};


// ADVISORY TAB
const AdvisoryTab = ({ categories, transactions, balance, isLoading, onOpenModal }) => {
  const snap = useMemo(() => calcSnapshot(transactions), [transactions]);
  const advisory = useMemo(() => genAdvisory(balance, snap.totalIncome, snap.totalExpense, categories), [balance, snap, categories]);
  const savingsRatio = snap.totalIncome > 0 ? (snap.totalIncome - snap.totalExpense) / snap.totalIncome : 0;

  const [goals, setGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 100000, icon: ShieldCheck, color: '#10b981' },
    { id: 2, name: 'Vacation Fund', target: 50000, icon: Calendar, color: '#6366f1' },
    { id: 3, name: 'Investment Goal', target: 200000, icon: TrendingUp, color: '#f59e0b' }
  ]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editTarget, setEditTarget] = useState('');

  const advColors = {
    investment: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    spending: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-100 text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
    emergency: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-100 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    warning: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'bg-rose-100 text-rose-600', btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
    info: { bg: 'bg-slate-50', border: 'border-slate-100', icon: 'bg-slate-100 text-slate-600', btn: 'bg-slate-900 hover:bg-black text-white' }
  };
  const advIcons = { investment: TrendingUp, spending: ShoppingBag, emergency: ShieldCheck, warning: AlertCircle, info: Sparkles };

  const upcomingBills = useMemo(() => {
    return categories.filter(c => ['Bills', 'EMI', 'Recharge'].includes(c.name) && safeNum(c.spent) > 0)
      .map(c => ({ name: c.name, amount: safeNum(c.spent), icon: c.icon, color: c.color, dueIn: Math.floor(Math.random() * 15) + 1 }));
  }, [categories]);

  if (isLoading) return (
    <div className="space-y-8">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}</div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

      {/* AI Suggestions */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">AI Savings Suggestions</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by your spending data</p>
          </div>
        </div>
        <div className="space-y-4">
          {advisory.map((item, i) => {
            const c = advColors[item.type] || advColors.info;
            const Icon = advIcons[item.type] || Sparkles;
            return (
              <div key={i} className={`p-6 rounded-2xl border ${c.bg} ${c.border} flex flex-col sm:flex-row sm:items-center gap-4`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.icon}`}><Icon size={22} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed">{item.message}</p>
                </div>
                {item.type === 'investment' && (
                  <button onClick={onOpenModal} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${c.btn}`}>{item.action}</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Investment Recommendations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Fixed Deposit', desc: 'Safe, guaranteed returns', rate: '7.5% p.a.', risk: 'Low', icon: ShieldCheck, color: '#10b981', rec: balance > 50000 },
            { name: 'Recurring Deposit', desc: 'Monthly savings habit', rate: '6.8% p.a.', risk: 'Low', icon: RefreshCcw, color: '#6366f1', rec: snap.netSavings > 5000 },
            { name: 'SIP / Mutual Fund', desc: 'Long-term wealth creation', rate: '12-15% p.a.*', risk: 'Medium', icon: TrendingUp, color: '#f59e0b', rec: savingsRatio > 0.2 },
            { name: 'Emergency Fund', desc: 'Liquid safety net', rate: '4-5% p.a.', risk: 'None', icon: Wallet, color: '#64748b', rec: balance < snap.totalExpense * 6 }
          ].map((inv, i) => (
            <div key={i} className={`p-6 rounded-2xl border transition-all ${inv.rec ? 'border-primary-200 bg-primary-50' : 'border-slate-100 bg-slate-50'}`}>
              {inv.rec && <div className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-3 flex items-center gap-1"><Sparkles size={10} /> Recommended</div>}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4" style={{ backgroundColor: inv.color }}><inv.icon size={18} /></div>
              <p className="font-black text-slate-900 text-sm mb-1">{inv.name}</p>
              <p className="text-[10px] font-medium text-slate-500 mb-3">{inv.desc}</p>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-emerald-600">{inv.rate}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${inv.risk === 'Low' || inv.risk === 'None' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.risk}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-bold text-slate-300 mt-4">*Mutual fund returns are market-linked and not guaranteed.</p>
      </div>

      {/* Bill Predictions */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Bill &amp; EMI Predictions</h3>
        {upcomingBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Calendar size={32} className="text-slate-200" />
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center">No upcoming bills detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBills.map((bill, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: bill.color }}><bill.icon size={20} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm">{bill.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Estimated due in ~{bill.dueIn} days</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-slate-900 text-sm">{fmt(bill.amount)}</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${bill.dueIn <= 5 ? 'text-rose-500' : 'text-amber-500'}`}>{bill.dueIn <= 5 ? 'Due Soon' : 'Upcoming'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Goals */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Financial Goals</h3>
        <div className="space-y-6">
          {goals.map(goal => {
            const current = goal.id === 1 ? balance : 0;
            const progress = safePct(current, goal.target);
            return (
              <div key={goal.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: goal.color }}><goal.icon size={18} /></div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{goal.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{fmt(current)} of {fmt(goal.target)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-900 text-sm">{progress.toFixed(0)}%</p>
                    {editingGoal === goal.id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={editTarget} onChange={e => setEditTarget(e.target.value)}
                          className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none" placeholder="Target" />
                        <button onClick={() => { setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, target: Number(editTarget) || g.target } : g)); setEditingGoal(null); }}
                          className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center"><CheckCircle2 size={14} /></button>
                        <button onClick={() => setEditingGoal(null)} className="w-8 h-8 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingGoal(goal.id); setEditTarget(String(goal.target)); }}
                        className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><Edit3 size={14} /></button>
                    )}
                  </div>
                </div>
                <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ backgroundColor: goal.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};


// BUDGETING TAB
const BudgetingTab = ({ categories, transactions, budgets, isLoading, onBudgetSaved }) => {
  const [budgetValues, setBudgetValues] = useState({});
  const [savingCat, setSavingCat] = useState(null);
  const [savedCats, setSavedCats] = useState({});

  useEffect(() => {
    const init = {};
    BUDGET_CATS.forEach(cat => {
      const ex = (budgets || []).find(b => b.category === cat);
      init[cat] = ex ? String(safeNum(ex.monthly_limit)) : '';
    });
    setBudgetValues(init);
  }, [budgets]);

  const handleSave = async (cat) => {
    const limit = safeNum(budgetValues[cat]);
    if (limit <= 0) return;
    setSavingCat(cat);
    try {
      await bankingService.saveBudget(cat, limit);
      setSavedCats(prev => ({ ...prev, [cat]: true }));
      if (onBudgetSaved) onBudgetSaved();
      setTimeout(() => setSavedCats(prev => ({ ...prev, [cat]: false })), 2000);
    } catch (err) {
      console.error('Budget save error:', err);
    } finally {
      setSavingCat(null);
    }
  };

  const displayCats = useMemo(() => {
    return BUDGET_CATS.map(cat => {
      const ex = categories.find(c => c.name === cat);
      const br = (budgets || []).find(b => b.category === cat);
      return {
        name: cat,
        spent: safeNum(ex?.spent),
        limit: safeNum(budgetValues[cat]) || safeNum(br?.monthly_limit) || 0,
        icon: CAT_ICONS[cat] || Activity,
        color: CAT_COLORS[cat] || '#94a3b8'
      };
    });
  }, [categories, budgets, budgetValues]);

  const totalBudget = displayCats.reduce((s, c) => s + safeNum(c.limit), 0);
  const totalSpent = displayCats.reduce((s, c) => s + safeNum(c.spent), 0);
  const totalRemaining = totalBudget - totalSpent;

  const plannerSuggestions = useMemo(() => {
    const s = [];
    displayCats.forEach(cat => {
      const pct = safePct(cat.spent, cat.limit);
      if (pct >= 100 && cat.limit > 0) s.push({ type: 'danger', text: `Increase ${cat.name} budget — exceeded by ${fmt(cat.spent - cat.limit)}` });
      else if (pct >= 85 && cat.limit > 0) s.push({ type: 'warning', text: `${cat.name} is at ${pct.toFixed(0)}% — consider reducing spending` });
      else if (pct < 30 && cat.limit > 0 && cat.spent > 0) s.push({ type: 'success', text: `${cat.name} well-managed — ${fmt(cat.limit - cat.spent)} remaining` });
    });
    return s.slice(0, 4);
  }, [displayCats]);

  if (isLoading) return (
    <div className="space-y-8">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}</div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

      {/* Overview Card */}
      {totalBudget > 0 && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Monthly Budget Overview</p>
              <div className="flex items-end gap-4 mb-6">
                <p className="text-5xl font-black tracking-tighter">{fmt(totalRemaining)}</p>
                <p className="text-slate-400 font-bold text-sm mb-2">remaining</p>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${safePct(totalSpent, totalBudget)}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${safePct(totalSpent, totalBudget) >= 100 ? 'bg-rose-500' : safePct(totalSpent, totalBudget) >= 80 ? 'bg-amber-500' : 'bg-primary-500'}`} />
              </div>
              <div className="flex justify-between mt-3">
                <p className="text-[10px] font-black text-slate-400">{fmt(totalSpent)} spent</p>
                <p className="text-[10px] font-black text-slate-400">{fmt(totalBudget)} total</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent</p><p className="text-base font-black text-white">{fmt(totalSpent)}</p></div>
              <div className="p-4 bg-slate-800 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget</p><p className="text-base font-black text-white">{fmt(totalBudget)}</p></div>
              <div className="p-4 bg-slate-800 rounded-2xl col-span-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Usage</p>
                <p className={`text-base font-black ${safePct(totalSpent, totalBudget) >= 100 ? 'text-rose-400' : safePct(totalSpent, totalBudget) >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{safePct(totalSpent, totalBudget).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Setup */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center"><Target size={20} /></div>
          <div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Monthly Budget Setup</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Set limits per category — saved to your account</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUDGET_CATS.map(cat => {
            const Icon = CAT_ICONS[cat] || Activity;
            const color = CAT_COLORS[cat] || '#94a3b8';
            const isSaving = savingCat === cat;
            const isSaved = savedCats[cat];
            return (
              <div key={cat} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}><Icon size={18} /></div>
                  <p className="font-black text-slate-900 text-sm">{cat}</p>
                </div>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">&#8377;</span>
                  <input type="number" value={budgetValues[cat] || ''} onChange={e => setBudgetValues(prev => ({ ...prev, [cat]: e.target.value }))}
                    placeholder="Set limit" min="0"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-primary-400 transition-all" />
                </div>
                <button onClick={() => handleSave(cat)} disabled={isSaving || !budgetValues[cat]}
                  className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed'}`}>
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <><CheckCircle2 size={14} /> Saved</> : <><Save size={14} /> Save Budget</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bars */}
      {displayCats.some(c => c.limit > 0) && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Budget Progress</h3>
          <div className="space-y-6">
            {displayCats.filter(c => c.limit > 0).map((cat, i) => {
              const pct = safePct(cat.spent, cat.limit);
              const remaining = safeNum(cat.limit) - safeNum(cat.spent);
              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}><cat.icon size={14} /></div>
                      <p className="font-black text-slate-900 text-sm">{cat.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-slate-900">{fmt(cat.spent)} <span className="text-slate-300 font-bold">/ {fmt(cat.limit)}</span></p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${remaining < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {remaining < 0 ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} left`}
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : pct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      {displayCats.some(c => safePct(c.spent, c.limit) >= 85 && c.limit > 0) && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
          <div className="flex items-center gap-3 mb-6"><Bell size={20} className="text-rose-500" /><h3 className="font-black text-slate-900 text-lg tracking-tight">Budget Alerts</h3></div>
          <div className="space-y-3">
            {displayCats.filter(c => safePct(c.spent, c.limit) >= 85 && c.limit > 0).map((cat, i) => {
              const pct = safePct(cat.spent, cat.limit);
              return (
                <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${pct >= 100 ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pct >= 100 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}><AlertCircle size={18} /></div>
                  <p className="text-[12px] font-bold text-slate-900 flex-1">
                    {pct >= 100 ? `${cat.name} budget exceeded — over by ${fmt(cat.spent - cat.limit)}` : `${cat.name} nearing limit — ${pct.toFixed(0)}% used`}
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${pct >= 100 ? 'text-rose-600' : 'text-amber-600'}`}>{pct.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Planner Suggestions */}
      {plannerSuggestions.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
          <div className="flex items-center gap-3 mb-6"><Lightbulb size={20} className="text-amber-500" /><h3 className="font-black text-slate-900 text-lg tracking-tight">Planner Suggestions</h3></div>
          <div className="space-y-3">
            {plannerSuggestions.map((s, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex items-start gap-4 ${s.type === 'danger' ? 'bg-rose-50 border-rose-100' : s.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${s.type === 'danger' ? 'bg-rose-100 text-rose-600' : s.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {s.type === 'success' ? <CheckCircle2 size={14} /> : <Lightbulb size={14} />}
                </div>
                <p className="text-[12px] font-bold text-slate-900 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};


// MAIN ANALYTICS COMPONENT
const TABS = [
  { id: 'analysis', label: 'Analysis', icon: LucidePieChart },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'advisory', label: 'Advisory', icon: Brain },
  { id: 'budgeting', label: 'Budgeting', icon: Target }
];

const Analytics = () => {
  const { recentTransactions, budgets, balance, user } = useStore();
  const [activeTab, setActiveTab] = useState('analysis');
  const [trendFrame, setTrendFrame] = useState('Month');
  const [isLoading, setIsLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const txData = await bankingService.getTransactions();
        setAllTransactions(Array.isArray(txData) ? txData : (txData?.transactions || recentTransactions || []));
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setAllTransactions(recentTransactions || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const currentMonthTx = useMemo(() => {
    const now = new Date();
    return allTransactions.filter(tx => {
      const d = new Date(tx.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [allTransactions]);

  const categories = useMemo(() => buildCats(currentMonthTx, budgets), [currentMonthTx, budgets]);

  const handleBudgetSaved = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header + Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5 lg:py-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Intelligence</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {user?.full_name ? `${user.full_name}'s Financial Analytics` : 'Your Financial Analytics'}
              </p>
            </div>
            <button onClick={() => setRefreshKey(k => k + 1)} disabled={isLoading}
              className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50">
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <AnalysisTab key="analysis" categories={categories} transactions={currentMonthTx}
              isLoading={isLoading} trendFrame={trendFrame} setTrendFrame={setTrendFrame} />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab key="performance" categories={categories} transactions={allTransactions}
              balance={safeNum(balance)} isLoading={isLoading} />
          )}
          {activeTab === 'advisory' && (
            <AdvisoryTab key="advisory" categories={categories} transactions={allTransactions}
              balance={safeNum(balance)} isLoading={isLoading} onOpenModal={() => setModalOpen(true)} />
          )}
          {activeTab === 'budgeting' && (
            <BudgetingTab key="budgeting" categories={categories} transactions={currentMonthTx}
              budgets={budgets} isLoading={isLoading} onBudgetSaved={handleBudgetSaved} />
          )}
        </AnimatePresence>
      </div>

      <IntelligenceModals isOpen={modalOpen} onClose={() => setModalOpen(false)} type="savings" />
    </div>
  );
};

export default Analytics;

