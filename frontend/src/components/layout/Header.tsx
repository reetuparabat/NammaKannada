'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  TrendingUp,
  Bookmark,
  WifiOff,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallAppButton } from '@/components/layout/InstallAppButton';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  kannadaLabel?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, kannadaLabel: 'ಮುಖಪುಟ' },
  { label: 'Progress', href: '/progress', icon: TrendingUp, kannadaLabel: 'ಪ್ರಗತಿ' },
  { label: 'Saved', href: '/saved', icon: Bookmark, kannadaLabel: 'ಉಳಿಸಿದವು' },
  { label: 'Offline', href: '/offline', icon: WifiOff, kannadaLabel: 'ಆಫ್‌ಲೈನ್' },
  { label: 'Admin', href: '/admin', icon: ShieldCheck, kannadaLabel: 'ನಿರ್ವಾಹಕ' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3 transition-transform duration-150 active:scale-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 ring-1 ring-amber-300/30">
            <span className="font-bold text-slate-950 text-xl leading-none select-none">
              ನ
            </span>
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-200 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-amber-400">
                Namma<span className="text-amber-400">Kannada</span>
              </span>
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                ಕನ್ನಡ
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Speak Kannada Confidently
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1.5"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-amber-500/15 text-amber-400 shadow-inner border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    active ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}
              </Link>
            );
          })}
          <div className="ml-2 pl-2 border-l border-slate-700/60 flex items-center gap-2">
            <InstallAppButton />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Hamburger & Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <InstallAppButton />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-slate-800/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-amber-400 transition-transform duration-200 rotate-90 animate-in" />
            ) : (
              <Menu className="h-6 w-6 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800/90 bg-slate-950/95 px-4 pt-3 pb-5 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-150">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    active
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800/70 text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.kannadaLabel && (
                    <span className="text-xs text-slate-400 font-normal">
                      {item.kannadaLabel}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
