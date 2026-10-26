/**
 * Fireland: Borneo Forest Rescue
 * Mission Result Modal (Victory & Defeat)
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Flame, Heart, Coins, Play, RotateCcw, Home } from 'lucide-react';
import { Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';
import { Sound } from '../game/audio';
import { MonetizationManager } from '../game/monetization';

interface MissionResultModalProps {
  isVictory: boolean;
  language: Language;
  firesExtinguished: number;
  animalsRescued: number;
  rewardCoins: number;
  onClaim: (bonusCoins: number) => void;
  onRetry: () => void;
  onReturnToBase: () => void;
}

export const MissionResultModal: React.FC<MissionResultModalProps> = ({
  isVictory,
  language,
  firesExtinguished,
  animalsRescued,
  rewardCoins,
  onClaim,
  onRetry,
  onReturnToBase,
}) => {
  const t = TRANSLATIONS[language];
  const [bonusEarned, setBonusEarned] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  useEffect(() => {
    if (isVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#facc15', '#38bdf8'],
        });
      } catch {}
    } else {
      Sound.playMissionFailed();
    }
  }, [isVictory]);

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    Sound.playClick();
    const result = await MonetizationManager.getInstance().showRewardedAd(rewardCoins);
    setIsWatchingAd(false);
    if (result.rewardEarned) {
      Sound.playCoin();
      setBonusEarned(result.bonusCoins);
    }
  };

  const totalCoins = rewardCoins + bonusEarned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Emblem Badge */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl mb-3 border-4 ${
            isVictory
              ? 'bg-gradient-to-tr from-emerald-600 to-green-400 border-emerald-200 shadow-emerald-500/40 animate-bounce'
              : 'bg-gradient-to-tr from-rose-800 to-rose-600 border-rose-300 shadow-rose-900/50'
          }`}
        >
          {isVictory ? '🏆' : '⚠️'}
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-white tracking-wider">
          {isVictory ? t.misiBerhasil : t.misiGagal}
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-[280px]">
          {isVictory ? t.misiSelesaiKet : t.misiGagalKet}
        </p>

        {/* Mission Stats Breakdown */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Flame className="w-4 h-4 text-orange-400 fill-current" />
              <span>{t.fireExtinguished}:</span>
            </span>
            <span className="font-bold text-white font-mono">{firesExtinguished} Titik</span>
          </div>

          {animalsRescued > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Heart className="w-4 h-4 text-pink-400 fill-current" />
                <span>{t.animalsRescued}:</span>
              </span>
              <span className="font-bold text-pink-300 font-mono">{animalsRescued} Ekor</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Coins className="w-4 h-4 text-yellow-400 fill-current" />
              <span>Hadiah Koin:</span>
            </span>
            <span className="font-extrabold text-yellow-300 font-mono text-sm">
              +{totalCoins} 🪙
            </span>
          </div>
        </div>

        {/* AdMob Optional Rewarded Video Bonus */}
        {isVictory && bonusEarned === 0 && (
          <button
            onClick={handleWatchAd}
            disabled={isWatchingAd}
            className="w-full mt-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wide shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isWatchingAd ? 'Memutar Iklan Uji...' : t.tontonIklanBonus}</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full mt-4 flex flex-col gap-2">
          {isVictory ? (
            <button
              onClick={() => {
                Sound.playClick();
                onClaim(bonusEarned);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>{t.dapatkanHadiah}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  Sound.playClick();
                  onRetry();
                }}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wide shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.ulangiMisi}</span>
              </button>
              <button
                onClick={() => {
                  Sound.playClick();
                  onReturnToBase();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs tracking-wide active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>{t.returnToBase}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
