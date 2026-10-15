import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { HandCoins, Phone, CheckCircle2, Clock, Plus, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '../types/finance';

interface DebtsTrackerProps {
  onOpenAddModal: () => void;
  onSelectReceipt: (txn: Transaction) => void;
}

export const DebtsTracker: React.FC<DebtsTrackerProps> = ({
  onOpenAddModal,
  onSelectReceipt,
}) => {
  const {
    transactions,
    toggleDebtSettled,
    totalReceivable,
    totalPayable,
    language,
    numberFormat,
  } = useFinance();

  const [filter, setFilter] = useState<'all' | 'receivable' | 'payable' | 'settled'>('all');

  const debtTransactions = transactions.filter(
    (t) => t.type === 'debt_given' || t.type === 'debt_taken'
  );

  const filteredDebts = debtTransactions.filter((t) => {
    if (filter === 'receivable') return t.type === 'debt_given' && !t.isSettled;
    if (filter === 'payable') return t.type === 'debt_taken' && !t.isSettled;
    if (filter === 'settled') return t.isSettled;
    return true; // 'all'
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Top Debt Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Receivable (টাকা পাবো) */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'bn' ? 'টাকা পাবো' : 'Total Receivable'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 tabular-nums">
            {formatCurrency(totalReceivable, language, numberFormat)}
          </p>
          <span className="text-[11px] text-emerald-700">
            {language === 'bn' ? 'অন্যদের কাছে পাওনা' : 'Owed to you'}
          </span>
        </div>

        {/* Payable (দেনা দিতে হবে) */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-4">
          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold mb-1">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'bn' ? 'দেনা আছি' : 'Total Payable'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-900 tabular-nums">
            {formatCurrency(totalPayable, language, numberFormat)}
          </p>
          <span className="text-[11px] text-rose-700">
            {language === 'bn' ? 'অন্যদের পরিশোধ করতে হবে' : 'You owe to others'}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Quick Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
          {[
            { id: 'all', labelBn: 'সব', labelEn: 'All' },
            { id: 'receivable', labelBn: 'পাবো', labelEn: 'Receivable' },
            { id: 'payable', labelBn: 'দিতে হবে', labelEn: 'Payable' },
            { id: 'settled', labelBn: 'পরিশোধিত', labelEn: 'Settled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenAddModal}
          className="h-9 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{language === 'bn' ? 'নতুন দেনা-পাওনা' : 'Add Debt'}</span>
        </button>
      </div>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <HandCoins className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'bn' ? 'কোনো দেনা-পাওনার হিসাব নেই' : 'No Debt Records Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {language === 'bn'
              ? 'কাউকে টাকা ধার দিলে বা কারো কাছ থেকে ধার নিলে এখানে লিখে রাখুন।'
              : 'Keep track of money lent or borrowed easily.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((item) => {
            const isReceivable = item.type === 'debt_given';
            const isOverdue =
              !item.isSettled && item.dueDate && item.dueDate < todayStr;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border shadow-2xs transition-all ${
                  item.isSettled
                    ? 'border-slate-200 opacity-75'
                    : isReceivable
                    ? 'border-emerald-200/80'
                    : 'border-rose-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.contactPerson || (language === 'bn' ? 'নামহীন ব্যক্তি' : 'Unknown')}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isReceivable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isReceivable
                          ? language === 'bn'
                            ? 'টাকা পাবো'
                            : 'I Will Get'
                          : language === 'bn'
                          ? 'দেনা আছি'
                          : 'I Owe'}
                      </span>
                    </div>

                    {/* Unboxed Metadata with · separator */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span>{formatDateBn(item.date, language, numberFormat)}</span>
                      {item.note && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 line-clamp-1">{item.note}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p
                      className={`text-base font-extrabold tabular-nums ${
                        isReceivable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(item.amount, language, numberFormat)}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.receiptNumber}
                    </span>
                  </div>
                </div>

                {/* Due Date & Overdue Highlight */}
                {item.dueDate && (
                  <div className="flex items-center gap-1 text-xs mt-1 mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">
                      {language === 'bn' ? 'মেয়াদ:' : 'Due:'}
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {formatDateBn(item.dueDate, language, numberFormat)}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-sm ml-1 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        {language === 'bn' ? 'মেয়াদ শেষ' : 'Overdue'}
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {/* Phone Call link if number present */}
                  {item.contactPhone ? (
                    <a
                      href={`tel:${item.contactPhone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-lg active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{item.contactPhone}</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => onSelectReceipt(item)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                    >
                      {language === 'bn' ? 'ভাউচার দেখুন' : 'View Voucher'}
                    </button>
                  )}

                  {/* Toggle Settled Status */}
                  <button
                    onClick={() => toggleDebtSettled(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all ${
                      item.isSettled
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-teal-700 text-white hover:bg-teal-800 shadow-2xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {item.isSettled
                        ? language === 'bn'
                          ? 'পরিশোধ সম্পন্ন (হিসাব বন্ধ)'
                          : 'Settled'
                        : language === 'bn'
                        ? 'পরিশোধ চিহ্নিত করুন'
                        : 'Mark Paid'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
