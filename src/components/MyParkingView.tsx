import React from 'react';
import { Booking, ParkingHistoryItem, AppLanguage } from '../types';
import { translations } from '../i18n/translations';
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
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface MyParkingViewProps {
  activeBooking?: Booking | null;
  parkingHistory: ParkingHistoryItem[];
  onViewDirections: () => void;
  onCancelBooking: (bookingId: string) => void;
  onShowTicket: () => void;
  onExtendBooking?: (bookingId: string, additionalMinutes: number) => void;
  onSimulateOverstay?: (bookingId: string) => void;
  onToggleSmartAutoExtend?: (bookingId: string, enabled: boolean) => void;
  onResetAutoExtensions?: (bookingId: string) => void;
  language?: AppLanguage;
}

export const MyParkingView: React.FC<MyParkingViewProps> = ({
  activeBooking,
  parkingHistory,
  onViewDirections,
  onCancelBooking,
  onShowTicket,
  onExtendBooking,
  onSimulateOverstay,
  onToggleSmartAutoExtend,
  onResetAutoExtensions,
  language = 'en',
}) => {
  const t = translations[language];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 12. MY PARKING SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Car className="text-cyan-400" size={22} /> {t.myParking.toUpperCase()}
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
            {/* Card details */}
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

            {/* Overstay & Intelligent Grace Buffer Notification */}
            {(activeBooking.isOverstaying || activeBooking.isInGracePeriod) && (
              <div className="p-4 rounded-2xl border bg-slate-950/90 border-amber-500/50 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" />
                    <span className="font-bold text-sm text-white">{t.overstayAlert}</span>
                  </div>
                  {activeBooking.isInGracePeriod ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {t.gracePeriodActive}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      +{activeBooking.overstayMinutes}m Overstay
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-300">
                  {activeBooking.isInGracePeriod ? (
                    <p className="text-emerald-300">
                      {t.gracePeriodDesc} ({activeBooking.overstayMinutes}m into 15m courtesy window). {t.noPenaltyGuarantee}.
                    </p>
                  ) : (
                    <p className="text-amber-200">
                      {t.overstayDesc} (Over by {activeBooking.overstayMinutes} mins).
                    </p>
                  )}
                </div>

                {/* ADSA Min-Heap Conflict Shield */}
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-400">{t.conflictShieldActive}: </span>
                    <span>{t.conflictShieldDesc}</span>
                  </div>
                </div>

                {/* Smart Auto-Extend Control Strip */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className={activeBooking.smartAutoExtendEnabled !== false ? 'text-cyan-400' : 'text-slate-500'} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{t.smartAutoExtend}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              activeBooking.smartAutoExtendEnabled !== false
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {activeBooking.smartAutoExtendEnabled !== false ? t.smartAutoExtendEnabled : t.smartAutoExtendDisabled}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {t.smartAutoExtendDesc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={activeBooking.smartAutoExtendEnabled !== false}
                      onClick={() => {
                        soundEffects.playSlotSelect();
                        onToggleSmartAutoExtend?.(activeBooking.id, !(activeBooking.smartAutoExtendEnabled !== false));
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                        activeBooking.smartAutoExtendEnabled !== false
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                          : 'bg-slate-750 hover:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          activeBooking.smartAutoExtendEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>
                      {t.autoExtensionsUsed}:{' '}
                      <strong className="text-cyan-300">
                        {activeBooking.autoExtensionCount || 0} / {activeBooking.maxAutoExtensions || 3} blocks used ({((activeBooking.autoExtensionCount || 0) * 30)}m)
                      </strong>
                    </span>
                    {onResetAutoExtensions && (activeBooking.autoExtensionCount || 0) > 0 && (
                      <button
                        onClick={() => onResetAutoExtensions(activeBooking.id)}
                        className="text-[9px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                      >
                        Reset (0/3)
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Extend Buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 mr-2">{t.extendNow}:</span>
                  <button
                    onClick={() => onExtendBooking?.(activeBooking.id, 30)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 transition"
                  >
                    {t.quickExtend30}
                  </button>
                  <button
                    onClick={() => onExtendBooking?.(activeBooking.id, 60)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition"
                  >
                    {t.quickExtend60}
                  </button>
                  <button
                    onClick={() => onExtendBooking?.(activeBooking.id, 120)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 font-semibold text-xs border border-slate-700 transition"
                  >
                    {t.quickExtend120}
                  </button>
                </div>
              </div>
            )}

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
