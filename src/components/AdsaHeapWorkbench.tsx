import React, { useState, useEffect } from 'react';
import { ParkingSlot, HeapNode } from '../types';
import { AdsaMinHeap } from '../services/adsaHeap';
import {
  Binary,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface AdsaHeapWorkbenchProps {
  isOpen: boolean;
  onClose: () => void;
  slots: ParkingSlot[];
  activeGate: string;
  onGateChange: (gate: string) => void;
  onSelectSlot: (slot: ParkingSlot) => void;
}

export const AdsaHeapWorkbench: React.FC<AdsaHeapWorkbenchProps> = ({
  isOpen,
  onClose,
  slots,
  activeGate,
  onGateChange,
  onSelectSlot,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [heapInstance, setHeapInstance] = useState<AdsaMinHeap | null>(null);
  const [currentNearest, setCurrentNearest] = useState<HeapNode | null>(null);
  const [selectedTraceStep, setSelectedTraceStep] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      rebuildHeap();
    }
  }, [isOpen, slots, activeGate, filterType]);

  const rebuildHeap = () => {
    const { heap, nearest } = AdsaMinHeap.buildFromSlots(
      slots,
      activeGate as any,
      filterType
    );
    setHeapInstance(heap);
    setCurrentNearest(nearest);
    setSelectedTraceStep(heap.trace.length - 1);
  };

  if (!isOpen) return null;

  const heapArray = heapInstance ? heapInstance.getHeapArray() : [];
  const trace = heapInstance ? heapInstance.trace : [];

  const handleExtractNearest = () => {
    if (!currentNearest) return;
    soundEffects.playBookingSuccess();
    onSelectSlot(currentNearest.slot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Binary size={22} className="text-emerald-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
                ADSA Min-Heap Nearest Slot Optimizer
                <span className="text-[11px] font-mono font-normal bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full text-emerald-200">
                  O(1) Peek • O(log n) Extract
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Advanced Data Structures & Algorithms Priority Queue representation for proximity-based allocation
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

        {/* Controls Bar */}
        <div className="bg-slate-850 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Entrance Gate Origin:</span>
            <div className="flex gap-1.5">
              {['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4'].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    soundEffects.playSlotSelect();
                    onGateChange(g);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    activeGate === g
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Vehicle Bay Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Bay Types</option>
              <option value="STANDARD">Standard</option>
              <option value="COMPACT">Compact</option>
              <option value="SUV">SUV</option>
              <option value="EV">EV Supercharger</option>
              <option value="ACCESSIBLE">Accessible</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-slate-200">
          {/* Top Result Card: Root of the Min-Heap */}
          <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-2xl text-emerald-400 font-mono">
                {currentNearest ? currentNearest.slot.slotNumber : '—'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Min-Heap Root Node (Nearest Available Slot)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    Distance: {currentNearest ? `${currentNearest.distance.toFixed(1)}m` : '0m'}
                  </span>
                </div>
                <div className="text-sm text-slate-300 mt-0.5">
                  Zone {currentNearest?.slot.zoneCode} • Level 1 • {currentNearest?.slot.type} Bay • $
                  {currentNearest?.slot.hourlyRate}/hr
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Computed via Manhattan/Euclidean metric from {activeGate}
                </div>
              </div>
            </div>

            <button
              onClick={handleExtractNearest}
              disabled={!currentNearest}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <Sparkles size={16} /> Allocate This Nearest Bay
            </button>
          </div>

          {/* Textbook Problem Formulation from Section 4 */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={14} /> ADSA Min-Heap Formal Model & Proof
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Array: [C03:10m, C02:25m, C04:30m, C01:40m]
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">Distance Metric Calculation:</div>
                <div className="text-slate-200">C01 → 40 meters</div>
                <div className="text-slate-200">C02 → 25 meters</div>
                <div className="text-emerald-300 font-bold">C03 → 10 meters (Minimum)</div>
                <div className="text-slate-200">C04 → 30 meters</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] flex flex-col justify-center items-center text-center">
                <div className="text-emerald-400 font-bold">C03 (10m)</div>
                <div className="text-slate-500">/   \</div>
                <div className="text-slate-300">C02 (25m)   C04 (30m)</div>
                <div className="text-[10px] text-emerald-300 mt-1 font-sans">
                  The system recommends: <strong>C03 — Nearest Available Slot</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Binary Tree Layout (Top 3 levels) */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center justify-between">
              <span>Complete Binary Heap Tree Visualization (Level 0 - 2)</span>
              <span className="text-xs text-slate-400 font-normal">
                Min-Heap Property: Parent distance ≤ Child distance
              </span>
            </h3>

            {heapArray.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No available bays matching criteria in current heap.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 py-2 select-none">
                {/* Level 0: Root (Index 0) */}
                <div className="flex justify-center">
                  <div className="relative p-2.5 bg-emerald-600/30 border-2 border-emerald-400 rounded-xl text-center min-w-[110px] shadow-lg shadow-emerald-950/50 animate-pulse">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">Root (i=0)</span>
                    <span className="font-mono font-black text-base text-white">
                      {heapArray[0]?.slot.slotNumber}
                    </span>
                    <span className="text-[10px] text-emerald-200 block font-mono">
                      {heapArray[0]?.distance.toFixed(1)}m
                    </span>
                  </div>
                </div>

                {/* Branch line */}
                <div className="w-48 h-0.5 bg-slate-700 relative -my-2">
                  <div className="absolute left-0 -top-2 w-0.5 h-4 bg-slate-700" />
                  <div className="absolute right-0 -top-2 w-0.5 h-4 bg-slate-700" />
                </div>

                {/* Level 1: Indices 1, 2 */}
                <div className="flex justify-center gap-16">
                  {[1, 2].map((idx) => {
                    const node = heapArray[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-2 bg-slate-800 border rounded-xl text-center min-w-[100px] ${
                          node ? 'border-teal-500/60' : 'border-slate-700/40 opacity-40'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block">i={idx}</span>
                        <span className="font-mono font-bold text-sm text-slate-200">
                          {node ? node.slot.slotNumber : 'Empty'}
                        </span>
                        <span className="text-[10px] text-teal-400 block font-mono">
                          {node ? `${node.distance.toFixed(1)}m` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Level 2: Indices 3, 4, 5, 6 */}
                <div className="flex justify-center gap-4 flex-wrap">
                  {[3, 4, 5, 6].map((idx) => {
                    const node = heapArray[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-1.5 bg-slate-800/80 border rounded-lg text-center min-w-[80px] text-xs ${
                          node ? 'border-slate-600' : 'border-slate-800 opacity-30'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 block">i={idx}</span>
                        <span className="font-mono font-medium text-slate-300">
                          {node ? node.slot.slotNumber : '—'}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {node ? `${node.distance.toFixed(1)}m` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Heap Array Representation */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-2">
              Contiguous Heap Array Representation (`A[0 ... {heapArray.length - 1}]`)
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Left Child: `2i + 1` • Right Child: `2i + 2` • Parent: `floor((i - 1) / 2)`
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {heapArray.map((node, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-center border font-mono ${
                    i === 0
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">[{i}]</div>
                  <div className="text-xs font-bold">{node.slot.slotNumber}</div>
                  <div className="text-[10px] text-teal-400">{node.distance.toFixed(1)}m</div>
                </div>
              ))}
            </div>
          </div>

          {/* ADSA Execution Trace Steps */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center justify-between">
              <span>Heapify Construction & Operation Trace ({trace.length} operations)</span>
              <span className="text-xs text-slate-400">Step-by-step verification</span>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {trace.slice(-10).map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-400">
                      Step #{step.step}
                    </span>
                    <span
                      className={`font-semibold ${
                        step.action === 'EXTRACT_MIN'
                          ? 'text-cyan-400'
                          : step.action === 'INSERT'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {step.action}
                    </span>
                  </div>
                  <div className="text-slate-300 text-right flex-1">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
