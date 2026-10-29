import React, { useState, useMemo } from 'react';
import { IndianMall } from '../types';
import { INDIAN_MALLS_DATA, INDIAN_CITIES } from '../data/indianMalls';
import {
  Building2,
  Car,
  Compass,
  MapPin,
  Search,
  Star,
  Zap,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Filter,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface IndianMallsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMall: IndianMall;
  onSelectMall: (mall: IndianMall) => void;
}

export const IndianMallsModal: React.FC<IndianMallsModalProps> = ({
  isOpen,
  onClose,
  activeMall,
  onSelectMall,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [expandedMallId, setExpandedMallId] = useState<string | null>(null);

  const filteredMalls = useMemo(() => {
    return INDIAN_MALLS_DATA.filter((mall) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = mall.name.toLowerCase().includes(q);
        const matchesCity = mall.city.toLowerCase().includes(q);
        const matchesState = mall.state.toLowerCase().includes(q);
        const matchesAnchors = mall.keyAnchors.some((a) => a.toLowerCase().includes(q));
        const matchesBrand = mall.brand.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesState && !matchesAnchors && !matchesBrand) {
          return false;
        }
      }

      // City filter
      if (selectedCity !== 'All Cities') {
        if (selectedCity === 'Delhi NCR' && !mall.state.includes('Delhi') && !mall.city.includes('Noida') && !mall.city.includes('Gurugram')) return false;
        if (selectedCity === 'Mumbai & MMR' && !mall.state.includes('Maharashtra') && !mall.city.includes('Mumbai') && !mall.city.includes('Thane')) return false;
        if (selectedCity === 'Bengaluru' && mall.city !== 'Bengaluru') return false;
        if (selectedCity === 'Hyderabad' && mall.city !== 'Hyderabad') return false;
        if (selectedCity === 'Chennai' && mall.city !== 'Chennai') return false;
        if (selectedCity === 'Kolkata' && mall.city !== 'Kolkata') return false;
        if (selectedCity === 'Pune' && mall.city !== 'Pune') return false;
        if (selectedCity === 'Kochi & Kerala' && !mall.state.includes('Kerala')) return false;
        if (selectedCity === 'Chandigarh & Punjab' && !mall.state.includes('Chandigarh') && !mall.state.includes('Punjab')) return false;
        if (selectedCity === 'Ahmedabad & Gujarat' && !mall.state.includes('Gujarat')) return false;
        if (selectedCity === 'Jaipur & Rajasthan' && !mall.state.includes('Rajasthan')) return false;
        if (selectedCity === 'Lucknow & UP' && !mall.state.includes('Uttar Pradesh')) return false;
        if (selectedCity === 'Bhopal & Central India' && !mall.state.includes('Madhya Pradesh')) return false;
        if (selectedCity === 'Bhubaneswar & East' && !mall.state.includes('Odisha')) return false;
      }

      // Region filter
      if (selectedRegion !== 'ALL' && mall.region !== selectedRegion) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCity, selectedRegion]);

  if (!isOpen) return null;

  const totalParkingSlots = INDIAN_MALLS_DATA.reduce((acc, m) => acc + m.parkingCapacity, 0);
  const totalAreaSqFt = INDIAN_MALLS_DATA.reduce((acc, m) => acc + m.grossAreaSqFt, 0);
  const totalEvBays = INDIAN_MALLS_DATA.reduce((acc, m) => acc + m.evChargingBays, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  All Malls in India Directory
                  <span className="text-sm px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                    🇮🇳 {INDIAN_MALLS_DATA.length} Premier Malls
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive directory of India’s largest, landmark shopping malls • Connect any mall directly to SmartPark
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-750 text-xs">
              <span className="text-slate-400 font-medium">Active Hub:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> {activeMall.name} ({activeMall.city})
              </span>
            </div>
            <button
              onClick={() => {
                soundEffects.playSlotSelect();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Statistics Banner */}
        <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-cyan-950/40 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Top Indian Malls</span>
              <span className="font-extrabold text-white text-sm">{INDIAN_MALLS_DATA.length} Mega Centers</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Retail Area</span>
              <span className="font-extrabold text-amber-400 text-sm">{(totalAreaSqFt / 1000000).toFixed(1)} Million sq.ft</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Smart Parking Capacity</span>
              <span className="font-extrabold text-cyan-400 text-sm">{totalParkingSlots.toLocaleString('en-IN')} Car Bays</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">EV Superchargers</span>
              <span className="font-extrabold text-emerald-400 text-sm">{totalEvBays} High-Speed Ports</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-750 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>Click <strong>"Connect to SmartPark"</strong> to simulate parking for that mall</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Mall name, City, State, or brand (e.g. LuLu, DLF, Phoenix, IMAX, Kochi, Mumbai)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-xl border border-slate-750 text-xs self-start md:self-auto overflow-x-auto max-w-full">
            {['ALL', 'North', 'South', 'West', 'East', 'Central'].map((reg) => (
              <button
                key={reg}
                onClick={() => {
                  soundEffects.playSlotSelect();
                  setSelectedRegion(reg);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedRegion === reg
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {reg === 'ALL' ? 'All Regions' : reg}
              </button>
            ))}
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-850/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 shrink-0 mr-1">
            <Filter size={12} /> City:
          </span>
          {INDIAN_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => {
                soundEffects.playSlotSelect();
                setSelectedCity(city);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap text-[11px] transition ${
                selectedCity === city
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Mall Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredMalls.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Building2 size={48} className="mx-auto mb-3 opacity-30 text-slate-500" />
              <p className="text-base font-semibold text-slate-300">No malls found matching your filters</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Cities"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('All Cities');
                  setSelectedRegion('ALL');
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMalls.map((mall) => {
                const isActive = mall.id === activeMall.id;
                const isExpanded = expandedMallId === mall.id;

                return (
                  <div
                    key={mall.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                      isActive
                        ? 'bg-gradient-to-b from-slate-850 to-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                        : 'bg-slate-850/80 hover:bg-slate-850 border-slate-750 hover:border-slate-650'
                    }`}
                  >
                    {/* Top Mall Header */}
                    <div className="p-4 sm:p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              {mall.brand}
                            </span>
                            {mall.rankByArea && mall.rankByArea <= 5 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Sparkles size={10} /> #{mall.rankByArea} in India
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-750 text-slate-300">
                              {mall.region} India
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 size={11} /> CURRENTLY CONNECTED
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug">
                            {mall.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <MapPin size={13} className="text-rose-400 shrink-0" />
                            <span>{mall.city}, {mall.state}</span>
                          </div>
                        </div>

                        {/* Star Rating & Price */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-1 text-amber-400 text-xs font-bold bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/40">
                            <Star size={13} fill="currentColor" /> {mall.rating}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium mt-1">
                            ₹{mall.hourlyParkingRateINR}/hr parking
                          </div>
                        </div>
                      </div>

                      {/* Summary Tagline */}
                      <p className="text-xs text-slate-300 mt-2.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800 italic">
                        "{mall.popularFor}"
                      </p>

                      {/* Key Metric Chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 text-center text-xs">
                        <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Area</span>
                          <span className="font-bold text-white text-xs">
                            {(mall.grossAreaSqFt / 100000).toFixed(1)} Lakh sq ft
                          </span>
                        </div>
                        <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Floors & Stores</span>
                          <span className="font-bold text-white text-xs">
                            {mall.floors} Flrs • {mall.storesCount}+
                          </span>
                        </div>
                        <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Car Parking</span>
                          <span className="font-bold text-cyan-400 text-xs flex items-center justify-center gap-1">
                            <Car size={12} /> {mall.parkingCapacity.toLocaleString('en-IN')} Bays
                          </span>
                        </div>
                        <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">EV Chargers</span>
                          <span className="font-bold text-emerald-400 text-xs flex items-center justify-center gap-1">
                            <Zap size={12} /> {mall.evChargingBays} Fast Bays
                          </span>
                        </div>
                      </div>

                      {/* Key Anchors & Attractions */}
                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Key Anchors & Attractions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {mall.keyAnchors.slice(0, 4).map((anchor, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                            >
                              {anchor}
                            </span>
                          ))}
                          {mall.keyAnchors.length > 4 && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-400">
                              +{mall.keyAnchors.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Gate & Zone Information */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
                          {/* Full Address & Metro */}
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                            <div className="text-slate-300">
                              <strong className="text-slate-200">Address:</strong> {mall.address}
                            </div>
                            {mall.metroConnectivity && (
                              <div className="text-cyan-300">
                                <strong className="text-slate-200">Transit:</strong> {mall.metroConnectivity}
                              </div>
                            )}
                          </div>

                          {/* 4 Gates configured for ADSA Min-Heap */}
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                              <Compass size={12} className="text-cyan-400" />
                              4 SmartPark Entrance Gates & Approaches:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {mall.entryGates.map((gate) => (
                                <div key={gate.name} className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                                  <div className="font-semibold text-cyan-400">{gate.name}</div>
                                  <div className="text-slate-300 text-[11px] font-medium">{gate.roadName}</div>
                                  <div className="text-slate-400 text-[10px] mt-0.5">{gate.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 4 Themed Parking Wings */}
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                              <Layers size={12} className="text-amber-400" />
                              Configured Parking Wings:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                              <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                                {mall.zonesDescription.zoneA}
                              </div>
                              <div className="p-2 rounded-lg bg-blue-950/20 border border-blue-800/30 text-blue-300">
                                {mall.zonesDescription.zoneB}
                              </div>
                              <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300">
                                {mall.zonesDescription.zoneC}
                              </div>
                              <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-800/30 text-purple-300">
                                {mall.zonesDescription.zoneD}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          soundEffects.playSlotSelect();
                          setExpandedMallId(isExpanded ? null : mall.id);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
                      >
                        {isExpanded ? 'Hide Details' : 'View Gates & Zones'}
                      </button>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Active SmartPark Hub
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              soundEffects.playBookingSuccess();
                              onSelectMall(mall);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-orange-950/40"
                          >
                            <span>Connect to SmartPark</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Showing {filteredMalls.length} of {INDIAN_MALLS_DATA.length} Indian Malls</span>
            <span>• Filtered by {selectedCity}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEffects.playSlotSelect();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
            >
              Done & Return to Map
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
