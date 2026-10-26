/**
 * Fireland: Borneo Forest Rescue
 * PWA Install Prompt for Android and Mobile Devices
 */

import React, { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC<{ language: Language }> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running as standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

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

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (deferredPrompt) {
    return (
      <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-slate-900 border border-emerald-500/50 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-white">{t.pwaInstallTitle}</h4>
            <p className="text-[10px] text-emerald-200/70">{t.pwaInstallDesc}</p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wider flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.pwaInstallButton}</span>
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="text-xs text-emerald-300 underline font-medium"
        >
          Pasang di iPhone / iPad
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-emerald-500 p-5 text-center">
              <h4 className="font-bold text-white text-sm mb-2">Pasang di iPhone/iPad</h4>
              <p className="text-xs text-slate-300 mb-4">
                1. Ketuk tombol <strong>Share</strong> di bilah Safari.<br />
                2. Gulir ke bawah dan ketuk <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
