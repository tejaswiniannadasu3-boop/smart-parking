import React from 'react';
import { ParkingSlot, ParkingZone } from '../types';
import { soundEffects } from '../services/soundEffects';
import { ArrowDown, Check, Info, MapPin, Zap } from 'lucide-react';

interface Parking2DMapProps {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  onBookSlot?: (slot: ParkingSlot) => void;
  recommendedSlotId?: string | null;
  selectedGate?: string;
}

export const Parking2DMap: React.FC<Parking2DMapProps> = ({
  slots,
  zones,
  selectedSlotId,
  onSelectSlot,
  onBookSlot,
  recommendedSlotId,
  selectedGate = 'Gate 1',
}) => {
  const getZoneSlots = (zoneCode: string) => {
    return slots.filter((s) => s.zoneCode === zoneCode);
  };

  const getStatusBadge = (slot: ParkingSlot) => {
    const isSelected = selectedSlotId === slot.id;
    if (isSelected) {
      return {
        bg: 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-white',
        icon: '🔵',
        label: 'Selected',
      };
    }
    switch (slot.status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-700/80 hover:bg-emerald-600 border-emerald-500/60 text-white shadow-sm hover:scale-105',
          icon: '🟢',
          label: 'Available',
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-rose-900/70 border-rose-700/50 text-rose-200 cursor-not-allowed opacity-90',
          icon: '🔴',
          label: 'Occupied',
        };
      case 'RESERVED':
        return {
          bg: 'bg-amber-800/70 border-amber-600/50 text-amber-100 hover:bg-amber-700/80 cursor-pointer',
          icon: '🟡',
          label: 'Reserved',
        };
      default:
        return {
          bg: 'bg-slate-700 border-slate-600 text-slate-300',
          icon: '⚪',
          label: 'Unknown',
        };
    }
  };

  const renderZoneGrid = (zoneCode: string, label: string, gateLabel: string) => {
    const zoneSlots = getZoneSlots(zoneCode);
    const availableCount = zoneSlots.filter((s) => s.status === 'AVAILABLE').length;

    return (
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              {label}
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">{gateLabel}</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-slate-800 text-emerald-400 border border-emerald-900/60">
            {availableCount} free
          </span>
        </div>

        {/* 2-column or 3-column parking layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {zoneSlots.map((slot) => {
            const badge = getStatusBadge(slot);
            const isRec = recommendedSlotId === slot.id;

            return (
              <button
                key={slot.id}
                onClick={() => {
                  soundEffects.playSlotSelect();
                  onSelectSlot(slot);
                }}
                className={`p-2 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center relative ${badge.bg}`}
              >
                {isRec && (
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full shadow-md animate-bounce">
                    BEST
                  </span>
                )}
                <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm tracking-wider">
                  <span>{slot.slotNumber}</span>
                  <span className="text-xs">{badge.icon}</span>
                </div>
                <div className="text-[10px] opacity-85 mt-0.5 flex items-center gap-1">
                  <span>{slot.distanceFromGate1}m</span>
                  {slot.type === 'EV' && <Zap size={10} className="text-cyan-300" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Visual Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
            <span>🚗</span> MALL PARKING INTERACTIVE MAP
          </h3>
          <p className="text-xs text-slate-400">
            Click any slot to inspect status, calculate distance, and allocate instantly.
          </p>
        </div>

        {/* Color Legend from section 3 */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            🟢 Available
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300">
            🔴 Occupied
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300">
            🟡 Reserved
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300">
            🔵 Selected
          </span>
        </div>
      </div>

      {/* Grid mimicking the visual prompt:
               ZONE A                 ZONE B
          [A01 🟢] [A02 🔴]       [B01 🟢] [B02 🟢]
          [A03 🟢] [A04 🟡]       [B03 🔴] [B04 🟢]

                           ↓

                         ZONE C
                      [C01 🟢] [C02 🟢]
                      [C03 🔴] [C04 🟢]
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderZoneGrid('A', 'ZONE A (North)', 'Gate 1 • Retail & Fashion')}
        {renderZoneGrid('B', 'ZONE B (South)', 'Gate 2 • Cinema & Dining')}
      </div>

      {/* Central Corridor indicator */}
      <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 py-1">
        <span className="h-px w-24 bg-slate-800" />
        <span className="flex items-center gap-1 text-cyan-400">
          <ArrowDown size={14} /> CENTRAL CORRIDOR (DRIVING AISLE) <ArrowDown size={14} />
        </span>
        <span className="h-px w-24 bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderZoneGrid('C', 'ZONE C (West)', 'Gate 3 • Hypermarket & Electronics')}
        {renderZoneGrid('D', 'ZONE D (East)', 'Gate 4 • VIP & EV Charging')}
      </div>
    </div>
  );
};
