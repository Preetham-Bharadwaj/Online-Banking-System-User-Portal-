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
  ChevronDown,
  ShieldCheck
} from 'lucide-react';


import NotificationCenter from './NotificationCenter';
import ProfileQuickMenu from './ProfileQuickMenu';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import authService from '../services/authService';


const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { recentTransactions, beneficiaries, bills, user } = useStore();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const displayName = user?.full_name || 'User';

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  const searchableData = {
    transactions: recentTransactions.map((tx) => ({
      id: tx.id,
      name: tx.description,
      amount: Number(tx.amount || 0),
      type: tx.type,
      date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''
    })),
    contacts: beneficiaries.map((beneficiary) => ({
      id: beneficiary.id,
      name: beneficiary.beneficiary_name,
      upi: beneficiary.upi_id || beneficiary.account_number || '',
      initials: (beneficiary.beneficiary_name || 'U').substring(0, 2).toUpperCase()
    })),
    services: [
      { name: 'Bill Payments', icon: Zap, href: '/app/payments' },
      { name: 'Cards Management', icon: CreditCard, href: '/app/cards' },
      { name: 'Analytics Hub', icon: BarChart3, href: '/app/analytics' },
      ...bills.map((bill) => ({ name: bill.provider_name, icon: Zap, href: '/app/payments' }))
    ]
  };

  const [results, setResults] = useState({ transactions: [], contacts: [], services: [] });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsSearching(true);
      setShowResults(true);
      
      const timer = setTimeout(async () => {
        try {
          const query = searchQuery.toLowerCase();
          
          // 1. Fetch real users from Global Directory
          const globalUsers = await authService.searchUsers(query);
          
          // 2. Filter local searchable data
          const filteredServices = searchableData.services.filter(s => 
            s.name.toLowerCase().includes(query)
          );

          const filteredTransactions = searchableData.transactions.filter(t => 
            t.name?.toLowerCase().includes(query)
          );

          // 3. Filter local contacts (beneficiaries)
          const localContacts = searchableData.contacts.filter(c => 
            c.name.toLowerCase().includes(query) || c.upi.toLowerCase().includes(query)
          );

          setResults({
            transactions: filteredTransactions,
            contacts: localContacts,
            global: globalUsers.filter(gu => !localContacts.some(lc => lc.upi === gu.upi_id)),
            services: filteredServices,
          });
        } catch (err) {
          console.error("Discovery failed:", err);
        } finally {
          setIsSearching(false);
        }
      }, 400);
      
      return () => clearTimeout(timer);
    } else {
      setResults({ transactions: [], contacts: [], global: [], services: [] });
      if (searchQuery.length === 0) setShowResults(false);
    }
  }, [searchQuery, beneficiaries, recentTransactions, bills]);


  const navigation = [
    { name: 'Home', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Payments', href: '/app/payments', icon: Zap },
    { name: 'Intelligence', href: '/app/analytics', icon: BarChart3 },
    { name: 'Cards', href: '/app/cards', icon: CreditCard },
  ];

  if (user?.is_admin) {
    navigation.push({ name: 'Admin', href: '/app/admin', icon: ShieldCheck });
  }


  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between px-8 lg:px-12">
        {/* 1. Logo & Nav Tabs */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 text-primary-600 font-black text-xl hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Finova Logo" className="h-12 w-auto object-contain" />
            <span className="tracking-tighter text-xl text-slate-900">Finova</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${isActive ? 'text-primary-600 bg-primary-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
        <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-primary-600 animate-pulse' : 'text-slate-400 group-focus-within:text-primary-600'}`} size={16} />
            <input
              type="text"
              placeholder="Search transactions, bills, or settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 0 && setShowResults(true)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-[1.25rem] focus:bg-white focus:border-primary-500/40 focus:ring-4 focus:ring-primary-500/5 text-[13px] font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden z-[60] max-h-[480px] flex flex-col"
              >
                <div className="p-6 overflow-y-auto space-y-6">
                  {isSearching ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching securely...</p>
                    </div>
                  ) : (results.transactions.length === 0 && results.contacts.length === 0 && results.services.length === 0) ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <Search size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900">No results for "{searchQuery}"</p>
                        <p className="text-[10px] font-bold text-slate-400">Try searching for people, bills or accounts</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {results.services.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Services & Tools</h4>
                          <div className="grid grid-cols-1 gap-1">
                            {results.services.map((service, i) => (
                              <button key={i} onClick={() => { navigate(service.href); setShowResults(false); }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <service.icon size={16} />
                                </div>
                                <span className="text-[12px] font-black text-slate-900">{service.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.contacts.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contacts</h4>
                          <div className="space-y-1">
                            {results.contacts.map((contact, i) => (
                              <button key={i} onClick={() => {
                                  navigate('/app/payments', { state: { recipient: { upi: contact.upi, name: contact.name } } });
                                  setShowResults(false);
                                  setSearchQuery('');
                                }} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                                    {contact.initials}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[12px] font-black text-slate-900 leading-none">{contact.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{contact.upi}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Transfer</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.global?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Global Network</h4>
                          <div className="space-y-1">
                            {results.global.map((gu, i) => (
                              <button key={i} onClick={() => {
                                  navigate('/app/payments', { state: { recipient: { upi: gu.upi_id, name: gu.full_name } } });
                                  setShowResults(false);
                                  setSearchQuery('');
                                }} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                                    {gu.full_name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[12px] font-black text-slate-900 leading-none">{gu.full_name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{gu.upi_id}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {gu.is_verified && <ShieldCheck size={14} className="text-primary-600" />}
                                  <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Pay</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.transactions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Recent Transactions</h4>
                          <div className="space-y-1">
                            {results.transactions.map((tx, i) => (
                              <button key={i} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className="text-left">
                                  <p className="text-[12px] font-black text-slate-900 leading-none">{tx.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-1">{tx.date}</p>
                                </div>
                                <span className={`text-[12px] font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recent Searches:</span>
                    <div className="flex gap-2">
                      {recentSearches.slice(0, 2).map((s, i) => (
                        <button key={i} onClick={() => setSearchQuery(s)} className="text-[9px] font-black text-slate-600 hover:text-primary-600">{s}</button>
                      ))}
                    </div>
                  </div>
                  <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Advanced Search</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                {initials}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-[12px] font-black text-slate-900 leading-none">{displayName}</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight mt-1">Active</p>
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
      </div>
    </header>
  );
};

export default Navbar;
