import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  ArrowRight, 
  Check, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldAlert, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Gift, 
  CircleAlert
} from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'payment_received',
    title: 'Money Received',
    description: '₹12,500 received from Rahul Sharma',
    time: '2 mins ago',
    date: 'Today',
    isRead: false,
    icon: <ArrowDownLeft size={16} className="text-emerald-600" />,
    color: 'bg-emerald-50'
  },
  {
    id: 2,
    type: 'payment_debited',
    title: 'Subscription Paid',
    description: '₹1,299 debited for Netflix Premium',
    time: '2 hours ago',
    date: 'Today',
    isRead: false,
    icon: <ArrowUpRight size={16} className="text-rose-600" />,
    color: 'bg-rose-50'
  },
  {
    id: 3,
    type: 'security_alert',
    title: 'Security Alert',
    description: 'New login detected from Bengaluru, IN',
    time: '5 hours ago',
    date: 'Today',
    isRead: true,
    icon: <ShieldAlert size={16} className="text-amber-600" />,
    color: 'bg-amber-50'
  },
  {
    id: 4,
    type: 'spending_insight',
    title: 'Spending Insight',
    description: 'Food & Dining spending is 12% higher than usual',
    time: 'Yesterday',
    date: 'Yesterday',
    isRead: true,
    icon: <TrendingUp size={16} className="text-indigo-600" />,
    color: 'bg-indigo-50'
  },
  {
    id: 5,
    type: 'cashback',
    title: 'Cashback Earned',
    description: 'Congratulations! ₹250 cashback credited to your wallet',
    time: 'Yesterday',
    date: 'Yesterday',
    isRead: true,
    icon: <Gift size={16} className="text-primary-600" />,
    color: 'bg-primary-50'
  },
  {
    id: 6,
    type: 'bill_reminder',
    title: 'Bill Reminder',
    description: 'Airtel Broadband bill is due in 2 days',
    time: '2 days ago',
    date: 'Earlier',
    isRead: true,
    icon: <Clock size={16} className="text-slate-600" />,
    color: 'bg-slate-50'
  }
];

const NotificationCenter = ({ isOpen, onClose, isMobile }) => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const grouped = notifications.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  const panelVariants = isMobile 
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' }
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.95 }
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Desktop */}
          {!isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-transparent"
            />
          )}

          {/* Backdrop for Mobile */}
          {isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
          )}

          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed z-[60] bg-white shadow-2xl overflow-hidden ${
              isMobile 
                ? 'inset-x-0 bottom-0 top-20 rounded-t-[2.5rem]' 
                : 'top-16 right-6 w-[400px] rounded-3xl border border-slate-100'
            }`}
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Notifications</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {notifications.filter(n => !n.isRead).length} Unread Alerts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-3 bg-slate-50/50 flex items-center justify-between">
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-all"
              >
                <Check size={12} /> Mark all as read
              </button>
              <button 
                onClick={clearAll}
                className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-all"
              >
                <Trash2 size={12} /> Clear all
              </button>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto no-scrollbar max-h-[calc(100vh-250px)] lg:max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <Bell size={32} />
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">All caught up!</h3>
                  <p className="text-slate-400 text-sm mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                Object.entries(grouped).map(([date, items]) => (
                  <div key={date}>
                    <div className="px-6 py-3 bg-white sticky top-0 z-[5]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{date}</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {items.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`px-6 py-5 flex gap-4 hover:bg-slate-50/80 transition-all cursor-pointer relative group ${!notif.isRead ? 'bg-primary-50/10' : ''}`}
                        >
                          {!notif.isRead && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-full" />
                          )}
                          <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${notif.color} shadow-sm`}>
                            {notif.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-black text-slate-900 text-sm leading-tight">{notif.title}</h4>
                              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{notif.time}</span>
                            </div>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{notif.description}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight size={14} className="text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-6 border-t border-slate-50">
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-2">
                  View Full History <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
