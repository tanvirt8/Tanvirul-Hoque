import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { Search, Trash2, Receipt, ArrowUpRight, ArrowDownLeft, HandCoins, ArrowRightLeft, Sparkles, Filter } from 'lucide-react';

interface TransactionListProps {
  onSelectReceipt: (txn: Transaction) => void;
  filterMonthOnly?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onSelectReceipt,
  filterMonthOnly = true,
}) => {
  const {
    transactions,
    getCategory,
    getWallet,
    deleteTransaction,
    selectedMonth,
    language,
    numberFormat,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Month match
      if (filterMonthOnly && !t.date.startsWith(selectedMonth)) {
        return false;
      }

      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'debt') {
          if (t.type !== 'debt_given' && t.type !== 'debt_taken') return false;
        } else if (t.type !== filterType) {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = getCategory(t.categoryId);
        const wal = getWallet(t.walletId);
        const matchNote = (t.note || '').toLowerCase().includes(q);
        const matchContact = (t.contactPerson || '').toLowerCase().includes(q);
        const matchCat =
          (cat?.nameBn || '').toLowerCase().includes(q) ||
          (cat?.nameEn || '').toLowerCase().includes(q);
        const matchWal =
          (wal?.nameBn || '').toLowerCase().includes(q) ||
          (wal?.nameEn || '').toLowerCase().includes(q);
        const matchAmt = String(t.amount).includes(q);
        const matchReceipt = t.receiptNumber.toLowerCase().includes(q);

        return matchNote || matchContact || matchCat || matchWal || matchAmt || matchReceipt;
      }

      return true;
    });
  }, [transactions, selectedMonth, filterMonthOnly, filterType, searchQuery, getCategory, getWallet]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });

    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        items: groups[date],
        dayTotalExpense: groups[date]
          .filter((t) => t.type === 'expense' || t.type === 'debt_given')
          .reduce((sum, t) => sum + t.amount, 0),
        dayTotalIncome: groups[date]
          .filter((t) => t.type === 'income' || t.type === 'debt_taken')
          .reduce((sum, t) => sum + t.amount, 0),
      }));
  }, [filteredTransactions]);

  const getTypeStyle = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return {
          sign: '+',
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50 text-emerald-600',
          icon: <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />,
        };
      case 'expense':
        return {
          sign: '-',
          color: 'text-rose-700',
          bgColor: 'bg-rose-50 text-rose-600',
          icon: <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />,
        };
      case 'debt_given':
        return {
          sign: '-',
          color: 'text-amber-800',
          bgColor: 'bg-amber-50 text-amber-600',
          icon: <HandCoins className="w-4 h-4 stroke-[2.5]" />,
        };
      case 'debt_taken':
        return {
          sign: '+',
          color: 'text-indigo-700',
          bgColor: 'bg-indigo-50 text-indigo-600',
          icon: <HandCoins className="w-4 h-4 stroke-[2.5]" />,
        };
      case 'transfer':
        return {
          sign: '',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50 text-blue-600',
          icon: <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />,
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Header */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              language === 'bn'
                ? 'বিবরণ, ক্যাটাগরি বা ভাউচার নম্বর দিয়ে খুঁজুন...'
                : 'Search by note, category or receipt...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500 shadow-2xs"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl scrollbar-none">
          {[
            { id: 'all', labelBn: 'সব লেনদেন', labelEn: 'All' },
            { id: 'expense', labelBn: 'খরচ', labelEn: 'Expense' },
            { id: 'income', labelBn: 'আয়', labelEn: 'Income' },
            { id: 'debt', labelBn: 'দেনা-পাওনা', labelEn: 'Debts' },
            { id: 'transfer', labelBn: 'ট্রান্সফার', labelEn: 'Transfer' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {confirmDeleteId && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800 animate-in fade-in duration-150">
          <span>{language === 'bn' ? 'লেনদেনটি মুছে ফেলতে চান?' : 'Delete this transaction?'}</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deleteTransaction(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
            >
              {language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-2 py-1 bg-white border border-rose-200 text-slate-700 rounded-lg font-semibold"
            >
              {language === 'bn' ? 'না' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* List Feed */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No Transactions Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {language === 'bn'
              ? 'নিচের "+" বাটনে চাপ দিয়ে দ্রুত নতুন আয়, ব্যয় বা দেনা-পাওনার হিসাব যুক্ত করুন।'
              : 'Tap the "+" button below to log a new expense, income or debt.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              {/* Group Date Header */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {formatDateBn(group.date, language, numberFormat)}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
                  {group.dayTotalIncome > 0 && (
                    <span className="text-emerald-700 font-semibold">
                      +{formatCurrency(group.dayTotalIncome, language, numberFormat)}
                    </span>
                  )}
                  {group.dayTotalExpense > 0 && (
                    <span className="text-rose-700 font-semibold">
                      -{formatCurrency(group.dayTotalExpense, language, numberFormat)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Items */}
              <div className="divide-y divide-slate-100">
                {group.items.map((txn) => {
                  const cat = getCategory(txn.categoryId);
                  const wal = getWallet(txn.walletId);
                  const toWal = txn.toWalletId ? getWallet(txn.toWalletId) : null;
                  const style = getTypeStyle(txn.type);

                  return (
                    <div
                      key={txn.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Left: Category Icon */}
                      <button
                        onClick={() => onSelectReceipt(txn)}
                        className={`w-10 h-10 rounded-xl ${style.bgColor} flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]`}
                        title="রশিদ দেখুন"
                      >
                        {txn.type === 'transfer' ? (
                          <ArrowRightLeft className="w-5 h-5" />
                        ) : (
                          <CategoryIcon
                            iconName={cat?.iconName || 'Coins'}
                            className="w-5 h-5"
                          />
                        )}
                      </button>

                      {/* Middle: Title, Wallet, Metadata */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectReceipt(txn)}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {txn.type === 'transfer'
                              ? `${language === 'bn' ? wal?.nameBn : wal?.nameEn} ➔ ${
                                  language === 'bn' ? toWal?.nameBn : toWal?.nameEn
                                }`
                              : txn.contactPerson
                              ? txn.contactPerson
                              : language === 'bn'
                              ? cat?.nameBn
                              : cat?.nameEn}
                          </p>
                          {txn.isSettled !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-sm font-semibold ${
                                txn.isSettled
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {txn.isSettled
                                ? language === 'bn'
                                  ? 'পরিশোধিত'
                                  : 'Settled'
                                : language === 'bn'
                                ? 'বাকি'
                                : 'Due'}
                            </span>
                          )}
                        </div>

                        {/* Unboxed Metadata Line with typographic separators */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                          <span>{language === 'bn' ? wal?.nameBn : wal?.nameEn}</span>
                          <span aria-hidden="true">·</span>
                          <span>{txn.time}</span>
                          {txn.note && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[120px] text-slate-600">{txn.note}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className={`text-sm font-extrabold tabular-nums ${style.color}`}>
                            {style.sign}
                            {formatCurrency(txn.amount, language, numberFormat)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {txn.receiptNumber}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => setConfirmDeleteId(txn.id)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors min-h-[44px] min-w-[36px]"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
