import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface DoubleBookingAlertModalProps {
  isOpen?: boolean;
  slotNumber: string;
  errorMessage?: string;
  alternatives: Array<string | { id?: string; slotNumber: string }>;
  onSelectAlternative: (altSlotNumberOrSlot: any) => void;
  onClose: () => void;
}

export const DoubleBookingAlertModal: React.FC<DoubleBookingAlertModalProps> = ({
  isOpen = true,
  slotNumber,
  errorMessage,
  alternatives,
  onSelectAlternative,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
          <AlertTriangle size={36} />
        </div>

        {/* Heading & Notice matching prompt:
            ⚠️ Slot Unavailable
            C03 is already reserved.
            Recommended alternatives:
            C02
            C04
        */}
        <div className="space-y-1.5">
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>⚠️</span> Slot Unavailable
          </h3>
          <p className="text-sm font-semibold text-amber-300">
            {slotNumber} is already reserved.
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {errorMessage || 'Our DBMS concurrency guard prevented double-booking.'}
          </p>
        </div>

        {/* Recommended Alternatives Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Recommended Alternatives:
          </span>

          <div className="flex items-center justify-center gap-3">
            {alternatives.map((alt) => {
              const label = typeof alt === 'string' ? alt : alt.slotNumber;
              return (
                <button
                  key={label}
                  onClick={() => {
                    soundEffects.playSlotSelect();
                    onSelectAlternative(alt);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/60 text-white font-mono font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5 transform active:scale-95"
                >
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  <span>Book {label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
        >
          Dismiss & Return to Map
        </button>
      </div>
    </div>
  );
};
