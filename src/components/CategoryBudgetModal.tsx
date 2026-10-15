import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthName } from '../utils/formatters';
import { X, Check, Target } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    budgets,
    setMonthlyBudget,
    selectedMonth,
    categories,
    language,
    numberFormat,
  } = useFinance();

  const currentBudget = budgets[selectedMonth] || {
    month: selectedMonth,
    totalBudget: 45000,
    categoryBudgets: {},
  };

  const [totalBudgetStr, setTotalBudgetStr] = useState<string>(
    String(currentBudget.totalBudget || 45000)
  );

  const [catBudgets, setCatBudgets] = useState<Record<string, number>>(
    currentBudget.categoryBudgets || {}
  );

  if (!isOpen) return null;

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleCatChange = (catId: string, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setCatBudgets((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalBudgetStr) || 0;
    setMonthlyBudget(selectedMonth, total, catBudgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {language === 'bn' ? 'বাজেট নির্ধারণ' : 'Set Budget Target'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatMonthName(selectedMonth, language)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4">
          {/* Total Monthly Target */}
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200">
            <label className="block text-xs font-bold text-teal-900 mb-1.5">
              {language === 'bn' ? 'মাসের মোট টার্গেট বাজেট (টাকা)' : 'Total Monthly Target Budget (BDT)'}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-teal-800">৳</span>
              <input
                type="number"
                min="0"
                step="500"
                value={totalBudgetStr}
                onChange={(e) => setTotalBudgetStr(e.target.value)}
                className="w-full text-2xl font-extrabold text-slate-900 bg-transparent outline-hidden tabular-nums"
                required
              />
            </div>
          </div>

          {/* Category-Specific Budget Caps */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'খাতভিত্তিক পৃথক বাজেট সীমা (ঐচ্ছিক)' : 'Category Specific Limits (Optional)'}
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              {language === 'bn'
                ? 'নির্দিষ্ট কোনো খাতে নির্দিষ্ট সীমার বেশি খরচ না করার জন্য টার্গেট ঠিক করুন।'
                : 'Set limits for individual categories.'}
            </p>

            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto pr-1">
              {expenseCategories.map((cat) => (
                <div key={cat.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={catBudgets[cat.id] || ''}
                      onChange={(e) => handleCatChange(cat.id, e.target.value)}
                      className="w-24 p-1.5 text-xs text-right bg-slate-50 border border-slate-200 rounded-lg font-bold tabular-nums"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'bn' ? 'বাজেট আপডেট সম্পন্ন' : 'Save Budget Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
