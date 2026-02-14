'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogoutModal } from '@/components/LogoutModal';
import { 
  Sparkles, 
  User, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  Zap,
  Menu,
  X,
  Calculator as CalcIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="w-full top-0 z-50 absolute lg:flex lg:items-center lg:px-8 lg:py-4">
      <div className="flex max-w-6xl mx-auto w-full items-center relative justify-between h-16 px-4 py-2 bg-zinc-950/80 backdrop-blur-md border border-neutral-800 rounded-b-xl lg:rounded-xl shadow-2xl shadow-primary/5">
        
        {/* Mobile Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 text-white bg-zinc-900 border border-neutral-800 rounded-lg hover:bg-zinc-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img 
              src="/logo.png" 
              alt="Pitchdown logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">

            <Link
              href="/pricing"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                pathname === "/pricing"
                  ? "text-primary bg-primary/10"
                  : "text-gray-300 hover:text-white hover:bg-zinc-800/80"
              )}
            >
              Pricing
            </Link>
            <Link
              href="/calculator"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                pathname === "/calculator"
                  ? "text-primary bg-primary/10"
                  : "text-gray-300 hover:text-white hover:bg-zinc-800/80"
              )}
            >
              Calculator
            </Link>
          </nav>
        </div>

        {/* Right Side Actions */}
        <nav className="flex items-center gap-1 sm:gap-4">
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 pl-3 rounded-full bg-zinc-900 border border-neutral-800 hover:border-primary/50 transition-all group shadow-lg"
              >
                <div className="hidden sm:flex flex-col items-end mr-2 space-y-1">
                  <div className="flex items-center gap-3 leading-none">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest w-12 text-right">Credits</span>
                    <span className="text-[11px] font-black text-white tracking-tight min-w-[12px] text-left">{user.credits}</span>
                  </div>
                  <div className="flex items-center gap-3 leading-none">
                     <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest w-12 text-right">Plan</span>
                     <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none">{user.plan}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors overflow-hidden">
                  <User size={18} />
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isMenuOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                   <div className="px-4 py-3 border-b border-neutral-800 mb-2 bg-zinc-900/30">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Account Overview</p>
                     <div className="flex items-center justify-between">
                       <span className="text-xs text-gray-400">Total Credits</span>
                       <span className="text-xs font-bold text-primary">{user.credits}</span>
                     </div>
                   </div>
                   
                   <Link href="/dashboard/proposals" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-900 hover:text-white transition-colors">
                     <FileText size={16} className="text-primary" />
                     My Proposals
                   </Link>
                   
                   <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-900 hover:text-white transition-colors">
                     <Settings size={16} className="text-primary" />
                     My Profile
                   </Link>

                   {user.role === 'admin' && (
                     <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-900 hover:text-white transition-colors">
                       <ShieldCheck size={16} className="text-amber-400" />
                       Admin Panel
                     </Link>
                   )}

                   <div className="h-px bg-neutral-800 my-2 mx-2" />
                   
                   <button 
                    onClick={() => {
                      setShowLogoutModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                   >
                     <LogOut size={16} />
                     Logout
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-white hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20">
                  Join Free
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden mt-20 px-4" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="bg-zinc-950 border border-neutral-800 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-2">

              <Link
                href="/pricing"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  pathname === "/pricing"
                    ? "text-primary bg-primary/10"
                    : "text-gray-300 hover:text-white hover:bg-zinc-900"
                )}
              >
                <Zap size={18} />
                Pricing
              </Link>
              <Link
                href="/calculator"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  pathname === "/calculator"
                    ? "text-primary bg-primary/10"
                    : "text-gray-300 hover:text-white hover:bg-zinc-900"
                )}
              >
                <CalcIcon className="h-4.5 w-4.5" />
                Calculator
              </Link>
              
              {!user && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-800">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full text-gray-300">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-primary text-white">Join Free</Button>
                  </Link>
                </div>
              )}

              {user && (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-3 px-4 py-3 mt-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />
    </header>
  );
}
