import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNavigation from '../components/BottomNavigation';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';
import ProfileQuickMenu from '../components/ProfileQuickMenu';

const MainLayout = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] font-sans overflow-hidden">
      {/* 1. Desktop Top Navigation */}
      <Navbar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative lg:pt-16">
        
        {/* Mobile Header (Refined for Premium Neo-Bank UX) */}
        <header className="h-16 lg:hidden bg-white/90 backdrop-blur-xl border-b border-slate-100/60 flex items-center justify-between px-6 z-40 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary-200">V</div>
             <span className="font-black text-slate-900 tracking-tighter text-lg">Vertex</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center relative active:scale-95 transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            <button 
              onClick={() => setIsProfileMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-[10px] shadow-lg border-2 border-white active:scale-90 transition-all overflow-hidden"
            >
              AL
            </button>
          </div>
        </header>

        <NotificationCenter 
          isOpen={isNotifOpen} 
          onClose={() => setIsNotifOpen(false)} 
          isMobile={true} 
        />
        <ProfileQuickMenu 
          isOpen={isProfileMenuOpen} 
          onClose={() => setIsProfileMenuOpen(false)} 
          isMobile={true}
        />

        {/* 3. Page Content Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-8 scroll-smooth">
          <Outlet />
        </div>

        {/* 4. Mobile Bottom Navigation */}
        <BottomNavigation />
        
      </main>
    </div>
  );
};

export default MainLayout;
