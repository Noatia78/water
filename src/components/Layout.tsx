import { ReactNode, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Droplets,
  FileText,
  Menu,
  X,
  Bell,
  Shield
} from 'lucide-react';

export type Page = 'dashboard' | 'reports' | 'water' | 'alerts' | 'ai' | 'education';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  alertCount?: number;
}

const navItems: { id: Page; label: string; icon: typeof Activity; shortLabel: string }[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: BarChart3 },
  { id: 'reports', label: 'Health Reports', shortLabel: 'Reports', icon: FileText },
  { id: 'water', label: 'Water Quality', shortLabel: 'Water', icon: Droplets },
  { id: 'alerts', label: 'Alerts', shortLabel: 'Alerts', icon: Bell },
  { id: 'ai', label: 'AI Predictions', shortLabel: 'AI', icon: Brain },
  { id: 'education', label: 'Education', shortLabel: 'Education', icon: BookOpen },
];

export default function Layout({ children, currentPage, onNavigate, alertCount = 0 }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">AquaGuard NER</p>
            <p className="text-slate-400 text-xs">Health Surveillance</p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {id === 'alerts' && alertCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-slate-400 text-xs">System Online</span>
          </div>
          <p className="text-slate-600 text-xs mt-1">NER Health Grid v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-900 p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-slate-900 font-semibold text-base leading-tight">
              {navItems.find(n => n.id === currentPage)?.label ?? 'Dashboard'}
            </h1>
            <p className="text-slate-400 text-xs hidden sm:block">
              Northeastern Region Early Warning System
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 text-xs font-medium">Live Monitoring</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-700 text-xs font-semibold">{alertCount} Active Alerts</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
