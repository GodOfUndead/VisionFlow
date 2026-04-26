import React from 'react';
import { LayoutDashboard, UserPlus, Users, LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'entry' | 'list';
  onTabChange: (tab: 'dashboard' | 'entry' | 'list') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-text-main font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[220px] bg-sidebar border-r-2 border-black z-50 hidden md:flex flex-col p-6">
        <div className="logo text-black font-black text-2xl mb-10 flex items-center gap-2 italic uppercase tracking-tighter">
          OptiTrack
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            <NavItem
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => onTabChange('dashboard')}
            />
            <NavItem
              label="New Patient"
              active={activeTab === 'entry'}
              onClick={() => onTabChange('entry')}
            />
            <NavItem
              label="Patient Records"
              active={activeTab === 'list'}
              onClick={() => onTabChange('list')}
            />
          </ul>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t-2 border-black z-40 flex items-center justify-around px-6">
        <MobileNavItem
          icon={<LayoutDashboard size={24} />}
          label="Home"
          active={activeTab === 'dashboard'}
          onClick={() => onTabChange('dashboard')}
        />
        <div className="w-16 h-16" /> {/* Spacer for FAB */}
        <MobileNavItem
          icon={<Users size={24} />}
          label="Records"
          active={activeTab === 'list'}
          onClick={() => onTabChange('list')}
        />
      </div>

      {/* FAB - Fixed above bottom nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => onTabChange('entry')}
          className={cn(
            "w-16 h-16 bg-accent border-2 border-black shadow-brutal flex items-center justify-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
            activeTab === 'entry' && "bg-black text-white"
          )}
        >
          <UserPlus size={32} />
        </button>
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-black z-40 flex items-center justify-between px-6">
        <div className="text-black font-black text-xl italic uppercase tracking-tighter">
          OptiTrack
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-[220px] pt-20 md:pt-8 min-h-screen p-3 md:p-8 pb-32 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-tight transition-all",
          active
            ? "bg-accent text-black translate-x-[4px] translate-y-[4px] shadow-none"
            : "text-text-muted hover:bg-pastel-mint border-b-2 border-black mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        )}
      >
        {label}
      </button>
    </li>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-black" : "text-text-muted"
      )}
    >
      <div className={cn(
        "p-1 transition-all",
        active ? "scale-110" : "scale-100"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
