import React, { useState } from 'react';
import { User, Vehicle, SlotType } from '../types';
import { Car, Plus, Shield, Trash2, UserCheck, X } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface UserVehicleModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onSwitchRole: (role: 'USER' | 'ADMIN') => void;
}

export const UserVehicleModal: React.FC<UserVehicleModalProps> = ({
  user,
  isOpen,
  onClose,
  onAddVehicle,
  onSwitchRole,
}) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<SlotType>('STANDARD');
  const [color, setColor] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !make) return;

    soundEffects.playSlotSelect();
    const newVehicle: Vehicle = {
      plateNumber: plateNumber.toUpperCase().trim(),
      make: make.trim(),
      model: model.trim() || 'Sedan',
      type,
      color: color.trim() || 'Metallic Silver',
      ownerId: user.id,
      registeredAt: new Date().toISOString(),
    };

    onAddVehicle(newVehicle);
    setPlateNumber('');
    setMake('');
    setModel('');
    setColor('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Account & Registered Vehicles</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-slate-200">
          {/* Role Switcher */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-white">Current Mode</div>
                <div className="text-[11px] text-slate-400">
                  {user.role === 'ADMIN' ? 'Administrator Privileges' : 'Mall Visitor / Driver'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundEffects.playSlotSelect();
                onSwitchRole(user.role === 'ADMIN' ? 'USER' : 'ADMIN');
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
            >
              Switch to {user.role === 'ADMIN' ? 'User Mode' : 'Admin Mode'}
            </button>
          </div>

          {/* Registered Vehicles List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">My Registered Vehicles:</span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
              >
                <Plus size={14} /> {showAddForm ? 'Cancel' : 'Add Vehicle'}
              </button>
            </div>

            {showAddForm ? (
              <form onSubmit={handleAddSubmit} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">License Plate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-05-MN-9988"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Make *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toyota"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="e.g. RAV4"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Bay Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as SlotType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="COMPACT">Compact</option>
                      <option value="SUV">SUV</option>
                      <option value="EV">EV Supercharger</option>
                      <option value="ACCESSIBLE">Accessible</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Metallic Blue"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition mt-2"
                >
                  Save Vehicle to DBMS
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {user.savedVehicles.map((v) => (
                  <div
                    key={v.plateNumber}
                    className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
                        <Car size={16} />
                      </div>
                      <div>
                        <div className="font-bold font-mono text-white">{v.plateNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {v.make} {v.model} • {v.type} Bay • {v.color}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
