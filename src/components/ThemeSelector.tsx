import React from 'react';
import { AppTheme } from '../types';
import { Moon, Palette, Sun } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelectTheme }) => {
  const themes: { id: AppTheme; label: string; bgClass: string; borderClass: string }[] = [
    { id: 'dark', label: 'Dark Mode', bgClass: 'bg-slate-900', borderClass: 'border-slate-700' },
    { id: 'light', label: 'Light Mode', bgClass: 'bg-slate-100', borderClass: 'border-slate-300' },
    { id: 'emerald', label: 'Emerald Green', bgClass: 'bg-emerald-950', borderClass: 'border-emerald-700' },
    { id: 'sapphire', label: 'Sapphire Blue', bgClass: 'bg-blue-950', borderClass: 'border-blue-700' },
    { id: 'cyber', label: 'Titanium Dark', bgClass: 'bg-zinc-950', borderClass: 'border-zinc-700' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            soundEffects.playSlotSelect();
            onSelectTheme(t.id);
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
            currentTheme === t.id
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={t.label}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${t.bgClass} border ${t.borderClass}`} />
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
};
