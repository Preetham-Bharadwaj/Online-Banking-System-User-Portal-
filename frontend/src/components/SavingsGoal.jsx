import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

const SavingsGoal = ({ title, current, total, color = "from-primary-500 to-indigo-500" }) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 group hover:border-primary-100 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
          <Target size={20} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm items-end">
          <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Progress</span>
          <span className="font-black text-slate-900">₹{current.toLocaleString()} / ₹{total.toLocaleString()}</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${color} rounded-full shadow-sm`}
          />
        </div>
        <div className="flex justify-between items-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase">{percentage.toFixed(0)}% Completed</p>
           <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">₹{(total - current).toLocaleString()} to go</p>
        </div>
      </div>
      <button className="w-full py-3 bg-slate-50 hover:bg-primary-600 hover:text-white text-slate-600 font-bold rounded-2xl transition-all text-[10px] uppercase tracking-widest shadow-sm hover:shadow-primary-100">
        Add Funds
      </button>
    </div>
  );
};

export default SavingsGoal;
