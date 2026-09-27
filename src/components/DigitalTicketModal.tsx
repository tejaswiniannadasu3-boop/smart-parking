import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import {
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Navigation,
  Printer,
  QrCode,
  ShieldCheck,
  X,
  Car,
  LogOut,
  Scan,
  ScanLine,
  Camera,
  Radio,
  Sparkles,
  RotateCcw,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';
import { speechAssistant } from '../services/speechAssistant';

interface DigitalTicketModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onVehicleArrived: (bookingId: string) => void;
  onVehicleExited: (bookingId: string) => void;
  onNavigateToSlot: (slotId: string) => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  booking,
  isOpen,
  onClose,
  onVehicleArrived,
  onVehicleExited,
  onNavigateToSlot,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanPhase, setScanPhase] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'INVALID'>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [barrierAngle, setBarrierAngle] = useState(0); // 0 = horizontal (closed), -65 = raised (open)
  const [sensorLog, setSensorLog] = useState<string>('Sensor standby. Align ticket QR code.');

  useEffect(() => {
    if (!isOpen) {
      setIsScannerOpen(false);
      setScanPhase('IDLE');
      setScanProgress(0);
      setBarrierAngle(0);
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    soundEffects.playSlotSelect();
    window.print();
  };

  const handleSimulateArrival = () => {
    soundEffects.playGateOpen();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onVehicleArrived(booking.id);
  };

  const handleSimulateExit = () => {
    soundEffects.playBookingSuccess();
    onVehicleExited(booking.id);
  };

  // Automated Gate Sensor QR Scan Simulation
  const startGateSensorScan = (isValidTicket: boolean = true) => {
    setScanPhase('SCANNING');
    setScanProgress(0);
    setBarrierAngle(0);
    setSensorLog('Optical LiDAR beam active. Acquiring QR signature...');
    soundEffects.playSlotSelect();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(Math.min(progress, 100));

      if (progress === 40) {
        setSensorLog(`Decoding payload: SMARTPARK://${booking.bookingRef}...`);
        soundEffects.playSlotSelect();
      } else if (progress === 80) {
        setSensorLog(`Cross-referencing DBMS reservation for vehicle ${booking.vehiclePlate}...`);
      } else if (progress >= 100) {
        clearInterval(interval);
        if (isValidTicket) {
          setScanPhase('VERIFIED');
          setBarrierAngle(-65);
          setSensorLog(`✓ VERIFIED: Allocated Bay ${booking.slotNumber} (Zone ${booking.zoneCode}). Boom Barrier OPENED.`);
          soundEffects.playGateOpen();
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.5 },
          });

          // Trigger handleVehicleArrived passed from parent!
          onVehicleArrived(booking.id);

          if (speechAssistant.voiceNotificationsEnabled) {
            speechAssistant.speak(
              `Valid ticket detected for vehicle ${booking.vehiclePlate}. Barrier opened. Please proceed to Bay ${booking.slotNumber}.`
            );
          }
        } else {
          setScanPhase('INVALID');
          setBarrierAngle(0);
          setSensorLog('✗ SENSOR REJECT: Invalid QR token or expired reservation.');
          soundEffects.playDoubleBookingAlert();
        }
      }
    }, 280);
  };

  const formattedDate = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <QrCode size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">SmartPark Digital Pass</h2>
              <p className="text-xs text-cyan-100 font-mono">ID: {booking.bookingRef}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5 text-slate-200 overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-amber-400 animate-pulse'
                    : booking.status === 'ACTIVE'
                    ? 'bg-emerald-400'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Status: {booking.status === 'CONFIRMED' ? 'RESERVED (PENDING GATE SCAN)' : booking.status}
              </span>
            </div>
            <div className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={14} /> Verified Valid
            </div>
          </div>

          {/* Core Bay & Gate Callout */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Allocated Bay
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight mt-0.5">
                {booking.slotNumber}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zone {booking.zoneCode} • Level 1</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Entry Gate
              </div>
              <div className="text-xl font-bold text-slate-100 tracking-tight mt-1">
                {booking.entryGate}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Automated Barrier Pass</div>
            </div>
          </div>

          {/* Section 11 Exact Ticket Box */}
          <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto select-all shadow-inner">
            <div className="text-center font-bold">╔══════════════════════════════╗</div>
            <div className="text-center font-bold">║       SMARTPARK TICKET       ║</div>
            <div className="text-center font-bold">╠══════════════════════════════╣</div>
            <div>║ Vehicle : {(booking.vehiclePlate || 'TS01AB1234').padEnd(17, ' ')}║</div>
            <div>║ Slot    : {(booking.slotNumber || 'C03').padEnd(17, ' ')}║</div>
            <div>║ Zone    : {(booking.zoneCode || 'C').padEnd(17, ' ')}║</div>
            <div>║ Time    : {formattedTime.padEnd(17, ' ')}║</div>
            <div>║ Status  : {(booking.status === 'CONFIRMED' ? 'RESERVED' : booking.status).padEnd(17, ' ')}║</div>
            <div className="text-center font-bold">╚══════════════════════════════╝</div>
          </div>

          {/* Vehicle & Time Details */}
          <div className="space-y-2 text-xs border-t border-b border-slate-800 py-3.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Driver Name</span>
              <span className="font-medium text-slate-200">{booking.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vehicle Registered</span>
              <span className="font-mono font-medium text-slate-200">
                {booking.vehiclePlate} ({booking.vehicleModel})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Entry Timestamp</span>
              <span className="font-medium text-slate-200">
                {formattedDate}, {formattedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hourly Tariff</span>
              <span className="font-medium text-emerald-400">${booking.hourlyRate}/hour</span>
            </div>
            {booking.totalAmount && (
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span className="text-slate-300">Total Charged</span>
                <span className="text-emerald-400">${booking.totalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Visual QR Code Container with Click-to-Scan Gate Sensor Overlay Trigger */}
          <div className="space-y-2.5">
            <div
              onClick={() => {
                setIsScannerOpen(true);
                startGateSensorScan(true);
              }}
              className="group relative flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner border-2 border-transparent hover:border-cyan-400 cursor-pointer transition transform active:scale-[0.99]"
              title="Click to trigger QR Code Scanner Overlay at Gate Barrier Sensor"
            >
              {/* SVG QR Code */}
              <svg viewBox="0 0 140 140" className="w-36 h-36 transition group-hover:opacity-85">
                <rect x="0" y="0" width="140" height="140" fill="#ffffff" />
                {/* Top-Left Finder */}
                <rect x="10" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="16" y="16" width="23" height="23" fill="#ffffff" rx="2" />
                <rect x="22" y="22" width="11" height="11" fill="#0f172a" rx="1" />
                {/* Top-Right Finder */}
                <rect x="95" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="101" y="16" width="23" height="23" fill="#ffffff" rx="2" />
                <rect x="107" y="22" width="11" height="11" fill="#0f172a" rx="1" />
                {/* Bottom-Left Finder */}
                <rect x="10" y="95" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="16" y="101" width="23" height="23" fill="#ffffff" rx="2" />
                <rect x="22" y="107" width="11" height="11" fill="#0f172a" rx="1" />
                {/* Grid dots matrix */}
                <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="64" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="76" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="24" width="18" height="6" fill="#0f172a" />
                <rect x="76" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="12" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="24" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="36" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="52" width="12" height="12" fill="#0891b2" />
                <rect x="70" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="84" y="52" width="14" height="6" fill="#0f172a" />
                <rect x="104" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="116" y="52" width="12" height="6" fill="#0f172a" />
                <rect x="52" y="70" width="8" height="8" fill="#0f172a" />
                <rect x="66" y="70" width="14" height="8" fill="#0f172a" />
                <rect x="86" y="70" width="8" height="8" fill="#0891b2" />
                <rect x="100" y="70" width="12" height="8" fill="#0f172a" />
                <rect x="120" y="70" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="86" width="22" height="6" fill="#0f172a" />
                <rect x="80" y="86" width="6" height="6" fill="#0f172a" />
                <rect x="92" y="86" width="14" height="6" fill="#0f172a" />
                <rect x="52" y="100" width="6" height="24" fill="#0f172a" />
                <rect x="64" y="100" width="18" height="6" fill="#0f172a" />
                <rect x="88" y="100" width="8" height="8" fill="#0f172a" />
                <rect x="102" y="100" width="14" height="6" fill="#0f172a" />
                <rect x="64" y="112" width="6" height="12" fill="#0f172a" />
                <rect x="76" y="112" width="18" height="6" fill="#0f172a" />
                <rect x="100" y="112" width="12" height="12" fill="#0f172a" />
                <rect x="118" y="112" width="10" height="6" fill="#0f172a" />
              </svg>

              {/* Hover Badge */}
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition rounded-xl flex flex-col items-center justify-center gap-1.5 text-white">
                <Scan size={26} className="text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold font-mono text-cyan-300">Click to Open Gate QR Scanner</span>
                <span className="text-[10px] text-slate-300">Simulate boom barrier arrival check-in</span>
              </div>

              <div className="text-[10px] font-mono text-slate-800 font-semibold mt-1 flex items-center gap-1">
                <Scan size={12} className="text-cyan-600" />
                SCAN AT BOOM BARRIER SENSOR (CLICK TO TEST)
              </div>
            </div>

            {/* Direct Button to open Gate QR Scanner */}
            <button
              onClick={() => {
                setIsScannerOpen(true);
                startGateSensorScan(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Scan size={16} className="text-cyan-300 animate-pulse" />
              <span>Simulate Gate QR Code Sensor Scan</span>
            </button>
          </div>

          {/* Workflow Simulation Buttons */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-medium text-slate-400 text-center">
              Simulation Controls (Hardware Sensor Emulation):
            </div>
            <div className="grid grid-cols-2 gap-2">
              {booking.status === 'CONFIRMED' && (
                <button
                  onClick={() => {
                    setIsScannerOpen(true);
                    startGateSensorScan(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
                >
                  <Car size={15} /> Driver Parks (Gate Sensor)
                </button>
              )}
              {booking.status === 'ACTIVE' && (
                <button
                  onClick={handleSimulateExit}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/40"
                >
                  <LogOut size={15} /> Driver Leaves (Slot FREE)
                </button>
              )}
              <button
                onClick={() => {
                  onNavigateToSlot(booking.slotId);
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/40"
              >
                <Navigation size={15} /> 3D Route Directions
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-850 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={handlePrint}
            className="text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <Printer size={15} /> Print Ticket
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            Done
          </button>
        </div>

        {/* ========================================================================= */}
        {/* QR CODE SCANNER OVERLAY (Simulating Real Boom Barrier Gate Sensor)        */}
        {/* ========================================================================= */}
        {isScannerOpen && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Scanner HUD Header */}
            <div className="bg-slate-900 border-b border-cyan-500/30 px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 flex items-center gap-1.5 uppercase">
                    <Radio size={13} className="text-cyan-400" />
                    {booking.entryGate || 'Gate 1'} Boom Barrier Sensor Kiosk
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Optical LiDAR Scanner v4.2 • Live Bay Admission
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Close Scanner Overlay"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scanner Viewfinder Body */}
            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
              {/* Optical Camera Viewport */}
              <div className="relative mx-auto w-64 h-64 bg-slate-900/90 rounded-2xl border-2 border-dashed border-cyan-500/60 overflow-hidden flex flex-col items-center justify-center p-3 shadow-[0_0_35px_rgba(6,182,212,0.18)]">
                {/* 4 Corner Viewfinder Reticles */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

                {/* Sweeping Laser Line Animation */}
                {scanPhase === 'SCANNING' && (
                  <div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none transition-all duration-300 ease-linear"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}

                {/* Scanned QR Target Graphic */}
                <div className="p-2 bg-white rounded-lg shadow-md transition transform group-hover:scale-105">
                  <svg viewBox="0 0 140 140" className="w-36 h-36">
                    <rect x="0" y="0" width="140" height="140" fill="#ffffff" />
                    <rect x="10" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                    <rect x="16" y="16" width="23" height="23" fill="#ffffff" rx="2" />
                    <rect x="22" y="22" width="11" height="11" fill="#0f172a" rx="1" />
                    <rect x="95" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                    <rect x="101" y="16" width="23" height="23" fill="#ffffff" rx="2" />
                    <rect x="107" y="22" width="11" height="11" fill="#0f172a" rx="1" />
                    <rect x="10" y="95" width="35" height="35" fill="#0f172a" rx="4" />
                    <rect x="16" y="101" width="23" height="23" fill="#ffffff" rx="2" />
                    <rect x="22" y="107" width="11" height="11" fill="#0f172a" rx="1" />
                    <rect x="52" y="52" width="12" height="12" fill={scanPhase === 'VERIFIED' ? '#10b981' : '#0891b2'} />
                    <rect x="86" y="70" width="8" height="8" fill={scanPhase === 'VERIFIED' ? '#10b981' : '#0891b2'} />
                  </svg>
                </div>

                {/* Overlaid Scanning Reticle Label */}
                <div className="absolute bottom-2 inset-x-2 text-center text-[9px] font-mono text-cyan-300 bg-slate-950/80 rounded py-0.5 border border-cyan-500/20">
                  {scanPhase === 'SCANNING' && `OPTICAL BEAM: ${scanProgress}% LOCK`}
                  {scanPhase === 'VERIFIED' && '✓ OPTICAL SIGNATURE MATCH 100%'}
                  {scanPhase === 'INVALID' && '✗ SIGNATURE REJECTED'}
                  {scanPhase === 'IDLE' && 'ALIGN TICKET QR IN TARGET'}
                </div>
              </div>

              {/* Boom Barrier Physical Gate Visualizer */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Car size={14} className="text-cyan-400" /> Physical Barrier Status
                  </span>
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                      scanPhase === 'VERIFIED' || booking.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {scanPhase === 'VERIFIED' || booking.status === 'ACTIVE' ? 'BARRIER RAISED (OPEN)' : 'BARRIER DOWN (CLOSED)'}
                  </span>
                </div>

                {/* Animated Boom Barrier Graphic */}
                <div className="h-16 relative bg-slate-950 rounded-lg overflow-hidden flex items-center px-4 border border-slate-800">
                  {/* Stanchion post */}
                  <div className="w-5 h-12 bg-slate-700 rounded-sm flex flex-col justify-between items-center py-1 relative z-10 border border-slate-600">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        scanPhase === 'VERIFIED' || booking.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <div className="text-[7px] text-white font-mono font-black">GATE</div>
                  </div>

                  {/* Boom Barrier Arm with rotation */}
                  <div
                    className="h-2.5 flex-1 origin-left transition-transform duration-700 rounded-r shadow-lg border border-slate-900"
                    style={{
                      transform: `rotate(${barrierAngle}deg)`,
                      background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 12px, #ffffff 12px, #ffffff 24px)',
                    }}
                  />

                  {/* Vehicle Entry Prompt */}
                  <div className="absolute right-4 text-right">
                    <div className="text-[10px] text-slate-400 font-mono">TARGET BAY</div>
                    <div className="text-sm font-black text-cyan-400 font-mono">
                      {booking.slotNumber} (ZONE {booking.zoneCode})
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Log */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Sensor Telemetry Stream
                </div>
                <div
                  className={`text-xs ${
                    scanPhase === 'VERIFIED'
                      ? 'text-emerald-400 font-semibold'
                      : scanPhase === 'INVALID'
                      ? 'text-rose-400 font-semibold'
                      : 'text-cyan-300'
                  }`}
                >
                  {sensorLog}
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-850">
                  <span>Plate: {booking.vehiclePlate}</span>
                  <span>Ref: {booking.bookingRef}</span>
                </div>
              </div>
            </div>

            {/* Scanner Controls Footer */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-2 shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => startGateSensorScan(true)}
                  disabled={scanPhase === 'SCANNING'}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-1.5"
                >
                  <Scan size={15} />
                  <span>{scanPhase === 'VERIFIED' ? 'Re-scan Ticket' : 'Trigger Gate Sensor Scan'}</span>
                </button>

                <button
                  onClick={() => startGateSensorScan(false)}
                  disabled={scanPhase === 'SCANNING'}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700"
                  title="Simulate reading an invalid/unregistered QR ticket"
                >
                  Test Error
                </button>
              </div>

              {scanPhase === 'VERIFIED' && (
                <button
                  onClick={() => {
                    setIsScannerOpen(false);
                    onNavigateToSlot(booking.slotId);
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 animate-in fade-in"
                >
                  <Navigation size={15} /> Proceed with 3D Bay Navigation
                </button>
              )}

              <button
                onClick={() => setIsScannerOpen(false)}
                className="w-full py-1.5 text-slate-400 hover:text-white text-xs font-semibold text-center transition"
              >
                Back to Ticket Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

