import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Command } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenCheckin: () => void;
  activeTab: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCheckin,
  activeTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchResults: SearchResult[] = [
    {
      id: 'companion',
      title: 'Companion & Health Log',
      description: 'View your health companion, stats, and check-in history',
      icon: <span className="text-lg">✨</span>,
      action: () => { onNavigate('companion'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'coach',
      title: 'AI Health Coach',
      description: 'Get personalized health insights and recommendations',
      icon: <span className="text-lg">💬</span>,
      action: () => { onNavigate('coach'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'wheel',
      title: 'Rewards Wheel',
      description: 'Spin the wheel for prizes and view your rewards',
      icon: <span className="text-lg">🎁</span>,
      action: () => { onNavigate('wheel'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'about',
      title: 'About Aura Health',
      description: 'Proof, rewards tiers, pricing, and trust policies',
      icon: <span className="text-lg">ℹ️</span>,
      action: () => { onNavigate('about'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'checkin',
      title: 'Daily Check-In',
      description: 'Log your daily health metrics and earn rewards',
      icon: <span className="text-lg">✅</span>,
      action: () => { onOpenCheckin(); onClose(); },
      category: 'Actions',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account, theme, and preferences',
      icon: <span className="text-lg">⚙️</span>,
      action: () => { onNavigate('settings'); onClose(); },
      category: 'Actions',
    },
  ];

  const filteredResults = query.trim() === ''
    ? searchResults
    : searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        filteredResults[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <div className="w-8 h-8 rounded-[4px] bg-navy flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-sunlight" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, actions, and data..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-400"
            aria-label="Search"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
            <Command className="w-3 h-3" />
            K
          </kbd>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-80 overflow-y-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
          {filteredResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            filteredResults.map((result, index) => (
              <button
                key={result.id}
                onClick={result.action}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-left transition-all duration-200
                  ${index === selectedIndex
                    ? 'bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/20 text-teal-900 dark:text-teal-100 shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }
                `}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-600">
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{result.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {result.description}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">
                    {result.category}
                  </span>
                  {index === selectedIndex && (
                    <ArrowRight className="w-4 h-4 text-teal-500" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">esc</kbd>
              Close
            </span>
          </div>
          <span>{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};
