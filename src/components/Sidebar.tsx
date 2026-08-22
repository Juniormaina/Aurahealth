import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  MessageSquare,
  Award,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Heart,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isProMode: boolean;
  onToggleProMode: () => void;
  theme: 'midnight' | 'morning';
  onToggleTheme: () => void;
  userAccount?: { name: string; email: string; isGoogle: boolean; photoURL?: string } | null;
  onSignOut?: () => void;
  onOpenSearch: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isProMode,
  onToggleProMode,
  theme,
  onToggleTheme,
  userAccount,
  onSignOut,
  onOpenSearch,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const essentialNavItems = [
    { id: 'companion', label: 'Companion', icon: Sparkles, shortcut: '⌘1' },
    { id: 'coach', label: 'AI Coach', icon: MessageSquare, shortcut: '⌘2' },
    { id: 'wheel', label: 'Rewards', icon: Award, shortcut: '⌘3' },
  ];

  const proNavItems = [
    { id: 'companion', label: 'Companion', icon: Sparkles, shortcut: '⌘1' },
    { id: 'coach', label: 'AI Coach', icon: MessageSquare, shortcut: '⌘2' },
    { id: 'wheel', label: 'Rewards', icon: Award, shortcut: '⌘3' },
  ];

  const navItems = isProMode ? proNavItems : essentialNavItems;

  const quickActions = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, action: () => onNavigate('companion') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => {} },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar
          ${isCollapsed ? 'sidebar-collapsed' : ''}
          ${isMobileOpen ? 'mobile-open' : ''}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Aura</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/30">
              <Heart className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={onCloseMobile}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Button */}
        <div className="px-3 py-3">
          <button
            onClick={onOpenSearch}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              bg-slate-800/50 border border-slate-700/50
              text-slate-400 hover:text-slate-200 hover:border-slate-600
              transition-all text-sm
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            aria-label="Open search (Cmd+K)"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">Search...</span>
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-slate-500 bg-slate-700/50 rounded border border-slate-600/50">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Quick Action Toolbar */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <div className="quick-action-bar">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="quick-action-btn"
                  aria-label={action.label}
                  title={action.label}
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Primary">
          <div className="px-3 mb-2">
            {!isCollapsed && (
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
                {isProMode ? 'All Features' : 'Essentials'}
              </span>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`
                  sidebar-item
                  ${isActive ? 'active' : ''}
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-700/30 rounded">
                      {item.shortcut}
                    </kbd>
                  </>
                )}
              </button>
            );
          })}

          {/* Pro Mode Toggle */}
          {!isCollapsed && (
            <div className="px-3 mt-4 mb-2">
              <button
                onClick={onToggleProMode}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  border transition-all text-sm font-medium
                  ${isProMode
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }
                `}
                aria-pressed={isProMode}
              >
                <Zap className="w-4 h-4" />
                <span className="flex-1 text-left">{isProMode ? 'Pro Mode Active' : 'Upgrade to Pro'}</span>
                {isProMode && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 p-3 space-y-1">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`
              sidebar-item
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            aria-label={`Switch to ${theme === 'morning' ? 'dark' : 'light'} mode`}
            title={theme === 'morning' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'morning' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            {!isCollapsed && (
              <span className="flex-1">{theme === 'morning' ? 'Dark Mode' : 'Light Mode'}</span>
            )}
          </button>

          {/* Notifications */}
          {!isCollapsed && (
            <button
              className="sidebar-item"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="flex-1">Notifications</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </button>
          )}

          {/* Help */}
          {!isCollapsed && (
            <button
              className="sidebar-item"
              aria-label="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="flex-1">Help</span>
            </button>
          )}

          {/* User Profile / Sign Out */}
          {userAccount && (
            <div className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              bg-slate-800/30 border border-slate-700/30
              ${isCollapsed ? 'justify-center' : ''}
            `}>
              {userAccount.photoURL ? (
                <img
                  src={userAccount.photoURL}
                  alt={userAccount.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
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
                      onClick={onSignOut}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
