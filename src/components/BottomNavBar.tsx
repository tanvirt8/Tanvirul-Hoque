import React from 'react';
import { Home, ReceiptText, Plus, HandCoins, BarChart3 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export type TabType = 'home' | 'transactions' | 'debts' | 'analytics';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  const { language } = useFinance();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'home' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">
            {language === 'bn' ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* Tab 2: Transactions */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'transactions' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptText className={`w-5 h-5 ${activeTab === 'transactions' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">
            {language === 'bn' ? 'হিসাব' : 'Ledger'}
          </span>
        </button>

        {/* Center: Quick Add Button */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={onOpenAddModal}
            aria-label="Add transaction"
            className="w-13 h-13 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-teal-600/35 border-4 border-white transition-transform"
          >
            <Plus className="w-7 h-7 stroke-[2.8]" />
          </button>
        </div>

        {/* Tab 4: Debts / Hawlat */}
        <button
          onClick={() => onChangeTab('debts')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'debts' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HandCoins className={`w-5 h-5 ${activeTab === 'debts' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">
            {language === 'bn' ? 'দেনা-পাওনা' : 'Debts'}
          </span>
        </button>

        {/* Tab 5: Analytics / Report */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
            activeTab === 'analytics' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'analytics' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">
            {language === 'bn' ? 'রিপোর্ট' : 'Reports'}
          </span>
        </button>
      </div>
    </nav>
  );
};
