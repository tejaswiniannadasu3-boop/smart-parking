import React, { useState } from 'react';
import { Car, Lock, Mail, Phone, Shield, Sparkles, User, X } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface AuthModalProps {
  isOpen?: boolean;
  initialMode?: 'USER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER';
  currentUser?: any;
  onClose: () => void;
  onSuccessUser?: (user: any) => void;
  onSuccessAdmin?: (admin: any) => void;
  onRegisterSubmit?: (formData: any) => void;
  onSelectUser?: (user: any) => void;
  onRegisterUser?: (name: string, email: string, plate: string, model: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  initialMode = 'USER_LOGIN',
  currentUser,
  onClose,
  onSuccessUser,
  onSuccessAdmin,
  onRegisterSubmit,
  onSelectUser,
  onRegisterUser,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'USER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER'>(initialMode);

  // Form states
  const [email, setEmail] = useState('rahul.sharma@smartpark.mall');
  const [password, setPassword] = useState('password123');

  // Registration states
  const [regName, setRegName] = useState('Rahul Sharma');
  const [regEmail, setRegEmail] = useState('rahul.sharma@smartpark.mall');
  const [regPhone, setRegPhone] = useState('+91 98765 43210');
  const [regPlate, setRegPlate] = useState('TS01AB1234');
  const [regModel, setRegModel] = useState('Honda City ZX (Sedan)');
  const [regType, setRegType] = useState('STANDARD');

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playVoiceChime();
    const user = {
      id: 'usr-1',
      name: 'Rahul Sharma',
      email: email || 'rahul.sharma@smartpark.mall',
      phone: '+91 98765 43210',
      role: 'USER',
      savedVehicles: [
        {
          plateNumber: 'TS01AB1234',
          make: 'Honda',
          model: 'City ZX (Sedan)',
          type: 'STANDARD',
        },
      ],
    };
    if (onSuccessUser) onSuccessUser(user);
    if (onSelectUser) onSelectUser(user);
    onClose();
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playVoiceChime();
    const admin = {
      id: 'usr-admin',
      name: 'Mall Parking Administrator',
      email: 'admin@smartpark.mall',
      role: 'ADMIN',
      savedVehicles: [],
    };
    if (onSuccessAdmin) onSuccessAdmin(admin);
    if (onSelectUser) onSelectUser(admin);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playBookingSuccess();
    const plate = regPlate.toUpperCase().trim();
    if (onRegisterSubmit) {
      onRegisterSubmit({
        name: regName,
        email: regEmail,
        phone: regPhone,
        plateNumber: plate,
        vehicleModel: regModel,
        vehicleType: regType,
      });
    }
    if (onRegisterUser) {
      onRegisterUser(regName, regEmail, plate, regModel);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('USER_LOGIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'USER_LOGIN'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} /> User Login
          </button>
          <button
            onClick={() => setMode('ADMIN_LOGIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'ADMIN_LOGIN'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} /> Admin Login
          </button>
          <button
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'REGISTER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Register
          </button>
        </div>

        {/* USER LOGIN FORM */}
        {mode === 'USER_LOGIN' && (
          <form onSubmit={handleUserLoginSubmit} className="space-y-4">
            <div>
              <h3 className="text-xl font-black text-white">Driver / User Login</h3>
              <p className="text-xs text-slate-400">Access saved vehicles and reserved parking bays</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition"
            >
              Sign In as Rahul Sharma (TS01AB1234)
            </button>
          </form>
        )}

        {/* ADMIN LOGIN FORM */}
        {mode === 'ADMIN_LOGIN' && (
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Shield className="text-purple-400" size={20} /> Mall Operations Admin
              </h3>
              <p className="text-xs text-slate-400">
                Manage bays, override locks, view audit logs & live occupancy
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="email"
                    defaultValue="admin@smartpark.mall"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="password"
                    defaultValue="admin123"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition"
            >
              Sign In as Administrator
            </button>
          </form>
        )}

        {/* CREATE ACCOUNT / REGISTRATION FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <h3 className="text-xl font-black text-white">Create SmartPark Account</h3>
              <p className="text-xs text-slate-400">Register your vehicle for automated entry</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value)}
                  required
                  placeholder="TS01AB1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="STANDARD">Standard Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="COMPACT">Compact</option>
                  <option value="ACCESSIBLE">Accessible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                Vehicle Make & Model
              </label>
              <input
                type="text"
                value={regModel}
                onChange={(e) => setRegModel(e.target.value)}
                required
                placeholder="Honda City / Hyundai Creta"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-950/60 transition"
            >
              Complete Registration & Enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
