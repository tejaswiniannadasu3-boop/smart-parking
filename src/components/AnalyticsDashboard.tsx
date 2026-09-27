import React, { useState } from 'react';
import { ParkingSlot, ParkingZone, ZoneRecommendation } from '../types';
import { PythonOccupancyPredictor, HourlyForecastData } from '../services/pythonPredictor';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Code2,
  DollarSign,
  PieChart,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  recommendation: ZoneRecommendation;
  onSelectZone: (zoneCode: string) => void;
  onFindParking?: () => void;
  onBookSlot?: () => void;
  onViewParkingMap?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  slots,
  zones,
  recommendation,
  onSelectZone,
  onFindParking,
  onBookSlot,
  onViewParkingMap,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'forecast' | 'python'>('overview');
  const [isWeekend, setIsWeekend] = useState<boolean>(false);

  // Scaled mall simulation (Active 48 bays mapped to 200 total capacity)
  const totalSlots = 200;
  const occupiedSlots = 74;
  const reservedSlots = 20;
  const availableSlots = 126;
  const occupancyRate = 63; // 63%

  const promptForecastTable = [
    { time: '9:00 AM', predicted: 35 },
    { time: '11:00 AM', predicted: 55 },
    { time: '1:00 PM', predicted: 75 },
    { time: '3:00 PM', predicted: 82 },
    { time: '6:00 PM', predicted: 94 },
    { time: '8:00 PM', predicted: 68 },
  ];

  const hourlyData: HourlyForecastData[] = PythonOccupancyPredictor.getHourlyForecast(isWeekend);
  const currentHour = new Date().getHours();

  // Zone breakdown calculation
  const zoneStats = zones.map((z) => {
    const zSlots = slots.filter((s) => s.zoneCode === z.code);
    const zOcc = zSlots.filter((s) => s.status === 'OCCUPIED').length;
    const zRes = zSlots.filter((s) => s.status === 'RESERVED').length;
    const zAvail = zSlots.filter((s) => s.status === 'AVAILABLE').length;
    const rate = zSlots.length > 0 ? Math.round(((zOcc + zRes) / zSlots.length) * 100) : 0;
    return {
      ...z,
      occupied: zOcc,
      reserved: zRes,
      available: zAvail,
      rate,
    };
  });

  return (
    <div className="space-y-6">
      {/* SECTION 10: SMARTPARK SMART DASHBOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Shopping Mall Operations
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🚗</span> SMARTPARK LIVE DASHBOARD
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Recommended Zone:</span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono font-black text-sm">
              ZONE {recommendation.recommendedZoneCode || 'C'}
            </span>
          </div>
        </div>

        {/* Core Stats Grid matching prompt:
            Total Slots       200
            Available         126
            Occupied           74
            Reserved           20
            Current Occupancy  63%
        */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Slots</span>
            <span className="text-2xl font-mono font-black text-white">{totalSlots}</span>
            <span className="text-[10px] text-slate-500 block">Mall Total</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Available</span>
            <span className="text-2xl font-mono font-black text-emerald-400">{availableSlots}</span>
            <span className="text-[10px] text-emerald-500 block">Ready to book</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Occupied</span>
            <span className="text-2xl font-mono font-black text-rose-400">{occupiedSlots}</span>
            <span className="text-[10px] text-rose-500 block">Parked cars</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Reserved</span>
            <span className="text-2xl font-mono font-black text-amber-400">{reservedSlots}</span>
            <span className="text-[10px] text-amber-500 block">In-transit</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Occupancy</span>
            <span className="text-2xl font-mono font-black text-cyan-400">{occupancyRate}%</span>
            <span className="text-[10px] text-cyan-500 block">Live Load</span>
          </div>
        </div>

        {/* 3 Prompt Buttons: [ Find Parking ] [ Book a Slot ] [ View Parking Map ] */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => onFindParking && onFindParking()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span>🔍</span> Find Parking
          </button>
          <button
            onClick={() => onBookSlot && onBookSlot()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span>⚡</span> Book a Slot
          </button>
          <button
            onClick={() => onViewParkingMap && onViewParkingMap()}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <span>🗺️</span> View Parking Map
          </button>
        </div>
      </div>

      {/* SECTION 6: PYTHON OCCUPANCY PREDICTION TABLE & HIGH DEMAND ALERT */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Section 6: Python Occupancy Prediction Model
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
                occupancy_forecast table
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Temporal Machine Learning Regression Analysis
            </h3>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <AlertCircle size={14} className="text-rose-400" />
            <span>High parking demand expected around 6:00 PM.</span>
          </div>
        </div>

        {/* Exact Table from prompt:
            Time       Predicted Occupancy
            9:00 AM       35%
            11:00 AM      55%
            1:00 PM       75%
            3:00 PM       82%
            6:00 PM       94%
            8:00 PM       68%
        */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {promptForecastTable.map((item) => (
            <div
              key={item.time}
              className={`p-3 rounded-2xl border text-center transition ${
                item.predicted >= 90
                  ? 'bg-rose-950/50 border-rose-500/60 ring-1 ring-rose-500/40'
                  : item.predicted >= 75
                  ? 'bg-amber-950/40 border-amber-600/40'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                {item.time}
              </span>
              <span
                className={`text-xl font-mono font-black block mt-0.5 ${
                  item.predicted >= 90
                    ? 'text-rose-400'
                    : item.predicted >= 75
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {item.predicted}%
              </span>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    item.predicted >= 90
                      ? 'bg-rose-500'
                      : item.predicted >= 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${item.predicted}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Header & Python AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-purple-900/60 border border-blue-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl text-cyan-400">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Python AI Occupancy Prediction & Recommendation
              </span>
              <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-200 border border-cyan-800 font-mono">
                occupancy_forecast.py
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Recommended Parking Sector: Zone {recommendation.recommendedZoneCode}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectZone(recommendation.recommendedZoneCode)}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/50 flex-shrink-0"
        >
          Explore Zone {recommendation.recommendedZoneCode}
        </button>
      </div>

      {/* KPI Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupancy Rate</span>
            <Activity size={18} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{occupancyRate}%</div>
          <div className="text-xs text-slate-400 mt-1">
            {occupiedSlots + reservedSlots} of {totalSlots} bays active
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Bays</span>
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{availableSlots}</div>
          <div className="text-xs text-slate-400 mt-1">Ready for instant allocation</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${(availableSlots / totalSlots) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Forecasted Peak</span>
            <TrendingUp size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">7:00 PM</div>
          <div className="text-xs text-slate-400 mt-1">Expected 94% mall load</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '94%' }} />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Hourly Turnover</span>
            <DollarSign size={18} className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono">$1,420</div>
          <div className="text-xs text-slate-400 mt-1">Avg 2.8 hours stay per car</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: '75%' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition ${
            selectedTab === 'overview'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Zone Breakdown & Real-Time Status
        </button>
        <button
          onClick={() => setSelectedTab('forecast')}
          className={`px-3 py-1.5 rounded-lg transition ${
            selectedTab === 'forecast'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hourly Forecast Curve (Python Model)
        </button>
        <button
          onClick={() => setSelectedTab('python')}
          className={`px-3 py-1.5 rounded-lg transition ${
            selectedTab === 'python'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Python Model Architecture Code
        </button>
      </div>

      {/* Tab 1: Zone Breakdown */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zoneStats.map((z) => (
            <div
              key={z.code}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-md"
                    style={{ backgroundColor: z.color }}
                  />
                  <h4 className="font-bold text-white text-sm">Zone {z.code}</h4>
                </div>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {z.rate}% Occupied
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 h-8 line-clamp-2">{z.name}</p>

              {/* Stacked bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex mb-4">
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${(z.occupied / z.totalSlots) * 100}%` }}
                  title="Occupied"
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(z.reserved / z.totalSlots) * 100}%` }}
                  title="Reserved"
                />
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(z.available / z.totalSlots) * 100}%` }}
                  title="Available"
                />
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Available Bays:</span>
                  <span className="font-bold text-emerald-400">{z.available} free</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Access:</span>
                  <span className="text-slate-300">{z.entryGate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tariff:</span>
                  <span className="font-semibold text-slate-200">${z.baseRatePerHour}/hr</span>
                </div>
              </div>

              <button
                onClick={() => onSelectZone(z.code)}
                className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs transition"
              >
                Focus in 3D View
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Hourly Forecast Graph */}
      {selectedTab === 'forecast' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-400" />
                Hourly Predicted Occupancy Matrix (`occupancy_forecast`)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated via Gradient Boosting Regression across historical telemetry
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Traffic Model:</span>
              <button
                onClick={() => setIsWeekend(false)}
                className={`px-3 py-1 rounded-lg transition ${
                  !isWeekend ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Weekday
              </button>
              <button
                onClick={() => setIsWeekend(true)}
                className={`px-3 py-1 rounded-lg transition ${
                  isWeekend ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Weekend Peak
              </button>
            </div>
          </div>

          {/* Graphical Histogram / Bar Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pb-1 border-b border-slate-800 font-mono">
              <span className="w-20">TIME</span>
              <span className="w-16 text-center text-emerald-400">ZONE A</span>
              <span className="w-16 text-center text-blue-400">ZONE B</span>
              <span className="w-16 text-center text-amber-400">ZONE C</span>
              <span className="w-16 text-center text-purple-400">ZONE D</span>
              <span className="flex-1 text-right">OVERALL FORECAST LOAD</span>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
              {hourlyData.map((d) => {
                const isCurrent = d.hour === currentHour;
                return (
                  <div
                    key={d.hour}
                    className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-xl border ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-white font-bold'
                        : 'bg-slate-850/50 border-transparent text-slate-300'
                    }`}
                  >
                    <span className="w-20 font-mono text-[11px] flex items-center gap-1">
                      {d.label} {isCurrent && <span className="text-cyan-400 text-[10px]">● NOW</span>}
                    </span>
                    <span className="w-16 text-center font-mono text-emerald-400">{d.zoneA}%</span>
                    <span className="w-16 text-center font-mono text-blue-400">{d.zoneB}%</span>
                    <span className="w-16 text-center font-mono text-amber-400">{d.zoneC}%</span>
                    <span className="w-16 text-center font-mono text-purple-400">{d.zoneD}%</span>
                    <div className="flex-1 flex items-center justify-end gap-3 pl-4">
                      <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.overall > 80
                              ? 'bg-red-500'
                              : d.overall > 55
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${d.overall}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs w-8 text-right">{d.overall}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Python Architecture Code */}
      {selectedTab === 'python' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Code2 size={16} className="text-yellow-400" />
              Python Regression & Time-Series Engine (occupancy_predictor.py)
            </h4>
            <span className="text-xs text-slate-400 font-mono">scikit-learn • pandas • numpy</span>
          </div>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {PythonOccupancyPredictor.getPythonCodeSnippet()}
          </pre>
        </div>
      )}
    </div>
  );
};
