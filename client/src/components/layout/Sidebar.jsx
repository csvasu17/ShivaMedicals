import React from 'react';

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', show: isAdmin },
    { id: 'queue', label: 'Queue Manager', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 11-8 0 4 4 0 018 0 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', show: true },
    { id: 'doctors', label: 'Doctor Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', show: isAdmin },
    { id: 'settings', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', show: isAdmin },
  ].filter(i => i.show);

  return (
    <aside className="w-80 bg-ink flex flex-col p-8 border-r border-white/5 shadow-2xl z-[150] fixed top-[68px] bottom-0 left-0">
       {/* User Info - Compact for sidebar */}
       <div className="mb-10 px-1 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Staff Profile</p>
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-base font-bold">
                {user?.username?.charAt(0).toUpperCase()}
             </div>
             <div>
                <p className="text-white font-bold text-sm leading-none mb-1 capitalize truncate max-w-[120px]">{user?.username}</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-primary/10 border border-teal-primary/20 rounded-full w-fit">
                   <div className="w-1 h-1 rounded-full bg-teal-primary animate-pulse"></div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-teal-primary">{user?.role}</p>
                </div>
             </div>
          </div>
       </div>

       {/* Menu Navigation */}
       <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
             <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                   activeTab === item.id 
                      ? 'bg-blue-primary text-white shadow-2xl shadow-blue-primary/30' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
             >
                <div className={`p-0.5 rounded-xl transition-all ${activeTab === item.id ? 'text-white bg-white/10 shadow-inner' : 'text-current group-hover:scale-110'}`}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                   </svg>
                </div>
                <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                {activeTab === item.id && <div className="absolute right-0 top-0 h-full w-1 bg-white/20"></div>}
             </button>
          ))}
       </nav>

       {/* Sign Out Action */}
       <div className="mt-auto pt-8 border-t border-white/5">
          <button 
             onClick={onLogout}
             className="w-full h-12 rounded-xl border border-white/5 text-white/20 font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/10 flex items-center justify-center gap-3 active:scale-95"
          >
             Sign Out
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
       </div>
    </aside>
  );
};

export default Sidebar;
