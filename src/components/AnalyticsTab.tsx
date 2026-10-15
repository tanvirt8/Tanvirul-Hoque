import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatNumberOnly, formatMonthName, toBengaliNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Target, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, PieChart, Sparkles, SlidersHorizontal } from 'lucide-react';

interface AnalyticsTabProps {
  onOpenBudgetModal: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ onOpenBudgetModal }) => {
  const {
    transactions,
    categories,
    budgets,
    selectedMonth,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    language,
    numberFormat,
  } = useFinance();

  // Current month budget
  const currentBudgetObj = budgets[selectedMonth];
  const totalTargetBudget = currentBudgetObj?.totalBudget || 45000;

  // Filter current month transactions
  const monthTxns = transactions.filter((t) => t.date.startsWith(selectedMonth));

  // Category breakdown for expenses
  const categoryExpenses: Record<string, number> = {};
  monthTxns
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
    });

  const sortedCategories = Object.keys(categoryExpenses)
    .map((catId) => {
      const cat = categories.find((c) => c.id === catId);
      const amount = categoryExpenses[catId];
      const percentage = monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0;
      const catBudget = currentBudgetObj?.categoryBudgets?.[catId];

      return {
        catId,
        cat,
        amount,
        percentage,
        catBudget,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Budget calculations
  const budgetUsagePercent = totalTargetBudget > 0 ? (monthlyExpense / totalTargetBudget) * 100 : 0;
  const remainingBudget = totalTargetBudget - monthlyExpense;

  // Days in month calculation for daily allowance
  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === yearNum && now.getMonth() + 1 === monthNum;
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const currentDay = isCurrentMonth ? now.getDate() : daysInMonth;
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const dailySuggestedSpend = Math.max(0, Math.round(remainingBudget / remainingDays));

  return (
    <div className="space-y-4">
      {/* Target Budget Progress Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {language === 'bn' ? 'মাসিক বাজেট নিয়ন্ত্রণ' : 'Monthly Budget Control'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatMonthName(selectedMonth, language)}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-xl transition-colors active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বাজেট সেট' : 'Set Budget'}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="font-semibold text-slate-600">
              {language === 'bn' ? 'মোট খরচ হয়েছে:' : 'Spent:'}{' '}
              <strong className="text-slate-900 tabular-nums">
                {formatCurrency(monthlyExpense, language, numberFormat)}
              </strong>
            </span>
            <span className="text-slate-500 tabular-nums">
              {language === 'bn' ? 'বাজেট:' : 'Target:'}{' '}
              {formatCurrency(totalTargetBudget, language, numberFormat)}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 100
                  ? 'bg-rose-600'
                  : budgetUsagePercent > 80
                  ? 'bg-amber-500'
                  : 'bg-teal-600'
              }`}
              style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs mt-2">
            <span
              className={`font-bold tabular-nums ${
                budgetUsagePercent > 100 ? 'text-rose-600' : 'text-teal-800'
              }`}
            >
              {formatNumberOnly(Math.round(budgetUsagePercent), numberFormat)}%{' '}
              {language === 'bn' ? 'ব্যবহৃত' : 'Used'}
            </span>

            <span
              className={`font-bold tabular-nums ${
                remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {remainingBudget >= 0
                ? `${language === 'bn' ? 'বাকি আছে: ' : 'Remaining: '}${formatCurrency(
                    remainingBudget,
                    language,
                    numberFormat
                  )}`
                : `${language === 'bn' ? 'বাজেট অতিরিক্ত: ' : 'Over budget: '}${formatCurrency(
                    Math.abs(remainingBudget),
                    language,
                    numberFormat
                  )}`}
            </span>
          </div>
        </div>

        {/* Smart Daily Allowance Insight */}
        {isCurrentMonth && (
          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs text-teal-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {language === 'bn'
                  ? `মাসের বাকি ${toBengaliNumber(remainingDays)} দিনে আপনার দৈনিক বাজেটের পরামর্শ:`
                  : `Recommended daily spending for remaining ${remainingDays} days:`}
              </p>
              <p className="text-sm font-extrabold text-teal-800 tabular-nums mt-0.5">
                {formatCurrency(dailySuggestedSpend, language, numberFormat)}{' '}
                <span className="text-xs font-normal text-teal-600">
                  {language === 'bn' ? '/ প্রতিদিন' : '/ day'}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Income vs Expense Balance Comparison */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-teal-600" />
          <span>{language === 'bn' ? 'আয় ও ব্যয়ের অনুপাত' : 'Income vs Expense Ratio'}</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'bn' ? 'মোট আয়' : 'Income'}</span>
            </div>
            <p className="text-lg font-extrabold text-emerald-900 tabular-nums">
              {formatCurrency(monthlyIncome, language, numberFormat)}
            </p>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-1.5 text-xs text-rose-800 font-semibold mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>{language === 'bn' ? 'মোট ব্যয়' : 'Expense'}</span>
            </div>
            <p className="text-lg font-extrabold text-rose-900 tabular-nums">
              {formatCurrency(monthlyExpense, language, numberFormat)}
            </p>
          </div>
        </div>

        {/* Savings summary */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            {language === 'bn' ? 'মাসের নিট সঞ্চয় (আয় - ব্যয়)' : 'Net Savings'}
          </span>
          <span
            className={`font-extrabold text-sm tabular-nums ${
              monthlySavings >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(monthlySavings, language, numberFormat)}
          </span>
        </div>
      </div>

      {/* Category Wise Expense Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'bn' ? 'খাতভিত্তিক ব্যয়ের তালিকা' : 'Expense by Category'}
          </h3>
          <span className="text-xs text-slate-500">
            {language === 'bn'
              ? `${formatNumberOnly(sortedCategories.length, numberFormat)} টি খাত`
              : `${sortedCategories.length} Categories`}
          </span>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            {language === 'bn'
              ? 'এই মাসে এখনো কোনো খরচ যুক্ত করা হয়নি।'
              : 'No expenses recorded for this month.'}
          </p>
        ) : (
          <div className="space-y-3.5">
            {sortedCategories.map((item) => (
              <div key={item.catId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <CategoryIcon
                        iconName={item.cat?.iconName || 'ShoppingBag'}
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <span>{language === 'bn' ? item.cat?.nameBn : item.cat?.nameEn}</span>
                  </div>

                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-bold text-slate-900">
                      {formatCurrency(item.amount, language, numberFormat)}
                    </span>
                    <span className="text-slate-400 font-medium text-[11px] w-9 text-right">
                      {formatNumberOnly(Math.round(item.percentage), numberFormat)}%
                    </span>
                  </div>
                </div>

                {/* Fill bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                {/* Category specific budget indicator if defined */}
                {item.catBudget && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>
                      {language === 'bn' ? 'খাত বাজেট:' : 'Category Budget:'}{' '}
                      {formatCurrency(item.catBudget, language, numberFormat)}
                    </span>
                    <span className={item.amount > item.catBudget ? 'text-rose-600 font-bold' : ''}>
                      {item.amount > item.catBudget
                        ? language === 'bn'
                          ? 'বাজেট পার হয়েছে'
                          : 'Over budget'
                        : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
