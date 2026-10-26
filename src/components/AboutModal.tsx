/**
 * Fireland: Borneo Forest Rescue
 * About Game & Rainforest Conservation Modal
 */

import React from 'react';
import { X, TreePine, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';

interface AboutModalProps {
  language: Language;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ language, onClose }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-5 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white tracking-wider">
              {t.aboutGame}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 mt-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
            <h4 className="font-black text-sm text-emerald-300 tracking-wide mb-1 flex items-center gap-1.5">
              <span>FIRELAND: BORNEO FOREST RESCUE</span>
            </h4>
            <p className="text-slate-300">
              Game simulasi 2D top-down yang didedikasikan untuk mengangkat kesadaran konservasi hutan tropis Kalimantan, pencegahan kebakaran lahan gambut, dan perlindungan satwa endemik langka.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prinsip Game & Privasi</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>100% Offline — Semua data permainan tersimpan lokal di perangkat ponsel Anda.</li>
              <li>Tanpa Akun & Tanpa Login — Langsung main tanpa formulir atau registrasi.</li>
              <li>Tanpa Pay-to-Win — Kemajuan diperoleh murni dari dedikasi memadamkan api dan menyelamatkan satwa.</li>
              <li>Iklan Ramah Pemain — Iklan sepenuhnya opsional dan tidak mengganggu saat sedang bermain memadamkan api.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5 text-pink-400">
              <Heart className="w-4 h-4 text-pink-400 fill-current" />
              <span>Satwa Lindung Borneo</span>
            </h5>
            <p className="text-slate-400">
              Mengenalkan Orangutan (*Pongo pygmaeus*), Bekantan (*Nasalis larvatus*), dan Beruang Madu (*Helarctos malayanus*) sebagai duta ekosistem paru-paru dunia.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Versi Rilis</span>
            <span className="font-mono font-bold text-emerald-400">v1.0.0 (Production Ready)</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider active:scale-95 transition"
        >
          {t.tutup}
        </button>
      </div>
    </div>
  );
};
