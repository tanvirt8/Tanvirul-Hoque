import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, User, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, error, clearError, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === 'login') {
      await login(phone, password);
    } else {
      await register(name, phone, password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-teal-700/30 mx-auto border border-teal-300/30">
            ৳
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">
            আয় ব্যয় হিসাব
          </h1>
          <p className="text-xs text-teal-200 mt-0.5">
            ব্যক্তিগত ও বাণিজ্যিক হিসাবের সুরক্ষিত ডিজিটাল খাতা
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              লগইন করুন
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              নতুন রেজিস্ট্রেশন
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold animate-in fade-in duration-150">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Input (Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার পূর্ণ নাম *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: তানভীর আহমেদ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মোবাইল নম্বর *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 tabular-nums"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পাসওয়ার্ড *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all text-xs"
              >
                {isLoading ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Notice about Approval Requirement */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              তথ্য সুরক্ষার জন্য যেকোনো নতুন অ্যাকাউন্ট ব্যবহারের পূর্বে অ্যাডমিনের অনুমোদন প্রয়োজন হয়।
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          সকল ব্যবহারকারীর হিসাব আলাদা এবং এনক্রিপ্ট করে সংরক্ষিত
        </p>
      </div>
    </div>
  );
};
