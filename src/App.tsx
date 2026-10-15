import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { QuickAddModal } from './components/QuickAddModal';
import { ReceiptModal } from './components/ReceiptModal';
import { DebtsTracker } from './components/DebtsTracker';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SettingsModal } from './components/SettingsModal';
import { CategoryBudgetModal } from './components/CategoryBudgetModal';
import { AdminApprovalModal } from './components/AdminApprovalModal';
import { PublishGuideModal } from './components/PublishGuideModal';
import { AuthScreen } from './components/AuthScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Transaction, TransactionType } from './types/finance';
import { Plus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { language } = useFinance();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addInitialType, setAddInitialType] = useState<TransactionType>('expense');
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'wallets'>('settings');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState(false);

  const handleOpenAddModalWithType = (type: TransactionType) => {
    setAddInitialType(type);
    setIsAddModalOpen(true);
  };

  const handleOpenManageWallets = () => {
    setSettingsInitialTab('wallets');
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Sticky Mobile Header */}
      <MobileHeader
        onOpenSettings={() => {
          setSettingsInitialTab('settings');
          setIsSettingsOpen(true);
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Top Banner for Install & App Info */}
      <div className="bg-teal-900/10 border-b border-teal-900/10 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-teal-900 font-semibold truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">
            {language === 'bn' ? `স্বাগতম, ${user?.name}` : `Welcome, ${user?.name}`}
          </span>
        </div>
        <PWAInstallButton />
      </div>

      {/* Main Container - Responsive for Mobile & Desktop */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-6 py-4 pb-24">
        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Primary Net Balance & Monthly Summary Card */}
            <BalanceCard
              onQuickAction={handleOpenAddModalWithType}
              onManageWallets={handleOpenManageWallets}
            />

            {/* Recent Transactions Section */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-slate-800">
                  {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 active:underline"
                >
                  <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Transactions Feed */}
              <TransactionList
                onSelectReceipt={(txn) => setSelectedReceipt(txn)}
                filterMonthOnly={true}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1 pb-1">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                  {language === 'bn' ? 'দৈনিক হিসাব খাতা' : 'Transaction Ledger'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'আপনার ব্যক্তিগত আয়, ব্যয় ও ট্রান্সফার' : 'Your private personal ledger'}
                </p>
              </div>

              <button
                onClick={() => handleOpenAddModalWithType('expense')}
                className="h-9 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'bn' ? 'যোগ করুন' : 'Add New'}</span>
              </button>
            </div>

            <TransactionList
              onSelectReceipt={(txn) => setSelectedReceipt(txn)}
              filterMonthOnly={true}
            />
          </div>
        )}

        {/* Tab 3: Debts Tracker */}
        {activeTab === 'debts' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="px-1 pb-1">
              <h2 className="font-extrabold text-lg text-slate-900">
                {language === 'bn' ? 'দেনা-পাওনার খাতা (হাওলাত)' : 'Debts & Loans Ledger'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'কার কাছে কত টাকা পাবেন এবং কার কত টাকা দিতে হবে'
                  : 'Manage receivables and payables with due dates'}
              </p>
            </div>

            <DebtsTracker
              onOpenAddModal={() => handleOpenAddModalWithType('debt_given')}
              onSelectReceipt={(txn) => setSelectedReceipt(txn)}
            />
          </div>
        )}

        {/* Tab 4: Analytics & Monthly Budget */}
        {activeTab === 'analytics' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="px-1 pb-1">
              <h2 className="font-extrabold text-lg text-slate-900">
                {language === 'bn' ? 'বাজেট ও খরচের রিপোর্ট' : 'Budget & Financial Reports'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'খাতভিত্তিক ব্যয় বিশ্লেষণ এবং মাসিক বাজেট মনিটরিং'
                  : 'Category breakdowns and monthly spending limits'}
              </p>
            </div>

            <AnalyticsTab onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />
          </div>
        )}
      </main>

      {/* Fixed Ergonomic Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => handleOpenAddModalWithType('expense')}
      />

      {/* Modals & Bottom Sheets */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialType={addInitialType}
      />

      <ReceiptModal
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
        onOpenPublishGuide={() => setIsPublishGuideOpen(true)}
      />

      <CategoryBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <AdminApprovalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <PublishGuideModal
        isOpen={isPublishGuideOpen}
        onClose={() => setIsPublishGuideOpen(false)}
      />
    </div>
  );
};

const RootRouter: React.FC = () => {
  const { user, isLoading, isPendingApproval } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-teal-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-700 border border-teal-500 flex items-center justify-center font-bold text-2xl animate-pulse mb-3">
          ৳
        </div>
        <p className="text-sm font-bold tracking-tight">আয় ব্যয় হিসাব লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (isPendingApproval) {
    return <PendingApprovalScreen />;
  }

  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootRouter />
    </AuthProvider>
  );
}
