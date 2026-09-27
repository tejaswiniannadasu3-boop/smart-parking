import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Car,
  CheckCircle2,
  Cpu,
  Database,
  HelpCircle,
  Lock,
  Mic,
  Shield,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface LandingPageProps {
  onUserLogin?: () => void;
  onAdminLogin?: () => void;
  onCreateAccount?: () => void;
  onExploreGuest?: () => void;
  onGetStarted?: () => void;
  onOpenMap?: () => void;
  onOpenAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onUserLogin,
  onAdminLogin,
  onCreateAccount,
  onExploreGuest,
  onGetStarted,
  onOpenMap,
  onOpenAdmin,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleUser = onUserLogin || onGetStarted || onOpenMap || (() => {});
  const handleAdmin = onAdminLogin || onOpenAdmin || (() => {});
  const handleCreate = onCreateAccount || onGetStarted || (() => {});
  const handleGuest = onExploreGuest || onOpenMap || onGetStarted || (() => {});

  const workflowSteps = [
    { title: 'Open SmartPark', sub: 'Initialize live 2D/3D mall grid and sensors' },
    { title: 'User Login / Register', sub: 'Authenticate driver with vehicle profile' },
    { title: 'User Dashboard', sub: 'Access real-time occupancy and statistics' },
    { title: 'Find Parking', sub: 'Filter by wing, bay type, and proximity' },
    { title: 'Check Current Availability', sub: 'Query live DBMS slot status (Free/Busy)' },
    { title: 'Check Predicted Occupancy', sub: 'Python ML models peak arrival patterns' },
    { title: 'Select Recommended Zone', sub: 'System directs traffic toward lowest congestion' },
    { title: 'Find Nearest Slot Using Heap', sub: 'ADSA Min-Heap calculates closest Euclidean bay' },
    { title: 'Book Slot', sub: 'DBMS atomic compare-and-set prevents double booking' },
    { title: 'Receive Digital Parking Ticket', sub: 'Instant cryptographic QR pass & entrance PIN' },
    { title: 'Navigate to Parking Slot', sub: 'Turn-by-turn route directions from Gate' },
    { title: 'Park Vehicle', sub: 'Optical ground sensor confirms arrival' },
    { title: 'Slot Status → OCCUPIED', sub: 'Real-time state flips from Reserved to Occupied' },
    { title: 'Vehicle Leaves → Slot Status FREE', sub: 'Boom barrier lifts & slot resets to Available' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background ambient lighting accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/50">
            <Car size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              SmartPark
              <span className="text-[10px] font-mono font-normal bg-cyan-950 border border-cyan-700/60 text-cyan-400 px-2 py-0.5 rounded-full">
                v3.4
              </span>
            </span>
            <span className="text-xs text-slate-400 block -mt-0.5">Mall Parking Intelligence</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playSlotSelect();
            handleGuest();
          }}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
        >
          Quick Demo Preview <ArrowRight size={14} />
        </button>
      </header>

      {/* Main Landing Center Card matching prompt requirement:
              🚗 SMARTPARK
       Intelligent Parking System

          [ USER LOGIN ]
          [ ADMIN LOGIN ]
        [ CREATE ACCOUNT ]
          [ HOW IT WORKS ]
      */}
      <div className="max-w-xl w-full mx-auto my-auto z-10 text-center space-y-8 py-8 animate-in fade-in duration-500">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles size={14} className="text-cyan-400" />
            Next-Gen Shopping Mall Mobility & Allocation
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span>🚗</span> SMARTPARK
          </h1>
          <p className="text-sm sm:text-base text-cyan-300/90 font-medium">
            Intelligent Parking Management System
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Eliminating double-bookings, reducing circular traffic, and allocating optimal slots
            via ADSA Min-Heap, Python forecasting, and real-time DBMS management.
          </p>
        </div>

        {/* 4 Primary Navigation Buttons */}
        <div className="flex flex-col gap-3.5 max-w-sm mx-auto">
          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              handleUser();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <UserCheck size={18} /> USER LOGIN
          </button>

          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              handleAdmin();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-950/60 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Shield size={18} /> ADMIN LOGIN
          </button>

          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              handleCreate();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 hover:text-white font-bold text-sm transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Lock size={18} className="text-cyan-400" /> CREATE ACCOUNT
          </button>

          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              setShowHowItWorks(true);
            }}
            className="w-full py-3 px-6 rounded-2xl bg-slate-850/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <HelpCircle size={16} className="text-amber-400" /> HOW IT WORKS (WORKFLOW)
          </button>
        </div>

        {/* Technical Badges Row */}
        <div className="pt-4 border-t border-slate-850 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            DBMS & DMGT
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            ADSA Min-Heap
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            Python Predictor
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            Java/OOPJ Service
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
            3D WebGL Feature
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 z-10 py-2">
        SmartPark Shopping Mall Intelligent Allocation & Concurrency System • TS01AB1234
      </footer>

      {/* "HOW IT WORKS" Interactive Flowchart Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">SmartPark Operational Workflow</h3>
                  <p className="text-xs text-cyan-100">Step-by-step user and driver journey</p>
                </div>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800 text-xs">
              {workflowSteps.map((step, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-mono font-bold flex-shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm flex items-center justify-between">
                      <span>{step.title}</span>
                      {idx < workflowSteps.length - 1 && (
                        <ArrowDown size={14} className="text-slate-600" />
                      )}
                    </div>
                    <p className="text-slate-400 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowHowItWorks(false);
                  handleUser();
                }}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
              >
                Start Using SmartPark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
