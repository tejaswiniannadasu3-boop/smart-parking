import React, { useState } from 'react';
import { dbms } from '../services/dbmsEngine';
import { DMGTQueryPreset } from '../types';
import {
  Code,
  Database,
  GitFork,
  Layers,
  Play,
  Table,
  Terminal,
  X,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface DbmsSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbmsSchemaModal: React.FC<DbmsSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'er' | 'dmgt' | 'tables'>('er');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('q1');
  const [queryResult, setQueryResult] = useState<any[]>([]);

  if (!isOpen) return null;

  const presets = dbms.getDMGTPresets();
  const currentPreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  const handleRunQuery = (preset: DMGTQueryPreset) => {
    soundEffects.playSlotSelect();
    setSelectedPresetId(preset.id);
    setQueryResult(preset.execute());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Database size={22} className="text-indigo-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">
                DBMS Relational Architecture & ER Schema
              </h2>
              <p className="text-xs text-indigo-100">
                Entity-Relationship (ER) model, DMGT Relational Algebra operators, and integrity constraints
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

        {/* Tab Navigation */}
        <div className="bg-slate-850 border-b border-slate-800 px-6 flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('er')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'er'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork size={15} /> ER Model & Relationships
          </button>
          <button
            onClick={() => {
              setActiveTab('dmgt');
              if (queryResult.length === 0) {
                setQueryResult(currentPreset.execute());
              }
            }}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'dmgt'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={15} /> DMGT Relational Algebra Engine
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'tables'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table size={15} /> Live DBMS Table Registry
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto text-slate-200">
          {/* 1. ER Model Tab */}
          {activeTab === 'er' && (
            <div className="space-y-6">
              <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                <span className="font-semibold text-indigo-400">ER Model Specification: </span>
                Represents cardinalities across <strong>Vehicle</strong> (1:N) <strong>Booking</strong> (N:1){' '}
                <strong>Parking Slot</strong> (N:1) <strong>Parking Zone</strong>, guarded by real-time occupancy
                integrity locks.
              </div>

              {/* ER Entities Visual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Entity: Vehicle */}
                <div className="bg-slate-800/90 border-2 border-indigo-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-indigo-300">VEHICLE</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono">
                      Strong Entity
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    <li className="flex justify-between text-indigo-400 font-bold">
                      <span>• plate_number</span>
                      <span className="text-[10px] bg-indigo-900/60 px-1 rounded">PK</span>
                    </li>
                    <li className="text-slate-300">• make</li>
                    <li className="text-slate-300">• model</li>
                    <li className="text-slate-300">• type (EV/SUV/STD)</li>
                    <li className="text-slate-300">• color</li>
                    <li className="flex justify-between text-amber-400">
                      <span>• owner_id</span>
                      <span className="text-[10px] bg-amber-900/40 px-1 rounded">FK</span>
                    </li>
                  </ul>
                </div>

                {/* Entity: Booking */}
                <div className="bg-slate-800/90 border-2 border-cyan-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-cyan-300">BOOKING</span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      Relation / Entity
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    <li className="flex justify-between text-cyan-400 font-bold">
                      <span>• booking_id</span>
                      <span className="text-[10px] bg-cyan-900/60 px-1 rounded">PK</span>
                    </li>
                    <li className="flex justify-between text-amber-400">
                      <span>• vehicle_plate</span>
                      <span className="text-[10px] bg-amber-900/40 px-1 rounded">FK</span>
                    </li>
                    <li className="flex justify-between text-amber-400">
                      <span>• slot_id</span>
                      <span className="text-[10px] bg-amber-900/40 px-1 rounded">FK</span>
                    </li>
                    <li className="text-slate-300">• entry_time</li>
                    <li className="text-slate-300">• exit_time</li>
                    <li className="text-slate-300">• status</li>
                    <li className="text-slate-300">• total_amount</li>
                  </ul>
                </div>

                {/* Entity: Parking Slot */}
                <div className="bg-slate-800/90 border-2 border-emerald-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-emerald-300">PARKING_SLOT</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      Weak Entity
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    <li className="flex justify-between text-emerald-400 font-bold">
                      <span>• slot_id</span>
                      <span className="text-[10px] bg-emerald-900/60 px-1 rounded">PK</span>
                    </li>
                    <li className="text-slate-300">• slot_number</li>
                    <li className="flex justify-between text-amber-400">
                      <span>• zone_code</span>
                      <span className="text-[10px] bg-amber-900/40 px-1 rounded">FK</span>
                    </li>
                    <li className="text-slate-300">• type</li>
                    <li className="text-emerald-400 font-bold">• status</li>
                    <li className="text-slate-300">• x_coord, z_coord</li>
                    <li className="text-slate-300">• hourly_rate</li>
                  </ul>
                </div>

                {/* Entity: Parking Zone */}
                <div className="bg-slate-800/90 border-2 border-purple-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-purple-300">PARKING_ZONE</span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono">
                      Strong Entity
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    <li className="flex justify-between text-purple-400 font-bold">
                      <span>• zone_code</span>
                      <span className="text-[10px] bg-purple-900/60 px-1 rounded">PK</span>
                    </li>
                    <li className="text-slate-300">• zone_name</li>
                    <li className="text-slate-300">• entry_gate</li>
                    <li className="text-slate-300">• floor_level</li>
                    <li className="text-slate-300">• total_slots</li>
                    <li className="text-slate-300">• base_rate</li>
                  </ul>
                </div>
              </div>

              {/* Relationship Cardinalities */}
              <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                  Relational Cardinality Mapping (DMGT)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-cyan-400 font-bold mb-1">User 1 : N Vehicle</div>
                    <div className="text-slate-400 text-[11px]">
                      One registered mall visitor may own or register multiple vehicles.
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">Vehicle 1 : N Booking</div>
                    <div className="text-slate-400 text-[11px]">
                      A vehicle can have multiple historical bookings, but at most ONE ACTIVE booking at any instant.
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-purple-400 font-bold mb-1">ParkingZone 1 : N ParkingSlot</div>
                    <div className="text-slate-400 text-[11px]">
                      Each mall zone houses multiple designated parking bays categorized by vehicle dimension.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DMGT Relational Algebra Tab */}
          {activeTab === 'dmgt' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleRunQuery(preset)}
                    className={`p-3 rounded-xl text-left border transition ${
                      selectedPresetId === preset.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">{preset.title}</div>
                    <div className="font-mono text-[10px] text-indigo-300 truncate">
                      {preset.algebraExpression}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Expression Detail */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="text-indigo-400">
                  <span className="text-slate-500 font-sans font-bold">DMGT Expression: </span>
                  {currentPreset.algebraExpression}
                </div>
                <div className="text-emerald-400">
                  <span className="text-slate-500 font-sans font-bold">SQL Equivalent: </span>
                  {currentPreset.sqlEquivalent}
                </div>
                <div className="text-slate-400 font-sans text-[11px] pt-1 border-t border-slate-850">
                  {currentPreset.explanation}
                </div>
              </div>

              {/* Query Results Table */}
              <div className="bg-slate-850 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-800 font-bold text-xs text-slate-200 flex justify-between items-center">
                  <span>Execution Result Set ({queryResult.length} tuples returned)</span>
                  <span className="text-[10px] font-mono text-emerald-400">STATUS: 200 OK</span>
                </div>
                <div className="max-h-64 overflow-x-auto overflow-y-auto">
                  {queryResult.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">No records found.</div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          {Object.keys(queryResult[0]).map((col) => (
                            <th key={col} className="px-4 py-2 font-mono uppercase text-[10px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {queryResult.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            {Object.values(row).map((val: any, vidx) => (
                              <td key={vidx} className="px-4 py-2 text-slate-300">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Live Tables Tab */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Live Relations in Database:</span>
                <span className="font-mono text-emerald-400">
                  Total Active Slots: {dbms.slots.length} | Bookings: {dbms.bookings.length}
                </span>
              </div>
              <div className="bg-slate-850 border border-slate-800 rounded-xl max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Slot</th>
                      <th className="px-3 py-2">Zone</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Distance (G1)</th>
                      <th className="px-3 py-2">Vehicle Plate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {dbms.slots.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-bold text-cyan-400">{s.slotNumber}</td>
                        <td className="px-3 py-2 text-slate-300">{s.zoneCode}</td>
                        <td className="px-3 py-2 text-slate-400">{s.type}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.status === 'AVAILABLE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : s.status === 'OCCUPIED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{s.distanceFromGate1}m</td>
                        <td className="px-3 py-2 text-slate-400">{s.currentVehiclePlate || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
