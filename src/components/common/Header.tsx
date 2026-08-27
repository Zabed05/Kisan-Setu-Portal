import React, { useState, useEffect } from 'react';
import { PortalType, Language, FarmerProfile } from '../../types';
import { 
  Building2, 
  User, 
  LogOut, 
  Languages, 
  CheckCircle2, 
  Calendar,
  Activity,
  UserCheck,
  LayoutDashboard,
  BarChart3,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Clock,
  Sprout
} from 'lucide-react';
import { translations } from '../../data/mockData';
import { formatRealDate, formatRealTimeWithSeconds } from '../../utils/dateTime';

interface HeaderProps {
  currentPortal: PortalType;
  onSelectPortal: (portal: PortalType) => void;
  language: Language;
  onToggleLanguage: () => void;
  farmer: FarmerProfile;
  onOpenVoiceAssist: () => void;
  currentView?: string;
  onNavigateView?: (view: string) => void;
  notificationCount?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onSelectPortal,
  language,
  onToggleLanguage,
  farmer,
  currentView = 'dashboard',
  onNavigateView,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(formatRealTimeWithSeconds());
  const [currentDateStr, setCurrentDateStr] = useState<string>(formatRealDate(new Date(), true));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(formatRealTimeWithSeconds());
      setCurrentDateStr(formatRealDate(new Date(), true));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const t = translations[language];

  const handleNavClick = (view: string) => {
    onNavigateView?.(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity & Active Portal Indicator */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-800 transition-colors">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 tracking-tight">Kisan Setu</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smart Mandi Procurement & Direct Payouts
              </p>
            </div>
          </button>


        </div>

        {/* Right: Actions, Portal Switcher, Language & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            id="toggle-language-btn"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-xs"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* User Sign Out */}
          {onLogout && (
            <button
              id="logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
