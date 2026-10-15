import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { X, Globe, Hash, FileSpreadsheet, Download, Upload, RotateCcw, Wallet, Check, AlertTriangle, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { WalletId } from '../types/finance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'settings' | 'wallets';
  onOpenPublishGuide?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'settings',
  onOpenPublishGuide,
}) => {
  const {
    language,
    setLanguage,
    numberFormat,
    setNumberFormat,
    wallets,
    updateWalletBalance,
    exportToCSV,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaults,
  } = useFinance();

  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'settings' | 'wallets'>(initialTab);
  const [editingWallet, setEditingWallet] = useState<WalletId | null>(null);
  const [newBalanceStr, setNewBalanceStr] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleEditWallet = (id: WalletId, currentBal: number) => {
    setEditingWallet(id);
    setNewBalanceStr(String(currentBal));
  };

  const handleSaveWalletBalance = (id: WalletId) => {
    const val = parseFloat(newBalanceStr);
    if (!isNaN(val) && val >= 0) {
      updateWalletBalance(id, val);
    }
    setEditingWallet(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus(language === 'bn' ? 'সফলভাবে ডাটা রিস্টোর হয়েছে!' : 'Data restored successfully!');
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        setImportStatus(language === 'bn' ? 'ভুল ফাইল ফরম্যাট। অনুগ্রহ করে সঠিক JSON ব্যাকআপ ফাইল নির্বাচন করুন।' : 'Invalid file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-slate-50">
          <div className="flex gap-1 p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সেটিংস ও ব্যাকআপ' : 'Settings & Backup'}
            </button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'wallets'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'ওয়ালেট ব্যালেন্স' : 'Manage Wallets'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'settings' ? (
            <>
              {/* User Account Profile Info */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      {user?.role === 'admin' && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-sm font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 tabular-nums">{user?.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>{language === 'bn' ? 'অ্যাপের ভাষা (Language)' : 'App Language'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLanguage('bn')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      language === 'bn'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    বাংলা (Bangla)
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      language === 'en'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Number Format Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-teal-600" />
                  <span>
                    {language === 'bn' ? 'সংখ্যার ধরন (Numeral Format)' : 'Number Format'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNumberFormat('bn')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      numberFormat === 'bn'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    বাংলা সংখ্যা (১২৩৪)
                  </button>
                  <button
                    onClick={() => setNumberFormat('en')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      numberFormat === 'en'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    English Digits (1234)
                  </button>
                </div>
              </div>

              {/* Data Export & Backup */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'bn' ? 'ডাটা সংরক্ষণ ও ব্যাকআপ' : 'Data Export & Backup'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Export CSV */}
                  <button
                    onClick={exportToCSV}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'Excel / CSV এক্সপোর্ট' : 'Export CSV'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {language === 'bn' ? 'স্প্রেডশিটে ব্যবহারের জন্য' : 'Download spreadsheet'}
                      </p>
                    </div>
                  </button>

                  {/* Export Backup JSON */}
                  <button
                    onClick={exportBackupJSON}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'ফুল ব্যাকআপ ফাইল' : 'JSON Backup'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {language === 'bn' ? 'ফোনে সেভ করে রাখুন' : 'Save full state'}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Import Backup */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-2.5 rounded-xl border border-dashed border-teal-400 bg-teal-50/40 hover:bg-teal-50 text-teal-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-teal-600" />
                    <span>{language === 'bn' ? 'ব্যাকআপ ফাইল রিস্টোর করুন' : 'Restore from JSON File'}</span>
                  </button>

                  {importStatus && (
                    <p className="text-xs font-semibold text-emerald-700 mt-1.5 text-center bg-emerald-50 p-2 rounded-lg">
                      {importStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* APK & App Publish Guide */}
              {onOpenPublishGuide && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onOpenPublishGuide();
                      onClose();
                    }}
                    className="w-full p-3 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shrink-0">
                        📱
                      </div>
                      <div>
                        <p className="text-xs font-bold text-teal-900">
                          {language === 'bn' ? 'APK ফাইল তৈরি ও অ্যাপ পাবলিশ গাইড' : 'Create APK & Publish Guide'}
                        </p>
                        <p className="text-[10px] text-teal-700">
                          {language === 'bn' ? 'ফোনে সরাসরি ইনস্টল ও PWABuilder গাইড' : 'Download APK via PWABuilder'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                      দেখুন
                    </span>
                  </button>
                </div>
              )}

              {/* Reset to Factory Defaults */}
              <div className="pt-2 border-t border-slate-100">
                {showResetConfirm ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {language === 'bn'
                        ? 'আপনি কি নিশ্চিত সব ডাটা মুছে প্রাথমিক অবস্থায় ফিরতে চান?'
                        : 'Reset all data to defaults?'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resetToDefaults();
                          setShowResetConfirm(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                      >
                        {language === 'bn' ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset'}
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-rose-200 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অ্যাপ রিসেট করুন (নমুনা ডাটায় ফেরত)' : 'Reset all data to demo'}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Wallets Tab */
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'আপনার বর্তমান বাস্তব ব্যালেন্সের সাথে মিল রেখে ওয়ালেট আপডেট করতে পারেন।'
                  : 'Adjust starting or current wallet balances.'}
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {wallets.map((w) => {
                  const isEditing = editingWallet === w.id;

                  return (
                    <div key={w.id} className="p-3.5 bg-white flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {language === 'bn' ? w.nameBn : w.nameEn}
                        </p>
                        {w.accountNumber && (
                          <p className="text-[11px] text-slate-400 font-mono">
                            {w.accountNumber}
                          </p>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newBalanceStr}
                            onChange={(e) => setNewBalanceStr(e.target.value)}
                            className="w-24 p-1.5 text-xs font-bold border border-teal-500 rounded-lg text-right"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveWalletBalance(w.id)}
                            className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingWallet(null)}
                            className="w-7 h-7 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                            {formatCurrency(w.balance, language, numberFormat)}
                          </span>
                          <button
                            onClick={() => handleEditWallet(w.id, w.balance)}
                            className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg"
                          >
                            {language === 'bn' ? 'বদল' : 'Edit'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
