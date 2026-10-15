import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, WalletId } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, Calendar, Plus, Smartphone, Landmark, Banknote, Wallet, ArrowRightLeft } from 'lucide-react';
import { getCurrentDateStr, getCurrentTimeStr, toBengaliNumber } from '../utils/formatters';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
}) => {
  const { categories, wallets, addTransaction, language, numberFormat } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<WalletId>('cash');
  const [toWallet, setToWallet] = useState<WalletId>('bkash');
  const [date, setDate] = useState<string>(getCurrentDateStr());
  const [note, setNote] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [debtDirection, setDebtDirection] = useState<'given' | 'taken'>('given');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      if (initialType === 'debt_given') {
        setDebtDirection('given');
      } else if (initialType === 'debt_taken') {
        setDebtDirection('taken');
      }
      setAmountStr('');
      setNote('');
      setContactPerson('');
      setContactPhone('');
      setDueDate('');
      setDate(getCurrentDateStr());
    }
  }, [isOpen, initialType]);

  // Set default category when type changes
  useEffect(() => {
    const available = categories.filter((c) =>
      type === 'income' ? c.type === 'income' : c.type === 'expense'
    );
    if (available.length > 0 && !available.some((c) => c.id === selectedCategory)) {
      setSelectedCategory(available[0].id);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000, 2000, 5000];

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    let finalType: TransactionType = type;
    if (type === 'debt_given' || type === 'debt_taken') {
      finalType = debtDirection === 'given' ? 'debt_given' : 'debt_taken';
    }

    // Default category for transfer/debt if none selected
    let catId = selectedCategory;
    if (finalType === 'transfer') {
      catId = 'transfer_internal';
    } else if (finalType === 'debt_given' || finalType === 'debt_taken') {
      catId = finalType === 'debt_given' ? 'cat_other_exp' : 'cat_other_inc';
    }

    addTransaction({
      type: finalType,
      amount,
      date,
      time: getCurrentTimeStr(),
      categoryId: catId,
      walletId: selectedWallet,
      toWalletId: finalType === 'transfer' ? toWallet : undefined,
      contactPerson: contactPerson.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      dueDate: dueDate || undefined,
      isSettled: false,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <h2 className="font-bold text-lg text-slate-800">
            {language === 'bn' ? 'নতুন লেনদেন লিখুন' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Transaction Type Segmented Control */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'খরচ' : 'Expense'}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'আয়' : 'Income'}
            </button>
            <button
              type="button"
              onClick={() => setType('debt_given')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                type === 'debt_given' || type === 'debt_taken'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'দেনা-পাওনা' : 'Debt'}
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'ট্রান্সফার' : 'Transfer'}
            </button>
          </div>

          {/* Debt Direction Sub-toggle if debt selected */}
          {(type === 'debt_given' || type === 'debt_taken') && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-amber-50 border border-amber-200 rounded-xl">
              <button
                type="button"
                onClick={() => setDebtDirection('given')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                  debtDirection === 'given'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                {language === 'bn' ? 'টাকা পাবো (ধার দিয়েছি)' : 'Receivable (I Lent)'}
              </button>
              <button
                type="button"
                onClick={() => setDebtDirection('taken')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                  debtDirection === 'taken'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                {language === 'bn' ? 'দেনা আছি (ধার নিয়েছি)' : 'Payable (I Borrowed)'}
              </button>
            </div>
          )}

          {/* Big Amount Input Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500">
                {language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'}
              </label>
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="text-xs text-rose-500 font-semibold hover:underline"
                >
                  {language === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-teal-800">৳</span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                required
                className="w-full text-3xl font-extrabold text-slate-900 bg-transparent outline-hidden tabular-nums"
              />
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200/80">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddQuickAmount(amt)}
                  className="px-2.5 py-1 text-xs font-bold bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-lg active:scale-95 transition-all tabular-nums"
                >
                  +{numberFormat === 'bn' ? toBengaliNumber(amt) : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector (for income & expense) */}
          {(type === 'expense' || type === 'income') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select Category'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/80 text-teal-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] leading-tight line-clamp-1">
                        {language === 'bn' ? cat.nameBn : cat.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallets Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'কোথা থেকে পাঠাচ্ছেন' : 'From Wallet'}
                </label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value as WalletId)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {language === 'bn' ? w.nameBn : w.nameEn} (৳ {w.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'কোথায় নিচ্ছেন' : 'To Wallet'}
                </label>
                <select
                  value={toWallet}
                  onChange={(e) => setToWallet(e.target.value as WalletId)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {wallets
                    .filter((w) => w.id !== selectedWallet)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {language === 'bn' ? w.nameBn : w.nameEn} (৳ {w.balance})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'bn' ? 'পেমেন্ট মেথড / ওয়ালেট' : 'Payment Method / Wallet'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {wallets.map((w) => {
                  const isSelected = selectedWallet === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWallet(w.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs block truncate leading-tight">
                        {language === 'bn' ? w.nameBn : w.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Debt Person & Contact Info */}
          {(type === 'debt_given' || type === 'debt_taken') && (
            <div className="space-y-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'ব্যক্তির নাম' : 'Person Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'যেমন: রাফিক আহমেদ' : 'e.g. Rafiq Ahmed'}
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone (Optional)'}
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'পরিশোধের সম্ভাব্য শেষ তারিখ' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Date Selector & Shortcut */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div className="flex gap-1 self-end">
              <button
                type="button"
                onClick={() => setDate(getCurrentDateStr())}
                className="px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                {language === 'bn' ? 'আজ' : 'Today'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                  setDate(y);
                }}
                className="px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                {language === 'bn' ? 'গতকাল' : 'Yesterday'}
              </button>
            </div>
          </div>

          {/* Note / Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'বিবরণ / নোট (ঐচ্ছিক)' : 'Note / Remarks (Optional)'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: মাছ বাজার, রিকশা ভাড়া...' : 'e.g. groceries, rickshaw...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-700/25 transition-all"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{language === 'bn' ? 'হিসাব সংরক্ষণ করুন' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
