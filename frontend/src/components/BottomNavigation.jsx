import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Zap, 
  PieChart, 
  CreditCard, 
  User 
} from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/app/dashboard', icon: Home },
    { name: 'Pay', href: '/app/payments', icon: Zap },
    { name: 'Insights', href: '/app/analytics', icon: PieChart },
    { name: 'Cards', href: '/app/cards', icon: CreditCard },
    { name: 'Profile', href: '/app/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-50 px-6 py-3.5 flex items-center justify-between z-40 pb-safe-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className="relative flex flex-col items-center gap-1.5 px-3 py-1"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 relative ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div 
                  layoutId="activeCircle"
                  className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
