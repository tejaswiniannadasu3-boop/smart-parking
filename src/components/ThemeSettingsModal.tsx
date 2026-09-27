import React from 'react';
import { AppTheme } from '../types';
import {
  Bell,
  Check,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  soundEnabled?: boolean;
  isMuted?: boolean;
  onToggleSound: (enabled?: any) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled?: any) => void;
  voiceNotificationsEnabled?: boolean;
  onToggleVoiceNotifications?: () => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundEnabled,
  isMuted,
  onToggleSound,
  notificationsEnabled,
  onToggleNotifications,
  voiceNotificationsEnabled,
  onToggleVoiceNotifications,
}) => {
  if (!isOpen) return null;

  const isAudioActive = soundEnabled !== undefined ? soundEnabled : !isMuted;

  const themes: { id: AppTheme; name: string; icon: string; preview: string; description: string }[] = [
    {
      id: 'light',
      name: 'Light Mode',
      icon: '☀️',
      preview: 'from-slate-100 to-white text-slate-900 border-slate-300',
      description: 'Clean, high-contrast daylight aesthetic for bright environments',
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: '🌙',
      preview: 'from-slate-950 to-slate-900 text-white border-slate-750',
      description: 'Default deep contrast dark canvas with neon telemetry accents',
    },
    {
      id: 'blue',
      name: 'Blue Theme',
      icon: '🌊',
      preview: 'from-blue-950 to-indigo-950 text-blue-100 border-blue-600/50',
      description: 'Sophisticated oceanic sapphire styling for commercial navigation',
    },
    {
      id: 'green',
      name: 'Green Theme',
      icon: '🌿',
      preview: 'from-emerald-950 to-teal-950 text-emerald-100 border-emerald-600/50',
      description: 'Eco-friendly emerald styling symbolizing sustainable EV mobility',
    },
    {
      id: 'purple',
      name: 'Purple Theme',
      icon: '🔮',
      preview: 'from-purple-950 to-slate-950 text-purple-100 border-purple-600/50',
      description: 'VIP royal purple styling tailored for premium concierge suites',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Settings → Appearance</h3>
              <p className="text-xs text-slate-400">Customize color themes, sound effects, and voice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 9 Theme Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Interface Theme
          </label>
          <div className="space-y-2">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEffects.playSlotSelect();
                    onSelectTheme(t.id);
                  }}
                  className={`w-full p-3 rounded-2xl border transition text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <span className="font-bold text-sm text-white block">{t.name}</span>
                      <span className="text-[11px] text-slate-400 block">{t.description}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 8 Sound & Notification Controls:
            Users can control:
            Sound: ON / OFF
            Notifications: ON / OFF
        */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Audio & Notification Controls
          </label>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              {isAudioActive ? (
                <Volume2 className="text-cyan-400" size={18} />
              ) : (
                <VolumeX className="text-slate-500" size={18} />
              )}
              <div>
                <span className="text-xs font-bold text-white block">Sound Effects</span>
                <span className="text-[10px] text-slate-400">Audio feedback on booking and barriers</span>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !isAudioActive;
                onToggleSound(next);
                if (next) soundEffects.playBookingSuccess();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                isAudioActive
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Sound: {isAudioActive ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <Bell className={notificationsEnabled ? 'text-amber-400' : 'text-slate-500'} size={18} />
              <div>
                <span className="text-xs font-bold text-white block">Voice Notifications</span>
                <span className="text-[10px] text-slate-400">
                  Spoken alerts for bookings & arrivals
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleNotifications(!notificationsEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                notificationsEnabled
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Notifications: {notificationsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition"
        >
          Save & Apply Appearance
        </button>
      </div>
    </div>
  );
};
