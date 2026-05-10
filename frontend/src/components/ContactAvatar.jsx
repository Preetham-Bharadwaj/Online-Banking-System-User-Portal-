import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const ContactAvatar = ({ name, avatar, color, isOnline = false, onClick }) => (
  <motion.button 
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-3 shrink-0 group relative"
  >
    <div className="relative">
      <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-black text-lg border-4 border-white shadow-sm group-hover:shadow-xl transition-all overflow-hidden relative`}>
         {avatar}
         
         {/* Hover Overlay */}
         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Send size={18} className="text-white" />
         </div>
      </div>
      
      {isOnline && (
        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
      )}
    </div>
    <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors">{name}</span>
  </motion.button>
);

export default ContactAvatar;
