import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const InsightCard = ({ icon: Icon, title, desc, color, actionLabel = "View Details" }) => (
  <motion.div
    whileHover={{ x: 4 }}
    className={`p-6 rounded-[2rem] border border-slate-50 flex gap-5 items-start shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer bg-white`}
  >
    {/* Subtle Gradient background on hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${color.replace('bg-', 'from-').replace('-500', '-600')} to-transparent transition-opacity`}></div>

    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon size={22} />
    </div>

    <div className="space-y-2 relative z-10">
      <h4 className="text-sm font-black text-slate-900 group-hover:text-primary-600 transition-colors leading-none">{title}</h4>
      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>

      <div className="pt-1 flex items-center gap-1 text-[10px] font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
        {actionLabel} <ArrowRight size={10} />
      </div>
    </div>
  </motion.div>
);

export default InsightCard;
