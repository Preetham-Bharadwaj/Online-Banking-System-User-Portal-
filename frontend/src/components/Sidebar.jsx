import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Zap, 
  PieChart, 
  CreditCard, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/app/dashboard', icon: Home },
    { name: 'Payments', href: '/app/payments', icon: Zap },
    { name: 'Analytics', href: '/app/analytics', icon: PieChart },
    { name: 'Cards', href: '/app/cards', icon: CreditCard },
    { name: 'Profile', href: '/app/profile', icon: User },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col hidden lg:flex">
      <div className="h-28 flex items-center px-12">
        <Link to="/" className="flex items-center gap-3 text-primary-600 font-black text-2xl">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-200">
            <span className="text-xl">V</span>
          </div>
          <span className="tracking-tighter">Vertex</span>
        </Link>
      </div>

      <nav className="flex-1 px-8 py-10 space-y-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[13px] font-black transition-all group ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-primary-600'}`} />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-10 border-t border-slate-50">
        <Link to="/login" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
          <LogOut size={20} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
