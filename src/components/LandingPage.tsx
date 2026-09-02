import React, { useEffect, useState } from 'react';
import { AuraLogo } from './AuraLogo';
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Trust } from './landing/Trust';
import { AdminLoginModal } from './AdminLoginModal';
import { ShieldCheck, LogOut } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  userAccount?: { name: string; email: string; isGoogle: boolean; uid?: string; photoURL?: string } | null;
  isDemoMode?: boolean;
  onEnterDashboard?: () => void;
  onSignOut?: () => void;
  onAdminLogin?: () => void;
  isStaffSignedIn?: boolean;
}

const NAV_LINKS = [{ href: '#features', id: 'features', label: 'Features' }];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenAbout,
  userAccount,
  isDemoMode,
  onEnterDashboard,
  onSignOut,
  onAdminLogin,
  isStaffSignedIn = false,
}) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeSection, setActiveSection] = useState('features');
  const signedIn = Boolean((userAccount || isDemoMode) && onEnterDashboard);

  useEffect(() => {
    const ids = NAV_LINKS.map((link) => link.id);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between landscape-shell">
      <header className="landing-hero-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 min-w-0">
          <AuraLogo size="sm" inverted showSubtitle={false} className="min-w-0" />
          <div className="flex items-center justify-end gap-5 sm:gap-8 min-w-0">
            <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Page">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`landing-nav-link${activeSection === link.id ? ' is-active' : ''}`}
                  aria-current={activeSection === link.id ? 'location' : undefined}
                >
                  {link.label}
                </a>
              ))}
              <button type="button" onClick={onOpenAbout} className="landing-nav-link">
                About
              </button>
            </nav>
            {signedIn ? (
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={onEnterDashboard} className="landing-cta">
                  Enter Dashboard
                </button>
                {onSignOut && (
                  <button type="button" onClick={onSignOut} className="landing-cta !px-3" aria-label="Sign out">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={onOpenAuth} className="landing-cta shrink-0">
                Enter Dashboard
              </button>
            )}
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-4 overflow-x-auto px-4 pb-3 scrollbar-none" aria-label="Page">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`landing-nav-link whitespace-nowrap${activeSection === link.id ? ' is-active' : ''}`}
              aria-current={activeSection === link.id ? 'location' : undefined}
            >
              {link.label}
            </a>
          ))}
          <button type="button" onClick={onOpenAbout} className="landing-nav-link whitespace-nowrap">
            About
          </button>
        </nav>
      </header>

      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1 w-full min-w-0">
        <Features />
        <Trust />
      </main>

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => {
          setShowAdminModal(false);
          onAdminLogin?.();
        }}
        onNeedSignIn={() => {
          setShowAdminModal(false);
          onOpenAuth();
        }}
        isSignedIn={isStaffSignedIn}
        signedInEmail={userAccount?.email}
      />

      <footer className="border-t border-white/15 bg-[rgba(8,20,16,0.78)] backdrop-blur-[16px] py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-[#D5E4DC]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <strong className="text-[#F7FFFC]">Aura Health</strong>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAbout}
              className="text-[11px] font-semibold text-[#D5E4DC] hover:text-[var(--color-harmony)] px-3 py-1.5"
            >
              About
            </button>
            {onAdminLogin && (
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#D5E4DC] hover:text-[var(--color-harmony)] px-3 py-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Staff admin
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
