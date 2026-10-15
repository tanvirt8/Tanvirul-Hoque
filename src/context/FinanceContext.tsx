import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Transaction,
  Wallet,
  Category,
  MonthlyBudget,
  AppLanguage,
  NumberFormat,
  TransactionType,
  WalletId,
} from '../types/finance';
import { DEFAULT_WALLETS, DEFAULT_CATEGORIES, SAMPLE_TRANSACTIONS } from '../data/defaultData';
import { generateReceiptNumber } from '../utils/formatters';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  budgets: Record<string, MonthlyBudget>;
  language: AppLanguage;
  numberFormat: NumberFormat;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  setLanguage: (lang: AppLanguage) => void;
  setNumberFormat: (format: NumberFormat) => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'receiptNumber'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleDebtSettled: (id: string) => void;
  setMonthlyBudget: (month: string, total: number, catBudgets?: Record<string, number>) => void;
  updateWalletBalance: (id: WalletId, newBalance: number) => void;
  getCategory: (id: string) => Category | undefined;
  getWallet: (id: WalletId) => Wallet | undefined;
  exportToCSV: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
  syncWithServer: () => Promise<void>;
  isSyncing: boolean;
  // Computed values
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  totalReceivable: number;
  totalPayable: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const getInitialMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState<string>(getInitialMonth());
  const [language, setLanguage] = useState<AppLanguage>('bn');
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('bn');
  const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Record<string, MonthlyBudget>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const initialLoadDone = useRef<boolean>(false);
  const currentUserIdRef = useRef<string | null>(null);

  // Load user-isolated data when user logs in or switches
  useEffect(() => {
    if (!user || user.status !== 'approved') {
      // Clear data if logged out or not approved
      setTransactions([]);
      setWallets(DEFAULT_WALLETS);
      currentUserIdRef.current = null;
      initialLoadDone.current = false;
      return;
    }

    if (currentUserIdRef.current === user.id) {
      return;
    }

    currentUserIdRef.current = user.id;

    const loadUserData = async () => {
      // Check user-specific localStorage cache first for instant rendering
      const cacheKey = `ay_bey_cache_${user.id}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
          if (Array.isArray(parsed.wallets)) setWallets(parsed.wallets);
          if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
          if (parsed.budgets) setBudgets(parsed.budgets);
          if (parsed.settings?.language) setLanguage(parsed.settings.language);
          if (parsed.settings?.numberFormat) setNumberFormat(parsed.settings.numberFormat);
        }
      } catch (e) {
        console.warn('Cache parse error:', e);
      }

      // Fetch fresh isolated data from server
      if (token) {
        setIsSyncing(true);
        try {
          const res = await fetch('/api/finance/data', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const result = await res.json();
            if (result.data) {
              const d = result.data;
              setTransactions(Array.isArray(d.transactions) ? d.transactions : []);
              setWallets(Array.isArray(d.wallets) ? d.wallets : DEFAULT_WALLETS);
              setCategories(Array.isArray(d.categories) ? d.categories : DEFAULT_CATEGORIES);
              setBudgets(d.budgets || {});
              if (d.settings?.language) setLanguage(d.settings.language);
              if (d.settings?.numberFormat) setNumberFormat(d.settings.numberFormat);

              // Update cache
              localStorage.setItem(cacheKey, JSON.stringify(d));
            }
          }
        } catch (e) {
          console.warn('Network issue fetching user finance data:', e);
        } finally {
          setIsSyncing(false);
          initialLoadDone.current = true;
        }
      } else {
        initialLoadDone.current = true;
      }
    };

    loadUserData();
  }, [user, token]);

  // Sync to server and user-specific cache
  const syncWithServer = async () => {
    if (!user || !token || !initialLoadDone.current) return;

    const payload = {
      transactions,
      wallets,
      categories,
      budgets,
      settings: { language, numberFormat },
    };

    // Cache locally under user's private key
    localStorage.setItem(`ay_bey_cache_${user.id}`, JSON.stringify(payload));

    try {
      await fetch('/api/finance/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Background sync failed (offline):', e);
    }
  };

  // Auto-sync debounce
  useEffect(() => {
    if (!initialLoadDone.current || !user || !token) return;
    const timer = setTimeout(() => {
      syncWithServer();
    }, 600);
    return () => clearTimeout(timer);
  }, [transactions, wallets, categories, budgets, language, numberFormat]);

  const getCategory = (id: string) => categories.find((c) => c.id === id);
  const getWallet = (id: WalletId) => wallets.find((w) => w.id === id);

  const applyWalletDelta = (walletId: WalletId, delta: number) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: Math.max(0, w.balance + delta) } : w))
    );
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'receiptNumber'>) => {
    const newTxn: Transaction = {
      ...data,
      id: 'txn_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      receiptNumber: generateReceiptNumber(),
      createdAt: Date.now(),
    };

    // Update wallet balance
    if (newTxn.type === 'income') {
      applyWalletDelta(newTxn.walletId, newTxn.amount);
    } else if (newTxn.type === 'expense') {
      applyWalletDelta(newTxn.walletId, -newTxn.amount);
    } else if (newTxn.type === 'debt_given') {
      applyWalletDelta(newTxn.walletId, -newTxn.amount);
    } else if (newTxn.type === 'debt_taken') {
      applyWalletDelta(newTxn.walletId, newTxn.amount);
    } else if (newTxn.type === 'transfer' && newTxn.toWalletId) {
      applyWalletDelta(newTxn.walletId, -newTxn.amount);
      applyWalletDelta(newTxn.toWalletId, newTxn.amount);
    }

    setTransactions((prev) => [newTxn, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    if (target.type === 'income') {
      applyWalletDelta(target.walletId, -target.amount);
    } else if (target.type === 'expense') {
      applyWalletDelta(target.walletId, target.amount);
    } else if (target.type === 'debt_given') {
      applyWalletDelta(target.walletId, target.amount);
    } else if (target.type === 'debt_taken') {
      applyWalletDelta(target.walletId, -target.amount);
    } else if (target.type === 'transfer' && target.toWalletId) {
      applyWalletDelta(target.walletId, target.amount);
      applyWalletDelta(target.toWalletId, -target.amount);
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const toggleDebtSettled = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = !t.isSettled;
          return {
            ...t,
            isSettled: newStatus,
            settledDate: newStatus ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return t;
      })
    );
  };

  const setMonthlyBudget = (month: string, total: number, catBudgets: Record<string, number> = {}) => {
    setBudgets((prev) => ({
      ...prev,
      [month]: {
        month,
        totalBudget: total,
        categoryBudgets: catBudgets,
      },
    }));
  };

  const updateWalletBalance = (id: WalletId, newBalance: number) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, balance: Math.max(0, newBalance) } : w))
    );
  };

  const exportToCSV = () => {
    const headers = [
      language === 'bn' ? 'ভাউচার নং' : 'Receipt No',
      language === 'bn' ? 'তারিখ' : 'Date',
      language === 'bn' ? 'ধরন' : 'Type',
      language === 'bn' ? 'ক্যাটাগরি' : 'Category',
      language === 'bn' ? 'ওয়ালেট' : 'Wallet',
      language === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (BDT)',
      language === 'bn' ? 'বিবরণ' : 'Note',
      language === 'bn' ? 'ব্যক্তি/যোগাযোগ' : 'Person',
    ];

    const typeLabel = (type: TransactionType) => {
      switch (type) {
        case 'income': return language === 'bn' ? 'আয়' : 'Income';
        case 'expense': return language === 'bn' ? 'ব্যয়' : 'Expense';
        case 'debt_given': return language === 'bn' ? 'ধার দেওয়া (পাবো)' : 'Debt Given';
        case 'debt_taken': return language === 'bn' ? 'ধার গ্রহণ (দেনা)' : 'Debt Taken';
        case 'transfer': return language === 'bn' ? 'ট্রান্সফার' : 'Transfer';
      }
    };

    const rows = transactions.map((t) => {
      const cat = getCategory(t.categoryId);
      const catName = cat ? (language === 'bn' ? cat.nameBn : cat.nameEn) : 'N/A';
      const wal = getWallet(t.walletId);
      const walName = wal ? (language === 'bn' ? wal.nameBn : wal.nameEn) : t.walletId;

      return [
        `"${t.receiptNumber}"`,
        `"${t.date} ${t.time}"`,
        `"${typeLabel(t.type)}"`,
        `"${catName}"`,
        `"${walName}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        `"${t.contactPerson || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ay_Bey_Hisab_${user?.phone || 'user'}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBackupJSON = () => {
    const backupData = {
      user: { id: user?.id, name: user?.name, phone: user?.phone },
      transactions,
      wallets,
      categories,
      budgets,
      settings: { language, numberFormat },
      exportedAt: new Date().toISOString(),
      appName: 'Ay Bey Hisab',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ay_bey_hisab_backup_${user?.phone || 'user'}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions) && Array.isArray(data.wallets)) {
        setTransactions(data.transactions);
        setWallets(data.wallets);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (data.budgets) setBudgets(data.budgets);
        if (data.settings?.language) setLanguage(data.settings.language);
        if (data.settings?.numberFormat) setNumberFormat(data.settings.numberFormat);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    setTransactions([]);
    setWallets(DEFAULT_WALLETS);
    setCategories(DEFAULT_CATEGORIES);
    setLanguage('bn');
    setNumberFormat('bn');
    if (user) {
      localStorage.removeItem(`ay_bey_cache_${user.id}`);
    }
  };

  // Calculations
  const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  // Month filtered
  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpense;

  const totalReceivable = transactions
    .filter((t) => t.type === 'debt_given' && !t.isSettled)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPayable = transactions
    .filter((t) => t.type === 'debt_taken' && !t.isSettled)
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        wallets,
        categories,
        budgets,
        language,
        numberFormat,
        selectedMonth,
        setSelectedMonth,
        setLanguage,
        setNumberFormat,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleDebtSettled,
        setMonthlyBudget,
        updateWalletBalance,
        getCategory,
        getWallet,
        exportToCSV,
        exportBackupJSON,
        importBackupJSON,
        resetToDefaults,
        syncWithServer,
        isSyncing,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        totalReceivable,
        totalPayable,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
