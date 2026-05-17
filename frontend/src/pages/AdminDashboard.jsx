import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowLeftRight, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Filter, 
  Download,
  Activity,
  UserCheck,
  CreditCard,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { bankingService } from '../services/bankingService';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudData, setFraudData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metricsData, usersData, sortedTxResult, fraudResult] = await Promise.all([
        adminService.getMetrics(),
        adminService.getUsers(),
        bankingService.getSortedTransactions().catch(() => ({ data: [] })),
        bankingService.getFraudAnalysis().catch(() => ({ data: { suspicious_cycles: [] } }))
      ]);
      setMetrics(metricsData);
      setUsers(usersData);
      // Merge Sort O(n log n) — transactions arrive pre-sorted by date
      setTransactions(sortedTxResult?.data || []);
      // Graph DFS O(V+E) — circular transfer fraud detection
      setFraudData(fraudResult?.data || { suspicious_cycles: [] });
    } catch (error) {
      console.error("Admin data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: 'bg-primary-600' },
    { label: 'Total Transactions', value: metrics?.totalTransactions || 0, icon: ArrowLeftRight, color: 'bg-emerald-600' },
    { label: 'Platform Volume', value: `₹${(metrics?.totalVolume || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-indigo-600' },
    { label: 'Global Deposits', value: `₹${(metrics?.totalBalance || 0).toLocaleString()}`, icon: CreditCard, color: 'bg-amber-600' },
  ];


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initializing Admin Secure Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-10 animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Admin Control Center</h1>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <Activity size={12} className="text-emerald-500" /> System Status: Operational • Real-time Monitoring Active
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={fetchAdminData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                Refresh Data
             </button>
             <button className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl flex items-center gap-2">
                <Download size={14} /> Export Logs
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-5"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* User List Table */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                   <div className="flex items-center gap-3">
                      <UserCheck size={18} className="text-primary-600" />
                      <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Platform User Directory</h3>
                   </div>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-primary-500 transition-all w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-slate-50">
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">UPI ID</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.upi_id?.includes(searchQuery)).map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[11px]">
                                        {(user.full_name || 'U').substring(0, 2).toUpperCase()}
                                     </div>
                                     <div>
                                        <p className="font-black text-slate-900 text-[13px] leading-tight">{user.full_name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">{user.email}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-5">
                                  <code className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{user.upi_id}</code>
                               </td>
                               <td className="px-8 py-5">
                                  <p className="font-black text-slate-900 text-[13px]">₹{(user.balance || 0).toLocaleString()}</p>
                               </td>
                               <td className="px-8 py-5 text-right">
                                  <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                     <MoreVertical size={16} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* Recent Global Transactions */}
             <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                   <div className="flex items-center gap-3">
                      <ArrowLeftRight size={18} className="text-emerald-600" />
                      <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Global Transaction Feed</h3>
                   </div>
                   <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline">View All Logs</button>
                </div>
                <div className="divide-y divide-slate-50">
                   {transactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                         <div className="flex items-center gap-5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-[10px]">
                               {tx.payment_method?.substring(0, 2).toUpperCase() || 'UP'}
                            </div>
                            <div>
                               <p className="font-black text-slate-900 text-[13px] leading-tight">
                                  {tx.sender_upi} → {tx.receiver_upi}
                               </p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                  {new Date(tx.created_at).toLocaleString()} • {tx.category || 'General'}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-black text-slate-900 text-[13px]">₹{tx.amount?.toLocaleString()}</p>
                            <span className="flex items-center justify-end gap-1 text-[8px] font-black text-emerald-500 uppercase mt-1">
                               <CheckCircle2 size={10} /> Completed
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right Sidebar: System Insights */}
          <div className="lg:col-span-4 space-y-8">
             
             {/* Account Summary */}
             <div className="bg-slate-900 rounded-[2rem] p-7 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
                <div className="relative z-10 space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/5">
                         <ShieldAlert size={24} className="text-primary-400" />
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">System Health</span>
                         <span className="text-[13px] font-black text-emerald-400">Stable</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[14px] font-black tracking-tight leading-none">Global Liquidity</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Total user deposits on platform</p>
                   </div>
                   <div className="pt-2">
                      <p className="text-3xl font-black">₹{(metrics?.totalVolume || 0).toLocaleString()}</p>
                   </div>
                </div>
             </div>

             {/* Fraud Detection — Graph DFS O(V+E) */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex items-center justify-between px-1">
                   <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Fraud Detection</h3>
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${fraudData?.suspicious_cycles?.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {fraudData?.suspicious_cycles?.length > 0 ? '⚠ Alert' : '✓ Clean'}
                   </span>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${fraudData?.suspicious_cycles?.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                         <ShieldAlert size={20} />
                      </div>
                      <div>
                         <p className="text-[13px] font-black text-slate-900">{fraudData?.suspicious_cycles?.length || 0} Cycles Detected</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Circular transfer analysis (DFS)</p>
                      </div>
                   </div>
                   {fraudData?.suspicious_cycles?.length > 0 ? (
                      <div className="space-y-2">
                         {fraudData.suspicious_cycles.slice(0, 3).map((cycle, i) => (
                            <div key={i} className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                               <p className="text-[10px] font-black text-rose-700">Cycle {i + 1}: {cycle.length} nodes involved</p>
                               <p className="text-[9px] font-bold text-rose-400 mt-0.5 truncate">{cycle.slice(0, 3).join(' → ')}…</p>
                            </div>
                         ))}
                         {fraudData.suspicious_cycles.length > 3 && (
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">+{fraudData.suspicious_cycles.length - 3} more cycles</p>
                         )}
                      </div>
                   ) : (
                      <p className="text-[11px] font-bold text-slate-400 text-center py-2">No circular transfers detected. All clear.</p>
                   )}
                </div>
             </div>

             {/* Audit Log (Mock for visual) */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px] px-1">Admin Activity Log</h3>
                <div className="space-y-4">
                   {[
                     { user: 'Admin 1', action: 'Accessed Metrics', time: '2m ago' },
                     { user: 'System', action: 'DB Backup Complete', time: '1h ago' },
                     { user: 'Admin 1', action: 'Exported User List', time: '3h ago' }
                   ].map((log, i) => (
                      <div key={i} className="flex gap-4 items-start border-l-2 border-slate-50 pl-4 hover:border-primary-500 transition-colors">
                         <div className="space-y-0.5">
                            <p className="text-[11px] font-black text-slate-900">{log.user}</p>
                            <p className="text-[10px] font-bold text-slate-500">{log.action}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{log.time}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
