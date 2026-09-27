import React from 'react';
import { Booking, ParkingHistoryItem } from '../types';
import {
  Calendar,
  Car,
  Clock,
  MapPin,
  Navigation,
  QrCode,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface MyParkingViewProps {
  activeBooking?: Booking | null;
  parkingHistory: ParkingHistoryItem[];
  onViewDirections: () => void;
  onCancelBooking: (bookingId: string) => void;
  onShowTicket: () => void;
}

export const MyParkingView: React.FC<MyParkingViewProps> = ({
  activeBooking,
  parkingHistory,
  onViewDirections,
  onCancelBooking,
  onShowTicket,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 12. MY PARKING SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Car className="text-cyan-400" size={22} /> MY PARKING
            </h3>
            <p className="text-xs text-slate-400">Current active reservation and bay assignment</p>
          </div>
          {activeBooking && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              {activeBooking.status}
            </span>
          )}
        </div>

        {activeBooking ? (
          <div className="space-y-4">
            {/* Card details matching prompt:
                Vehicle: TS01AB1234
                Slot: C03
                Zone: C
                Status: Reserved
            */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Vehicle
                </span>
                <span className="font-mono font-black text-white text-base">
                  {activeBooking.vehiclePlate}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {activeBooking.vehicleModel}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Slot
                </span>
                <span className="font-mono font-black text-cyan-400 text-2xl">
                  {activeBooking.slotNumber}
                </span>
                <span className="text-[10px] text-slate-400 block">Floor 1</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Zone
                </span>
                <span className="font-mono font-black text-amber-400 text-2xl">
                  {activeBooking.zoneCode}
                </span>
                <span className="text-[10px] text-slate-400 block">Zone {activeBooking.zoneCode}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Status
                </span>
                <span className="font-bold text-emerald-400 text-sm block mt-1">
                  {activeBooking.status}
                </span>
                <span className="text-[10px] text-slate-400 block">Locked in DBMS</span>
              </div>
            </div>

            {/* Action buttons matching prompt:
                [ View Directions ]
                [ Cancel Booking ]
            */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  soundEffects.playSlotSelect();
                  onViewDirections();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Navigation size={16} /> View Directions
              </button>

              <button
                onClick={() => {
                  soundEffects.playSlotSelect();
                  onShowTicket();
                }}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-2"
              >
                <QrCode size={16} className="text-cyan-400" /> Digital Ticket
              </button>

              <button
                onClick={() => {
                  soundEffects.playCancellation();
                  onCancelBooking(activeBooking.id);
                }}
                className="py-3 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 font-bold text-xs transition flex items-center gap-1.5"
              >
                <XCircle size={16} /> Cancel Booking
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-2">
            <Car className="mx-auto text-slate-600" size={36} />
            <p className="text-sm font-semibold text-slate-300">No Active Parking Reservation</p>
            <p className="text-xs text-slate-500">
              Select an available bay from the 2D or 3D map to book a slot.
            </p>
          </div>
        )}
      </div>

      {/* 13. PARKING HISTORY SECTION */}
      {/* User prompt exact format:
          PARKING HISTORY
          12 Sep → A12 → 2 Hours
          14 Sep → B05 → 1 Hour
          18 Sep → C03 → 3 Hours
          This information is retrieved from the DBMS.
      */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="text-amber-400" size={20} /> PARKING HISTORY
            </h3>
            <p className="text-xs text-slate-400">
              Historical parking sessions retrieved securely from the DBMS relations
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {parkingHistory.length} Sessions
          </span>
        </div>

        <div className="space-y-2.5">
          {parkingHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-slate-950/70 hover:bg-slate-950 rounded-2xl border border-slate-800/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-850 flex items-center justify-center text-cyan-400 font-mono font-black text-sm">
                  {item.slotNumber}
                </div>
                <div>
                  {/* Matching: "18 Sep → C03 → 3 Hours" */}
                  <div className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                    <span className="text-slate-300">{item.date}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-cyan-400">{item.slotNumber}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-amber-300">
                      {item.durationHours} {item.durationHours === 1 ? 'Hour' : 'Hours'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Zone {item.zoneCode}</span>
                    <span>•</span>
                    <span>Vehicle: {item.vehiclePlate}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 font-mono block">
                  ${item.amountPaid} Paid
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
