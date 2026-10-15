import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatMonthName, toBengaliNumber } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Settings, Calendar, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileHeaderProps {
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSettings, onOpenAdmin }) => {
  const { language, setLanguage, selectedMonth, setSelectedMonth } = useFinance();
  const { user, logout, token } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Poll pending count if admin
  useEffect(() => {
    if (user?.role !== 'admin' || !token) return;

    const checkPending = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pendingCount || 0);
        }
      } catch (e) {
        // quiet
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 20000); // every 20s
    return () => clearInterval(interval);
  }, [user, token]);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const newMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  return (
    <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-md">
      {/* Main Top Bar */}
      <div className="max-w-4xl mx-auto px-3.5 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-600 border border-teal-400/30 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
            ৳
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base tracking-tight leading-tight truncate">
              {language === 'bn' ? 'আয় ব্যয় হিসাব' : 'Ay Bey Hisab'}
            </h1>
            <p className="text-[10px] text-teal-200 truncate flex items-center gap-1">
              <span>{user?.name || user?.phone}</span>
              {user?.role === 'admin' && (
                <span className="text-[9px] bg-teal-900 text-teal-200 px-1 rounded-sm font-semibold">
                  Admin
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Month Selector Carousel */}
        <div className="flex items-center bg-teal-900/60 rounded-xl px-1 py-0.5 border border-teal-700/50 shrink-0">
          <button
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-teal-200 hover:text-white hover:bg-teal-700/60 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 px-1.5 text-xs font-semibold text-teal-50 min-w-[84px] justify-center text-center">
            <Calendar className="w-3 h-3 text-teal-300 hidden sm:inline" />
            <span className="whitespace-nowrap text-[11px] sm:text-xs">
              {formatMonthName(selectedMonth, language)}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-teal-200 hover:text-white hover:bg-teal-700/60 active:scale-95 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Admin Panel Trigger (if admin) */}
          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="relative h-8 px-2 rounded-lg bg-amber-500/90 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
              title="অ্যাডমিন অনুমোদন ড্যাশবোর্ড"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">অ্যাডমিন</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {toBengaliNumber(pendingCount)}
                </span>
              )}
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="h-8 px-2 rounded-lg bg-teal-700/60 hover:bg-teal-700 text-xs font-bold text-teal-100 border border-teal-600/50 flex items-center justify-center transition-colors active:scale-95"
            title="Switch Language"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings and Backup"
            className="w-8 h-8 rounded-lg bg-teal-700/60 hover:bg-teal-700 text-teal-100 flex items-center justify-center border border-teal-600/50 transition-colors active:scale-95"
            title="সেটিংস"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            aria-label="Logout"
            className="w-8 h-8 rounded-lg bg-teal-900/60 hover:bg-rose-900/80 text-teal-200 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            title="লগআউট"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
