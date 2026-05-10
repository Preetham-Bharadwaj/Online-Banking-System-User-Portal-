import { motion } from 'framer-motion';

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center gap-3 shrink-0 group"
  >
    <div className={`w-12 h-12 md:w-14 md:h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:shadow-xl transition-all duration-300`}>
      <Icon size={20} className="md:size-24 group-hover:scale-110 transition-transform" />
    </div>
    <span className="text-[10px] md:text-[11px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest text-center">{label}</span>
  </motion.button>
);

export default QuickAction;
