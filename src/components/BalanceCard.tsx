import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, HandCoins, Smartphone, Landmark, Banknote, Wallet as WalletIcon } from 'lucide-react';
import { TransactionType, WalletId } from '../types/finance';

interface BalanceCardProps {
  onQuickAction: (type: TransactionType) => void;
  onManageWallets: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ onQuickAction, onManageWallets }) => {
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    wallets,
    language,
    numberFormat,
  } = useFinance();

  const [showBalance, setShowBalance] = useState<boolean>(true);

  const getWalletIcon = (iconName: string) => {
    switch (iconName) {
      case 'Banknote': return <Banknote className="w-4 h-4" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-pink-500" />;
      case 'SmartphoneNfc': return <Smartphone className="w-4 h-4 text-amber-500" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-blue-500" />;
      default: return <WalletIcon className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary Balance Container */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white rounded-3xl p-5 shadow-lg shadow-teal-900/20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        {/* Top row: Label & Privacy Eye Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-teal-100 uppercase tracking-wider">
              {language === 'bn' ? 'মোট বর্তমান ব্যালেন্স' : 'Total Net Balance'}
            </span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-teal-100 active:scale-95 transition-all"
            title={showBalance ? 'ব্যালেন্স লুকান' : 'ব্যালেন্স দেখুন'}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Large Amount */}
        <div className="mt-2 mb-4">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums flex items-baseline gap-1">
            {showBalance ? (
              formatCurrency(totalBalance, language, numberFormat)
            ) : (
              <span className="tracking-widest text-teal-200">৳ ••••••••</span>
            )}
          </div>
        </div>

        {/* Monthly Income vs Expense Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-teal-600/50">
          {/* Monthly Income */}
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-teal-200 leading-none">
                {language === 'bn' ? 'মাসের মোট আয়' : 'Monthly Income'}
              </p>
              <p className="text-sm font-bold text-white tabular-nums truncate mt-1">
                {showBalance ? formatCurrency(monthlyIncome, language, numberFormat) : '৳ ••••'}
              </p>
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-teal-200 leading-none">
                {language === 'bn' ? 'মাসের মোট খরচ' : 'Monthly Expense'}
              </p>
              <p className="text-sm font-bold text-white tabular-nums truncate mt-1">
                {showBalance ? formatCurrency(monthlyExpense, language, numberFormat) : '৳ ••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Net Savings Badge if any */}
        <div className="mt-3 flex items-center justify-between text-xs text-teal-100 bg-teal-900/40 rounded-xl px-3 py-1.5 border border-teal-600/40">
          <span>{language === 'bn' ? 'চলতি মাসের সঞ্চয় / স্থিতি:' : 'Monthly Net Savings:'}</span>
          <span className={`font-bold tabular-nums ${monthlySavings >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {showBalance ? formatCurrency(monthlySavings, language, numberFormat) : '••••'}
          </span>
        </div>
      </div>

      {/* Quick Action Buttons Row */}
      <div className="grid grid-cols-4 gap-2">
        {/* Quick Add Expense */}
        <button
          onClick={() => onQuickAction('expense')}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200/80 shadow-xs active:scale-95 transition-all text-slate-800"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold whitespace-nowrap">
            {language === 'bn' ? '+ খরচ' : '+ Expense'}
          </span>
        </button>

        {/* Quick Add Income */}
        <button
          onClick={() => onQuickAction('income')}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 shadow-xs active:scale-95 transition-all text-slate-800"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold whitespace-nowrap">
            {language === 'bn' ? '+ আয়' : '+ Income'}
          </span>
        </button>

        {/* Quick Add Debt */}
        <button
          onClick={() => onQuickAction('debt_given')}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200/80 shadow-xs active:scale-95 transition-all text-slate-800"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
            <HandCoins className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold whitespace-nowrap">
            {language === 'bn' ? 'দেনা-পাওনা' : 'Debt'}
          </span>
        </button>

        {/* Quick Transfer */}
        <button
          onClick={() => onQuickAction('transfer')}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 shadow-xs active:scale-95 transition-all text-slate-800"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
            <ArrowRightLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold whitespace-nowrap">
            {language === 'bn' ? 'ট্রান্সফার' : 'Transfer'}
          </span>
        </button>
      </div>

      {/* Wallets Horizontal Scroll / Preview */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">
            {language === 'bn' ? 'আমার ওয়ালেট ও একাউন্টসমূহ' : 'My Wallets & Accounts'}
          </span>
          <button
            onClick={onManageWallets}
            className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 active:underline"
          >
            {language === 'bn' ? 'ব্যালেন্স পরিবর্তন' : 'Adjust'}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="flex-shrink-0 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 min-w-[115px] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {getWalletIcon(w.iconName)}
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {language === 'bn' ? w.nameBn : w.nameEn}
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(w.balance, language, numberFormat)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
