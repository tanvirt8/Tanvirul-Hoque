import React, { useState, useEffect } from 'react';
import { Download, Share2, Check, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    // Check if running in standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'আয় ব্যয় হিসাব - Hishabi',
      text: 'দৈনিক আয়-ব্যয়, বাজেট ও দেনা-পাওনার ডিজিটাল হিসাব খাতা ব্যবহার করুন!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Install Button (if not already running standalone) */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            title="Install Mobile App"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>অ্যাপ ইনস্টল</span>
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShareApp}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-700 text-teal-100 text-xs font-semibold border border-teal-600/50 active:scale-95 transition-all"
          title="Share App"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>কপিড!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>শেয়ার</span>
            </>
          )}
        </button>
      </div>

      {/* Installation Guide Modal (Android Chrome & iOS Safari) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full uppercase">
                সহজ ইনস্টলেশন
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-1.5">
                ফোনে আসল অ্যাপের মতো ইনস্টল করুন
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                কোনো জটিলতা ছাড়া সরাসরি ফোনে অ্যাপ হিসেবে সংরক্ষণ করুন:
              </p>
            </div>

            {isIOS ? (
              /* iOS Safari Steps */
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-3 text-slate-700">
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ১
                  </span>
                  <span>
                    সাফারি ব্রাউজারের নিচে <strong>Share</strong> (শেয়ার আইকন) বাটনে চাপ দিন।
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ২
                  </span>
                  <span>
                    নিচে স্ক্রল করে <strong>'Add to Home Screen'</strong> এ চাপ দিন।
                  </span>
                </p>
              </div>
            ) : (
              /* Android Chrome Steps */
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-3 text-slate-700">
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ১
                  </span>
                  <span>
                    গুগল ক্রোম ব্রাউজারের উপরে ডানদিকের <strong>তিনটি ডট (⋮)</strong> মেন্যুতে চাপ দিন।
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ২
                  </span>
                  <span>
                    মেন্যু থেকে <strong>'Install app'</strong> বা <strong>'Add to Home screen'</strong> এ চাপ দিন।
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    ✓
                  </span>
                  <span>
                    ক্লিক করামাত্র এটি স্বয়ংক্রিয়ভাবে আপনার ফোনের হোম স্ক্রিনে ও অ্যাপ ড্রয়ারে খাঁটি অ্যান্ড্রয়েড অ্যাপের মতো ইনস্টল হয়ে যাবে!
                  </span>
                </p>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-teal-700/20"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};
