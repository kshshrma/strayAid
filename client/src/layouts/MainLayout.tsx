import { Outlet, NavLink } from 'react-router-dom';
import { Home, AlertTriangle, Map, LogIn } from 'lucide-react';

export default function MainLayout() {
  // Navigation links definition mapping label, path, and Lucide icons
  const navItems = [
    { label: 'Diagnostics', path: '/', icon: Home },
    { label: 'Report', path: '/report', icon: AlertTriangle },
    { label: 'Live Map', path: '/map', icon: Map },
    { label: 'Login', path: '/login', icon: LogIn },
  ];

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      
      {/* 1. DESKTOP SIDEBAR (Visible only on screens >= sm) */}
      <aside className="hidden sm:flex flex-col w-64 bg-white border-r border-neutral-200/80 shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
          <span className="text-2xl">🐾</span>
          <div>
            <h1 className="text-md font-bold tracking-tight text-neutral-900">StrayAid AEOS</h1>
            <span className="text-[10px] bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Rescue Active
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-neutral-100 text-center">
          <p className="text-[10px] text-neutral-400 font-medium">StrayAid AEOS • Version 1.0.0</p>
        </div>

      </aside>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-16 sm:pb-0">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* Subpages will inject here dynamically */}
          <Outlet />
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION (Visible only on screens < sm) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur border-t border-neutral-200/80 flex items-center justify-around px-2 z-50 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-primary-600 font-bold'
                    : 'text-neutral-400 font-medium hover:text-neutral-700'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}
