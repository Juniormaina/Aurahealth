import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Award,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  User,
  LogOut,
  Bell,
  HelpCircle,
  Info,
  Zap,
  Watch,
  ShieldCheck,
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isProMode: boolean;
  onToggleProMode: () => void;
  userAccount?: { name: string; email: string; isGoogle: boolean; photoURL?: string } | null;
  onSignOut?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { id: 'companion', label: 'Companion', icon: Sparkles },
  { id: 'coach', label: 'AI Coach', icon: MessageSquare },
  { id: 'wheel', label: 'Rewards', icon: Award },
  { id: 'about', label: 'About', icon: Info },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SETTINGS_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'health-pass', label: 'Health Pass Sync', icon: ShieldCheck },
  { id: 'wearables', label: 'Wearables', icon: Watch },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isProMode,
  onToggleProMode,
  userAccount,
  onSignOut,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={`flex items-center border-b border-[#242E42] ${isCollapsed ? 'justify-center p-3' : 'justify-between p-3 pl-4'}`}>
          {!isCollapsed && <AuraLogo size="sm" inverted showSubtitle={false} />}
          {isCollapsed && <AuraLogo size="sm" markOnly />}
          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-[#00FFC2] hover:bg-white/5"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-[#00FFC2]"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-visible" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                data-tooltip={isCollapsed ? item.label : undefined}
              >
                <Icon />
                {!isCollapsed && <span className="flex-1">{item.label}</span>}
              </button>
            );
          })}

          {!isCollapsed && (
            <div className="mt-3 px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Settings</div>
          )}
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate('settings');
                  onCloseMobile();
                  window.requestAnimationFrame(() => {
                    document.getElementById(`settings-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  });
                }}
                className="sidebar-item"
                data-tooltip={isCollapsed ? item.label : undefined}
              >
                <Icon />
                {!isCollapsed && <span className="flex-1 text-[13px]">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="sidebar-item hidden lg:flex"
            data-tooltip={isCollapsed ? 'Expand menu' : undefined}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {!isCollapsed && <span className="flex-1">Collapse</span>}
          </button>
        </div>

        <div className="border-t border-[#242E42] p-2 space-y-1">
          <button
            type="button"
            className="sidebar-item"
            aria-label="Notifications"
            data-tooltip={isCollapsed ? 'Notifications' : undefined}
          >
            <Bell />
            {!isCollapsed && <span className="flex-1">Notifications</span>}
          </button>
          <button
            type="button"
            className="sidebar-item"
            aria-label="Help & Support"
            data-tooltip={isCollapsed ? 'Help' : undefined}
          >
            <HelpCircle />
            {!isCollapsed && <span className="flex-1">Help</span>}
          </button>

          {userAccount && (
            <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.04] border border-[#242E42] ${isCollapsed ? 'flex-col justify-center' : ''}`}>
              {userAccount.photoURL ? (
                <img src={userAccount.photoURL} alt={userAccount.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--color-primary-foreground)]" />
                </div>
              )}
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{userAccount.name}</div>
                    <div className="text-xs text-slate-400 truncate">{userAccount.email}</div>
                  </div>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="p-1.5 rounded-lg text-white/60 hover:text-[#00FFC2]"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
              {isCollapsed && onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-white/60 hover:text-[#00FFC2]"
                  aria-label="Sign out"
                  data-tooltip="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleProMode}
            className={`pro-upgrade-card w-[calc(100%-0.5rem)] text-left ${isCollapsed ? 'p-2 mx-auto flex justify-center' : ''}`}
            aria-pressed={isProMode}
            data-tooltip={isCollapsed ? 'Upgrade to Premium' : undefined}
          >
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <Zap className="w-4 h-4 text-[var(--color-harmony)]" />
              {!isCollapsed && (
                <div>
                  <div className="text-xs font-bold text-white">{isProMode ? 'Premium Active' : 'Upgrade to Premium'}</div>
                  <div className="text-[10px] text-slate-400">Culturally relevant sleep & focus</div>
                </div>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
