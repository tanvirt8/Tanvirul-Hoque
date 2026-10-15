import React, { useState } from 'react';
import { Transaction } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { X, Printer, Share2, Check, ArrowRightLeft, ShieldCheck, Copy } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { getCategory, getWallet, language, numberFormat } = useFinance();
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const cat = getCategory(transaction.categoryId);
  const wal = getWallet(transaction.walletId);
  const toWal = transaction.toWalletId ? getWallet(transaction.toWalletId) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const typeTitle =
      transaction.type === 'income'
        ? 'আয়'
        : transaction.type === 'expense'
        ? 'ব্যয়'
        : transaction.type === 'debt_given'
        ? 'ধার প্রদান'
        : transaction.type === 'debt_taken'
        ? 'ধার গ্রহণ'
        : 'ট্রান্সফার';

    const text = `--- আয় ব্যয় হিসাব ভাউচার ---
রশিদ নং: ${transaction.receiptNumber}
তারিখ: ${transaction.date} (${transaction.time})
ধরন: ${typeTitle}
পরিমাণ: ৳ ${transaction.amount}
ক্যাটাগরি: ${cat?.nameBn || 'N/A'}
ওয়ালেট: ${wal?.nameBn || transaction.walletId}
${transaction.contactPerson ? `ব্যক্তি: ${transaction.contactPerson}\n` : ''}${
      transaction.note ? `বিবরণ: ${transaction.note}\n` : ''
    }অবস্থা: সফল লেনদেন`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeBadge = () => {
    switch (transaction.type) {
      case 'income':
        return { label: language === 'bn' ? 'আয় রশিদ' : 'Income Receipt', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'expense':
        return { label: language === 'bn' ? 'খরচের ভাউচার' : 'Expense Voucher', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'debt_given':
        return { label: language === 'bn' ? 'টাকা পাবো (হাওলাত)' : 'Receivable Memo', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'debt_taken':
        return { label: language === 'bn' ? 'দেনা রশিদ (ধার)' : 'Payable Memo', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'transfer':
        return { label: language === 'bn' ? 'ট্রান্সফার স্লিপ' : 'Transfer Slip', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
  };

  const badge = getTypeBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Decorative Header */}
        <div className="bg-teal-800 text-white p-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-900/60 hover:bg-teal-900 flex items-center justify-center text-teal-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-teal-700 mx-auto flex items-center justify-center font-bold text-lg mb-1 border border-teal-500/40">
            ৳
          </div>
          <h3 className="font-bold text-base">
            {language === 'bn' ? 'ডিজিটাল ভাউচার / রশিদ' : 'Digital Money Receipt'}
          </h3>
          <p className="text-[11px] text-teal-200 font-mono mt-0.5">
            {transaction.receiptNumber}
          </p>
        </div>

        {/* Voucher Paper Body */}
        <div className="p-5 space-y-4 bg-amber-50/20">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Amount Box */}
          <div className="text-center bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">
              {language === 'bn' ? 'পরিশোধিত টাকার পরিমাণ' : 'Total Amount'}
            </span>
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(transaction.amount, language, numberFormat)}
            </span>
          </div>

          {/* Receipt Data Table */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">
                {language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatDateBn(transaction.date, language, numberFormat)} · {transaction.time}
              </span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                {cat && <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5 text-teal-600" />}
                {language === 'bn' ? cat?.nameBn : cat?.nameEn || 'N/A'}
              </span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">
                {language === 'bn' ? 'ওয়ালেট / মাধ্যম' : 'Payment Method'}
              </span>
              <span className="font-semibold text-slate-800">
                {transaction.type === 'transfer'
                  ? `${language === 'bn' ? wal?.nameBn : wal?.nameEn} ➔ ${
                      language === 'bn' ? toWal?.nameBn : toWal?.nameEn
                    }`
                  : language === 'bn'
                  ? wal?.nameBn
                  : wal?.nameEn}
              </span>
            </div>

            {transaction.contactPerson && (
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {language === 'bn' ? 'সংশ্লিষ্ট ব্যক্তি' : 'Contact Person'}
                </span>
                <span className="font-bold text-slate-900">
                  {transaction.contactPerson} {transaction.contactPhone ? `(${transaction.contactPhone})` : ''}
                </span>
              </div>
            )}

            {transaction.dueDate && (
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {language === 'bn' ? 'পরিশোধের মেয়াদ' : 'Due Date'}
                </span>
                <span className="font-semibold text-amber-700">
                  {formatDateBn(transaction.dueDate, language, numberFormat)}
                </span>
              </div>
            )}

            {transaction.note && (
              <div className="py-2 flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium">
                  {language === 'bn' ? 'মন্তব্য / নোট' : 'Note'}
                </span>
                <span className="font-medium text-slate-700 bg-slate-50 p-2 rounded-lg mt-0.5">
                  {transaction.note}
                </span>
              </div>
            )}
          </div>

          {/* Verification stamp */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-teal-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{language === 'bn' ? 'ডিজিটাল হিসাব খাতা দ্বারা সুরক্ষিত' : 'Verified Digital Ledger'}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
