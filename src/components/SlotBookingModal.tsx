import React, { useState } from 'react';
import { ParkingSlot, ParkingZone, User, Vehicle } from '../types';
import {
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';

interface SlotBookingModalProps {
  slot: ParkingSlot | null;
  zone: ParkingZone | null;
  user: User;
  activeGate: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (params: {
    userId: string;
    userName: string;
    vehiclePlate: string;
    vehicleModel: string;
    slotId: string;
    entryGate: string;
  }) => void;
}

export const SlotBookingModal: React.FC<SlotBookingModalProps> = ({
  slot,
  zone,
  user,
  activeGate,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>(
    user.savedVehicles[0]?.plateNumber || 'KA-01-SC-2024'
  );
  const [selectedGate, setSelectedGate] = useState<string>(activeGate);
  const [durationHours, setDurationHours] = useState<number>(2);

  if (!isOpen || !slot) return null;

  const vehicle =
    user.savedVehicles.find((v) => v.plateNumber === selectedVehiclePlate) ||
    user.savedVehicles[0];

  const estimatedTotal = slot.hourlyRate * durationHours;

  const handleBooking = () => {
    soundEffects.playBookingSuccess();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });

    onConfirmBooking({
      userId: user.id,
      userName: user.name,
      vehiclePlate: vehicle?.plateNumber || 'KA-01-SC-2024',
      vehicleModel: `${vehicle?.make || 'Vehicle'} ${vehicle?.model || ''}`,
      slotId: slot.id,
      entryGate: selectedGate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">Reserve Bay {slot.slotNumber}</h2>
              <p className="text-xs text-cyan-100">Zone {slot.zoneCode} • {zone?.name || 'Sector'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-200">
          {/* Bay Quick Specs */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Bay Type</div>
              <div className="font-bold text-cyan-400 mt-0.5">{slot.type}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hourly Tariff</div>
              <div className="font-bold text-emerald-400 mt-0.5">${slot.hourlyRate}/hr</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Distance</div>
              <div className="font-bold text-slate-200 mt-0.5">{slot.distanceFromGate1}m</div>
            </div>
          </div>

          {/* Select Vehicle */}
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Car size={14} className="text-cyan-400" /> Select Registered Vehicle:
            </label>
            <div className="space-y-1.5">
              {user.savedVehicles.map((v) => (
                <div
                  key={v.plateNumber}
                  onClick={() => setSelectedVehiclePlate(v.plateNumber)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedVehiclePlate === v.plateNumber
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold font-mono text-cyan-300">{v.plateNumber}</div>
                    <div className="text-[11px] text-slate-300">
                      {v.make} {v.model} ({v.type})
                    </div>
                  </div>
                  {selectedVehiclePlate === v.plateNumber && (
                    <CheckCircle2 size={18} className="text-cyan-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Select Origin Gate */}
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass size={14} className="text-cyan-400" /> Entering Through Mall Gate:
            </label>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-medium focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value="Gate 1">Gate 1 (North - Main Atrium)</option>
              <option value="Gate 2">Gate 2 (South - Cinema & Food Court)</option>
              <option value="Gate 3">Gate 3 (West - Hypermarket)</option>
              <option value="Gate 4">Gate 4 (East - VIP & EV Plaza)</option>
            </select>
          </div>

          {/* Duration slider */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock size={14} className="text-cyan-400" /> Estimated Parking Duration:
              </label>
              <span className="font-bold text-cyan-400 font-mono">{durationHours} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Pricing Calculation Breakdown */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Hourly Rate</span>
              <span>₹{slot.hourlyRate}.00/hr</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Duration Multiplier</span>
              <span>× {durationHours} hrs</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Double-Booking Security Lock</span>
              <span className="text-emerald-400 font-mono">DBMS GUARANTEED</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-750">
              <span>Estimated Payable</span>
              <span className="text-emerald-400 font-mono">₹{estimatedTotal}.00</span>
            </div>
          </div>

          {/* Booking Action */}
          <button
            onClick={handleBooking}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} /> Confirm & Issue Digital Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
