import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Shield, 
  BellRing, 
  Palette, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  UserCircle,
  Users,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const ProfileQuickMenu = ({ isOpen, onClose, isMobile }) => {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const displayName = user?.full_name || 'User';
  const isVerified = user?.kyc_status === 'verified';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  // Desktop Menu Items
  const desktopItems = [
    { icon: User, label: 'View Profile', href: '/app/profile', color: 'text-slate-600' },
    { icon: Settings, label: 'Settings', href: '/app/settings', color: 'text-slate-600' },
    { icon: Shield, label: 'Security Center', href: '/app/security', color: 'text-slate-600' },
    { icon: HelpCircle, label: 'Help & Support', href: '/app/support', color: 'text-slate-600' },
    { icon: LogOut, label: 'Logout', action: handleLogout, color: 'text-rose-500' },
  ];

  // Mobile Quick Account Items
  const mobileItems = [
    { icon: User, label: 'View Profile', href: '/app/profile', color: 'text-slate-600' },
    { icon: Settings, label: 'Settings', href: '/app/settings', color: 'text-slate-600' },
    { icon: Shield, label: 'Security Center', href: '/app/security', color: 'text-slate-600' },
    { icon: HelpCircle, label: 'Help & Support', href: '/app/support', color: 'text-slate-600' },
    { icon: Users, label: 'Switch Account', color: 'text-slate-600' },
    { icon: LogOut, label: 'Logout Session', action: handleLogout, color: 'text-rose-500' },
  ];

  const handleItemClick = (item) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[110] bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-10 flex flex-col max-h-[85vh]"
            >
              {/* Handle */}
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
              
              {/* Header: Compact Account Summary */}
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg border-2 border-white">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-none">{displayName}</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                       <ShieldCheck size={12} className={isVerified ? 'text-emerald-500' : 'text-amber-500'} />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{isVerified ? 'Verified' : 'Pending KYC'}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { navigate('/app/profile'); onClose(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-[10px] font-black text-primary-600 uppercase tracking-widest rounded-lg border border-slate-100 active:scale-95 transition-all"
                >
                  Profile <ArrowRight size={12} />
                </button>
              </div>

              {/* Quick Actions List: Compact & Purposeful */}
              <div className="space-y-1">
                {mobileItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center ${item.color} group-active:bg-white transition-colors`}>
                        <item.icon size={18} />
                      </div>
                      <span className={`text-[13px] font-black tracking-tight ${item.color === 'text-rose-500' ? 'text-rose-500' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>

              {/* Version Info */}
              <div className="mt-6 pt-6 border-t border-slate-50 text-center">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Finova Mobile v2.4.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Dropdown: Remains richer as it serves as the primary gateway
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-12 right-0 w-64 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl shadow-slate-200/50 p-3 z-[60] overflow-hidden"
        >
          <div className="p-3 mb-2 border-b border-slate-100 flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                {initials}
             </div>
             <div>
                <p className="text-xs font-black text-slate-900 leading-none">{displayName}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{isVerified ? 'Verified Profile' : 'Pending KYC'}</p>
             </div>
          </div>
          
          <div className="space-y-0.5">
            {desktopItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 transition-all group"
              >
                <div className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all ${item.color}`}>
                  <item.icon size={14} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${item.color === 'text-rose-500' ? 'text-rose-500' : 'text-slate-600 group-hover:text-primary-600'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileQuickMenu;
