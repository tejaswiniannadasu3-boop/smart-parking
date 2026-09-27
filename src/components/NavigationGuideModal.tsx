import React from 'react';
import { ParkingSlot, ParkingZone } from '../types';
import {
  ArrowRight,
  ArrowUp,
  Car,
  Compass,
  CornerDownRight,
  MapPin,
  Navigation,
  Sparkles,
  X,
} from 'lucide-react';

interface NavigationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  zone: ParkingZone | null;
  activeGate: string;
  onArrivedAtSlot: () => void;
}

export const NavigationGuideModal: React.FC<NavigationGuideModalProps> = ({
  isOpen,
  onClose,
  slot,
  zone,
  activeGate,
  onArrivedAtSlot,
}) => {
  if (!isOpen || !slot) return null;

  const distanceMeters =
    activeGate === 'Gate 2'
      ? slot.distanceFromGate2
      : activeGate === 'Gate 3'
      ? slot.distanceFromGate3
      : activeGate === 'Gate 4'
      ? slot.distanceFromGate4
      : slot.distanceFromGate1;

  const steps = [
    {
      icon: <ArrowUp size={18} className="text-emerald-400" />,
      title: `Enter through ${activeGate}`,
      desc: 'Automatic optical plate scan and boom barrier clearance.',
      dist: '0m',
    },
    {
      icon: <ArrowUp size={18} className="text-cyan-400" />,
      title: 'Follow Central Avenue Lane',
      desc: 'Proceed at 15 km/h limit past pedestrian zebra crossing.',
      dist: '18m',
    },
    {
      icon: <CornerDownRight size={18} className="text-indigo-400" />,
      title: `Turn towards Zone ${slot.zoneCode} (${zone?.name || 'Sector'})`,
      desc: `Spot illuminated ${zone?.code || 'A'} landmark architectural pillar.`,
      dist: `${Math.round(distanceMeters * 0.7)}m`,
    },
    {
      icon: <MapPin size={18} className="text-emerald-400" />,
      title: `Arrive at Bay ${slot.slotNumber}`,
      desc: `${slot.type} designated bay with overhead sensor light.`,
      dist: `${distanceMeters}m`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Navigation size={22} className="text-cyan-200 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">Turn-by-Turn Navigation</h2>
              <p className="text-xs text-cyan-100">
                Route Guidance: {activeGate} → Bay {slot.slotNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Route Overview Metric Banner */}
        <div className="bg-slate-850 border-b border-slate-800 p-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-slate-400">Total Distance</div>
            <div className="font-bold text-white font-mono text-base mt-0.5">
              {distanceMeters} m
            </div>
          </div>
          <div>
            <div className="text-slate-400">Est. Drive Time</div>
            <div className="font-bold text-emerald-400 font-mono text-base mt-0.5">
              ~{Math.max(25, Math.round(distanceMeters * 1.5))} sec
            </div>
          </div>
          <div>
            <div className="text-slate-400">Target Level</div>
            <div className="font-bold text-cyan-400 font-mono text-base mt-0.5">Level 1</div>
          </div>
        </div>

        {/* Step-by-Step Directions */}
        <div className="p-6 space-y-4 text-slate-200 flex-1 overflow-y-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 relative">
              {idx < steps.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-800" />
              )}
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 z-10">
                {step.icon}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">{step.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{step.dist}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}

          {/* Arrived Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onArrivedAtSlot();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Car size={16} /> I Have Reached the Bay (Park Vehicle)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
