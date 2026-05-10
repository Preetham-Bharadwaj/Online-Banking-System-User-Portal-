import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Zap, 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  UserCircle,
  ChevronDown
} from 'lucide-react';

import NotificationCenter from './NotificationCenter';
import ProfileQuickMenu from './ProfileQuickMenu';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Payments', href: '/app/payments', icon: Zap },
    { name: 'Intelligence', href: '/app/analytics', icon: BarChart3 },
    { name: 'Cards', href: '/app/cards', icon: CreditCard },
  ];

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 z-50 px-8 items-center justify-between shadow-sm">
      {/* 1. Logo & Nav Tabs */}
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2 text-primary-600 font-black text-xl hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
            <span className="text-sm">V</span>
          </div>
          <span className="tracking-tighter text-xl">Vertex</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${
                  isActive ? 'text-primary-600 bg-primary-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon size={16} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="navIndicator"
                    className="absolute -bottom-[1px] left-4 right-4 h-0.5 bg-primary-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. Global Search (Centered & Premium) */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search transactions, bills, or settings..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-[1.25rem] focus:bg-white focus:border-primary-500/40 focus:ring-4 focus:ring-primary-500/5 text-[13px] font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>
      </div>

      {/* 3. Actions & Profile Dropdown */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsNotifOpen(true)}
          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-white hover:text-primary-600 hover:shadow-md hover:border-slate-100 border border-transparent transition-all relative group"
        >
          <Bell size={18} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
        </button>

        <div className="h-8 w-px bg-slate-200/60 mx-1" />

        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md transition-all active:scale-95 group"
          >
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-[11px] shadow-lg group-hover:rotate-3 transition-transform">
               AL
             </div>
             <div className="text-left hidden xl:block">
               <p className="text-[12px] font-black text-slate-900 leading-none">Alex Lee</p>
               <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight mt-1">Premium</p>
             </div>
             <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <ProfileQuickMenu 
            isOpen={isProfileMenuOpen} 
            onClose={() => setIsProfileMenuOpen(false)} 
            isMobile={false}
          />
        </div>
      </div>

      <NotificationCenter 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        isMobile={false} 
      />
    </header>
  );
};

export default Navbar;
