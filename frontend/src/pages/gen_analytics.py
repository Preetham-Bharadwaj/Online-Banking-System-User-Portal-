import sys

path = r"c:\Users\ASUS\OneDrive\Documents\GitHub\online-banking-system\frontend\src\pages\Analytics.jsx"

code = r"""// Finova Bank- INTELLIGENCE CENTER (ANALYTICS)
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
  Food:'#f59e0b',Shopping:'#8b5cf6',Bills:'#6366f1',Transport:'#10b981',
  Entertainment:'#ec4899',Recharge:'#06b6d4',Transfer:'#64748b',EMI:'#ef4444',
  Investment:'#10b981',Salary:'#10b981',Income:'#10b981',Other:'#94a3b8'
};
const CAT_ICONS = {
  Food:Utensils,Shopping:ShoppingBag,Bills:Wallet,Transport:Car,
  Entertainment:Gamepad2,Recharge:Zap,Transfer:ArrowUpRight,EMI:Home,
  Investment:TrendingUp,Salary:DollarSign,Income:DollarSign,Other:Activity
};
const BUDGET_CATS = ['Food','Shopping','Transport','Bills','Entertainment','Recharge'];

const calcSnapshot = (txs) => {
  let inc=0,exp=0,emi=0,bills=0;
  (txs||[]).forEach(tx=>{
    const a=Math.abs(safeNum(tx.amount));
    if(tx.type==='income') inc+=a;
    else if(tx.type==='expense'){exp+=a;if(tx.category==='EMI')emi+=a;if(tx.category==='Bills')bills+=a;}
  });
  return {totalIncome:inc,totalExpense:exp,netSavings:inc-exp,emiPaid:emi,billsPaid:bills};
};

const buildCats = (txs,budgets) => {
  const g={};
  (txs||[]).forEach(tx=>{
    if(tx.type!=='expense') return;
    const c=tx.category||'Other';
    if(!g[c]){const b=(budgets||[]).find(b=>b.category===c);g[c]={name:c,spent:0,limit:safeNum(b?.monthly_limit)||10000,icon:CAT_ICONS[c]||Activity,color:CAT_COLORS[c]||'#94a3b8'};}
    g[c].spent+=Math.abs(safeNum(tx.amount));
  });
  (budgets||[]).forEach(b=>{
    if(!g[b.category]) g[b.category]={name:b.category,spent:0,limit:safeNum(b.monthly_limit)||10000,icon:CAT_ICONS[b.category]||Activity,color:CAT_COLORS[b.category]||'#94a3b8'};
    else g[b.category].limit=safeNum(b.monthly_limit)||g[b.category].limit;
  });
  return Object.values(g);
};

const buildTrend = (txs,frame) => {
  const empty=keys=>keys.map(name=>({name,spent:0,income:0}));
  if(!txs||!txs.length){
    if(frame==='Week') return empty(['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);
    if(frame==='Year'){const yr=new Date().getFullYear();return empty([yr-4,yr-3,yr-2,yr-1,yr].map(String));}
    return empty(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].slice(0,new Date().getMonth()+1));
  }
  const g={};
  txs.forEach(tx=>{
    const d=new Date(tx.created_at);
    let k;
    if(frame==='Week') k=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    else if(frame==='Year') k=String(d.getFullYear());
    else k=d.toLocaleString('en-IN',{month:'short'});
    if(!g[k]) g[k]={name:k,spent:0,income:0};
    const a=Math.abs(safeNum(tx.amount));
    if(tx.type==='expense') g[k].spent+=a; else g[k].income+=a;
  });
  return Object.values(g);
};

const genInsights = (txs,cats) => {
  const ins=[];
  if(!txs||!txs.length) return ins;
  const top=cats.reduce((m,c)=>safeNum(c.spent)>safeNum(m?.spent||0)?c:m,null);
  if(top&&safeNum(top.spent)>0) ins.push({type:'info',icon:top.icon,text:'Highest spend: '+top.name+' ('+fmt(top.spent)+')'});
  cats.forEach(c=>{
    const p=safePct(c.spent,c.limit);
    if(p>=100) ins.push({type:'danger',icon:AlertCircle,text:c.name+' exceeded by '+fmt(safeNum(c.spent)-safeNum(c.limit))});
    else if(p>=85) ins.push({type:'warning',icon:AlertCircle,text:c.name+' nearing limit ('+p.toFixed(0)+'% used)'});
  });
  const ec=txs.filter(t=>t.type==='expense').length;
  if(ec>0) ins.push({type:'info',icon:Activity,text:ec+' expense transactions this month'});
  return ins.slice(0,4);
};

const calcHealth = (bal,inc,exp,cats) => {
  let s=500;
  const sr=inc>0?(inc-exp)/inc:0;
  s+=Math.min(sr*300,300);
  const ad=cats.length>0?cats.filter(c=>safePct(c.spent,c.limit)<=100).length/cats.length:0.5;
  s+=ad*200;
  if(bal>50000) s+=200; else if(bal>10000) s+=100; else if(bal>0) s+=50;
  return Math.min(Math.max(Math.round(s),0),1000);
};

const healthLabel = (score) => {
  if(score>=850) return {label:'Excellent',color:'#10b981'};
  if(score>=700) return {label:'Very Good',color:'#10b981'};
  if(score>=550) return {label:'Good',color:'#f59e0b'};
  if(score>=400) return {label:'Fair',color:'#f59e0b'};
  return {label:'Needs Attention',color:'#ef4444'};
};

const detectSubs = (txs) => {
  const kws=['netflix','spotify','prime','youtube','google one','apple','disney','hotstar'];
  const d={};
  (txs||[]).forEach(tx=>{
    const desc=(tx.description||tx.transaction_note||'').toLowerCase();
    kws.forEach(k=>{
      if(desc.includes(k)){
        if(!d[k]) d[k]={name:k.charAt(0).toUpperCase()+k.slice(1),amount:Math.abs(safeNum(tx.amount)),count:0};
        d[k].count++;
      }
    });
  });
  return Object.values(d);
};

const genAdvisory = (bal,inc,exp,cats) => {
  const s=[];
  const sr=inc>0?(inc-exp)/inc:0;
  if(bal>100000&&sr>0.3) s.push({type:'investment',title:'High Savings Detected',message:'You have '+fmt(bal)+' idle. Consider moving '+fmt(bal*0.5)+' to a Fixed Deposit for better returns.',action:'Explore FD Options'});
  const top=cats.reduce((m,c)=>safeNum(c.spent)>safeNum(m?.spent||0)?c:m,null);
  if(top&&safeNum(top.spent)>safeNum(top.limit)*0.8) s.push({type:'spending',title:top.name+' Spending High',message:'Your '+top.name+' expenses are '+fmt(top.spent)+'. Reducing by 15% saves '+fmt(top.spent*0.15)+'/month.',action:'View Budget'});
  if(bal<exp*3) s.push({type:'emergency',title:'Build Emergency Fund',message:'Aim for '+fmt(exp*6)+' (6 months expenses). You are '+fmt(Math.max(0,exp*6-bal))+' away.',action:'Start Saving'});
  if(sr<0.1&&inc>0) s.push({type:'warning',title:'Low Savings Rate',message:'You are saving only '+(sr*100).toFixed(0)+'% of income. Aim for at least 20%.',action:'Optimize Budget'});
  if(!s.length) s.push({type:'info',title:'Great Financial Health',message:'Your spending is well-balanced. Keep maintaining your current habits.',action:'View Details'});
  return s.slice(0,3);
};

// ── SKELETON ──────────────────────────────────────────────────────────────────
const Skeleton = ({className=''}) => <div className={'animate-pulse bg-slate-100 rounded-2xl '+className} />;

// ── ANALYSIS TAB ──────────────────────────────────────────────────────────────
const AnalysisTab = ({categories,transactions,isLoading,trendFrame,setTrendFrame}) => {
  const hasData = categories.some(c=>safeNum(c.spent)>0);
  const chartData = hasData ? categories.filter(c=>safeNum(c.spent)>0).map(c=>({name:c.name,value:safeNum(c.spent),color:c.color})) : [];
  const totalSpent = chartData.reduce((a,c)=>a+safeNum(c.value),0);
  const snap = useMemo(()=>calcSnapshot(transactions),[transactions]);
  const insights = useMemo(()=>genInsights(transactions,categories),[transactions,categories]);
  const trendData = useMemo(()=>buildTrend(transactions,trendFrame),[transactions,trendFrame]);

  if(isLoading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[1,2,3,4,5].map(i=><Skeleton key={i} className="h-28"/>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-5 h-96"/>
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-36"/>)}</div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-10">
      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {[
          {label:'Total Income',value:snap.totalIncome,icon:TrendingUp,color:'emerald'},
          {label:'Total Expense',value:snap.totalExpense,icon:TrendingDown,color:'rose'},
          {label:'Net Savings',value:snap.netSavings,icon:Wallet,color:snap.netSavings>=0?'emerald':'rose'},
          {label:'EMI Paid',value:snap.emiPaid,icon:Home,color:'indigo'},
          {label:'Bills Paid',value:snap.billsPaid,icon:Zap,color:'amber'}
        ].map((item,i)=>(
          <div key={i} className="bg-white rounded-[2rem] p-5 lg:p-6 border border-slate-50 shadow-sm hover:shadow-md transition-all">
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-'+item.color+'-50 text-'+item.color+'-600'}><item.icon size={20}/></div>
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
              <div className="relative w-full max-w-[260px] mx-auto" style={{aspectRatio:'1'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius="70%" outerRadius="95%" paddingAngle={4} dataKey="value" stroke="none">
                      {chartData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:'16px',border:'none',boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)'}} formatter={v=>[fmt(v),'Spent']}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(totalSpent)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-10 w-full">
                {chartData.map((c,i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:c.color}}/>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-900 truncate">{c.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{safePct(c.value,totalSpent).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 w-full">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center"><BarChart2 size={40} className="text-slate-200"/></div>
              <div className="text-center"><p className="font-black text-slate-400 text-sm">No spending data yet</p><p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mt-1">Make transactions to see insights</p></div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">Budget Tracking</h3>
          {categories.length===0 ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 flex flex-col items-center justify-center min-h-[200px] space-y-4">
              <Target size={32} className="text-slate-200"/>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center">No budget categories yet.<br/>Set budgets in the Budgeting tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {categories.map((cat,i)=>{
                const spent=safeNum(cat.spent),limit=safeNum(cat.limit)||1,pct=safePct(spent,limit);
                return (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{backgroundColor:cat.color}}><cat.icon size={22}/></div>
                      <div className="text-right">
                        <p className={'text-[10px] font-black uppercase tracking-widest '+(pct>=100?'text-rose-500':pct>=85?'text-amber-500':'text-emerald-500')}>{pct>=100?'Over Limit':pct>=85?'Caution':'Safe'}</p>
                        <p className="text-lg font-black text-slate-900 mt-0.5">{pct.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between"><h4 className="font-black text-slate-900 text-sm">{cat.name}</h4><p className="text-[11px] font-bold text-slate-400">{fmt(spent)} <span className="text-slate-300">/ {fmt(limit)}</span></p></div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:pct+'%'}} transition={{duration:0.8,ease:'easeOut'}} className={'h-full rounded-full '+(pct>=100?'bg-rose-500':pct>=85?'bg-amber-500':'bg-emerald-500')}/>
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
            {['Week','Month','Year'].map(f=>(
              <button key={f} onClick={()=>setTrendFrame(f)} className={'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all '+(trendFrame===f?'bg-slate-900 text-white':'bg-slate-50 text-slate-400 hover:bg-slate-100')}>{f}</button>
            ))}
          </div>
        </div>
        {trendData.some(d=>d.spent>0||d.income>0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{top:5,right:10,left:0,bottom:5}}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="name" tick={{fontSize:10,fontWeight:700,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fontWeight:700,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)} width={60}/>
              <Tooltip contentStyle={{borderRadius:'16px',border:'none',boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)'}} formatter={v=>[fmt(v)]}/>
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#ig)" name="Income"/>
              <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={2.5} fill="url(#sg)" name="Expense"/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'10px',fontWeight:700}}/>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-3"><BarChart2 size={32} className="text-slate-200"/><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No trend data yet</p></div>
        )}
      </div>

      {/* Insights */}
      {insights.length>0 && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Transaction Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins,i)=>(
              <div key={i} className={'p-5 rounded-2xl border flex items-start gap-4 '+(ins.type==='danger'?'bg-rose-50 border-rose-100':ins.type==='warning'?'bg-amber-50 border-amber-100':'bg-slate-50 border-slate-100')}>
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 '+(ins.type==='danger'?'bg-rose-100 text-rose-600':ins.type==='warning'?'bg-amber-100 text-amber-600':'bg-slate-100 text-slate-600')}><ins.icon size={20}/></div>
                <p className="text-[12px] font-bold text-slate-900 leading-relaxed pt-2">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
print('DONE part1, size:', len(code))