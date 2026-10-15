import React, { useState } from 'react';
import { X, Smartphone, Globe, Download, Share2, Check, ExternalLink, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const appUrl = window.location.origin;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-teal-800 to-emerald-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">অ্যাপ হিসেবে প্রকাশ ও APK গাইড</h3>
              <p className="text-[11px] text-teal-200">How to Publish & Get APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-teal-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
          {/* App Live URL Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              আপনার অ্যাপের লাইভ ইউআরএল (Live Web App URL)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 p-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] text-slate-700 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center gap-1 shrink-0 active:scale-95 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>কপি লিংক</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 1: Instant Native WebAPK (Most Recommended) */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4>পদ্ধতি ১: সরাসরি ফোনে আসল অ্যাপের মতো ইনস্টল (WebAPK)</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              এই অ্যাপটি একটি ফুল <strong>Progressive Web App (PWA)</strong>। যেকোনো অ্যান্ড্রয়েড ফোনে ক্রোম বা ব্রাউজারে লিংকটি খুলে টপবারের <strong>"অ্যাপ ইনস্টল করুন"</strong> বোতামে চাপ দিন অথবা ব্রাউজার মেন্যু (⋮) থেকে <strong>"Install app"</strong> চাপুন।
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
              <li>ফোনের হোম স্ক্রিন ও অ্যাপ ড্রয়ারে নিজস্ব লোগোসহ আলাদা অ্যাপ হিসেবে বসে যাবে।</li>
              <li>ব্রাউজারের কোনো বার থাকবে না, ফুল-স্ক্রিন চলবে।</li>
              <li>কোনো ভারী APK ফাইল ডাউনলোড বা জটিলতার প্রয়োজন নেই।</li>
            </ul>
          </div>

          {/* Note on PWABuilder & Cloud Proxy */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-amber-900">
            <h5 className="font-bold flex items-center gap-1.5 text-xs text-amber-800">
              <span>⚠️ PWABuilder-এ কেন এরর আসছিল?</span>
            </h5>
            <p className="text-[11px] leading-relaxed text-amber-900">
              AI Studio এর প্রিভিউ লিঙ্কটি Google এর ক্লাউড সিকিউরিটি দিয়ে সুরক্ষিত। ফলে বাইরের সাইট যেমন PWABuilder এর সার্ভার এই লিঙ্কে সরাসরি ঢুকতে পারে না (403 Forbidden এরর দেয়)।
            </p>
            <p className="text-[11px] font-semibold text-emerald-800 bg-white/80 p-2 rounded-xl border border-amber-200/60">
              💡 <strong>সমাধান:</strong> আপনার কোনো APK ফাইলের বা PWABuilder-এ যাওয়ার দরকার নেই! এই অ্যাপের <strong>"অ্যাপ ইনস্টল"</strong> বাটনে চাপ দিলেই গুগল ক্রোম সরাসরি আপনার ফোনে খাঁটি অ্যান্ড্রয়েড অ্যাপ (WebAPK) তৈরি করে ইনস্টল করে দেয়!
            </p>
          </div>

          {/* Option 2: Standalone APK via PWABuilder (for public custom domain) */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Download className="w-4 h-4 text-blue-600" />
              <h4>পদ্ধতি ২: প্লে-স্টোরে আপলোড বা স্ট্যান্ডঅ্যালোন APK এর জন্য</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              আপনি যদি ভবিষ্যতে Google Play Store-এ আপলোড করতে চান, তবে কোডটি GitHub / Vercel-এ ফ্রিতে এক ক্লিকে হোস্ট করে নিলেই PWABuilder কোনো এরর ছাড়াই APK ও AAB বানিয়ে দেবে।
            </p>
          </div>

          {/* Option 3: Play Store Publishing */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <Globe className="w-4 h-4 text-purple-600" />
              <h4>পদ্ধতি ৩: গুগল প্লে স্টোরে পাবলিশ (Play Console)</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              PWABuilder থেকে তৈরি করা <strong>.aab (Android App Bundle)</strong> ফাইলটি সরাসরি আপনার Google Play Console অ্যাকাউন্টে আপলোড করে প্লে-স্টোরে লাইভ করতে পারবেন।
            </p>
          </div>

          {/* Safety Reminder */}
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              যেভাবেই ইন্সটল বা শেয়ার করুন না কেন, আপনার অনুমোদন (Admin Approval) ছাড়া কোনো ইউজার হিসাব এন্ট্রি করতে পারবে না।
            </span>
          </div>

          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs active:scale-95 transition-all"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
