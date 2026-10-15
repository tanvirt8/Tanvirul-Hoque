import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, RotateCw, LogOut, Phone, CheckCircle2 } from 'lucide-react';

export const PendingApprovalScreen: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');

  const handleRefresh = async () => {
    setChecking(true);
    setMsg('');
    await refreshUser();
    setTimeout(() => {
      setChecking(false);
      setMsg('স্ট্যাটাস আপডেট করা হয়েছে। এখনো অনুমোদন প্রক্রিয়াধীন রয়েছে।');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
        {/* Animated Status Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            অনুমোদনের অপেক্ষায় (Pending Approval)
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 mt-2">
            অ্যাকাউন্ট যাচাই প্রক্রিয়াধীন
          </h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            স্বাগতম <strong>{user?.name || 'ব্যবহারকারী'}</strong>! আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে। তবে সুরক্ষার স্বার্থে <strong>অ্যাডমিনের অনুমোদন ছাড়া</strong> অ্যাপে হিসাব সংরক্ষণ বা দেখা সম্ভব নয়।
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>রেজিস্টার্ড মোবাইল:</span>
            <span className="font-bold text-slate-800 tabular-nums">{user?.phone}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>অ্যাকাউন্ট স্ট্যাটাস:</span>
            <span className="font-bold text-amber-700">পেন্ডিং (অপেক্ষমান)</span>
          </div>
        </div>

        {msg && (
          <p className="text-xs text-teal-800 bg-teal-50 p-2 rounded-xl border border-teal-100 font-semibold animate-in fade-in">
            {msg}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full h-11 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs transition-all"
          >
            <RotateCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'যাচাই করা হচ্ছে...' : 'অনুমোদন হয়েছে কিনা চেক করুন'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করে ফিরে যান</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          জরুরি অনুমোদনের জন্য সরাসরি অ্যাপ অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
};
