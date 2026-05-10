import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  AlertOctagon, 
  FileQuestion, 
  ChevronRight,
  Search,
  ArrowRight,
  LifeBuoy,
  MessageCircle,
  FileText,
  X
} from 'lucide-react';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const supportCategories = [
    {
      title: "Self-Service",
      items: [
        { id: 'FAQ', icon: FileQuestion, label: "Help Center & FAQs", desc: "Browse articles and guides" },
        { id: 'Transactions', icon: FileText, label: "Transaction Issues", desc: "Report a problem with a payment" },
      ]
    },
    {
      title: "Contact Us",
      items: [
        { id: 'Chat', icon: MessageCircle, label: "Live Chat Support", desc: "Typical response time: < 2 mins", status: "Online" },
        { id: 'Call', icon: Phone, label: "Voice Support", desc: "Available 24/7 for urgent issues" },
        { id: 'Email', icon: Mail, label: "Email Support", desc: "support@vertex.bank" },
      ]
    },
    {
      title: "Critical Support",
      items: [
        { id: 'Fraud', icon: AlertOctagon, label: "Report Fraud", desc: "Immediately block cards or account", status: "24/7 Priority", danger: true },
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24 pt-6 space-y-8 animate-fadeIn">
      {/* Header with Search */}
      <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-24 translate-x-24 blur-3xl"></div>
         <div className="relative z-10 space-y-8 text-center max-w-2xl mx-auto">
            <div className="space-y-4">
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md mx-auto">
                  <LifeBuoy size={32} />
               </div>
               <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-none">How can we help?</h1>
               <p className="text-primary-100 font-medium text-sm lg:text-base opacity-90">Search for help with transactions, account security, or banking products.</p>
            </div>
            
            <div className="relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={20} />
               <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs, issues, or topics..."
                className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all shadow-inner"
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-10">
            {supportCategories.map((section, i) => (
              <div key={i} className="space-y-6">
                 <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">{section.title}</h3>
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {section.items.map((item, j) => (
                      <motion.button 
                        key={j} 
                        whileHover={{ x: 4, backgroundColor: '#F8FAFC' }}
                        className="w-full flex items-center justify-between p-7 transition-all text-left group"
                      >
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 ${item.danger ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50'} rounded-2xl flex items-center justify-center transition-colors`}>
                               <item.icon size={22} />
                            </div>
                            <div>
                               <p className={`font-black ${item.danger ? 'text-rose-600' : 'text-slate-900'} text-[15px] leading-none tracking-tight`}>{item.label}</p>
                               <p className="text-[11px] text-slate-400 font-bold uppercase mt-2.5 tracking-tight">{item.desc}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-5">
                            {item.status && (
                               <span className={`text-[9px] font-black ${item.status === 'Online' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-primary-600 bg-primary-50 border-primary-100'} uppercase tracking-widest px-3 py-1.5 rounded-lg border`}>
                                  {item.status}
                               </span>
                            )}
                            <ChevronRight size={18} className="text-slate-200 group-hover:text-primary-600 transition-colors" />
                         </div>
                      </motion.button>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         {/* Sidebar: Open Tickets */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px] px-2">Your Support Tickets</h3>
               <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group hover:border-primary-200 transition-all">
                     <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Ticket #VRX-8291</p>
                     <p className="font-black text-slate-900 text-sm">Failed Card Transaction</p>
                     <div className="flex justify-between items-center mt-4">
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">In Progress</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Updated 1h ago</span>
                     </div>
                  </div>
                  <button className="w-full py-4 border-2 border-dashed border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-400 hover:text-primary-600 transition-all">
                     View All Tickets
                  </button>
               </div>
            </div>

            <div className="bg-rose-900 rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <AlertOctagon size={24} />
               </div>
               <div className="space-y-2">
                  <h4 className="font-black text-lg tracking-tight leading-tight">Lost your card?</h4>
                  <p className="text-rose-100 text-[12px] font-medium leading-relaxed opacity-90">Instantly block all transactions and request a replacement from the Cards section.</p>
               </div>
               <button className="w-full py-4 bg-white text-rose-900 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl">Go to Cards</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Support;
