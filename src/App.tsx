import React, { useState, useEffect } from 'react';
import {
  Booking,
  ParkingSlot,
  ParkingZone,
  User,
  Vehicle,
  AppTheme,
  SlotType,
} from './types';
import { dbms } from './services/dbmsEngine';
import { AdsaMinHeap } from './services/adsaHeap';
import { PythonOccupancyPredictor } from './services/pythonPredictor';
import { soundEffects } from './services/soundEffects';
import { speechAssistant, VoiceCommandResult } from './services/speechAssistant';

import { Parking3DView } from './components/Parking3DView';
import { DigitalTicketModal } from './components/DigitalTicketModal';
import { AdsaHeapWorkbench } from './components/AdsaHeapWorkbench';
import { DbmsSchemaModal } from './components/DbmsSchemaModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { NavigationGuideModal } from './components/NavigationGuideModal';
import { SlotBookingModal } from './components/SlotBookingModal';
import { AdminPanel } from './components/AdminPanel';
import { UserVehicleModal } from './components/UserVehicleModal';
import { ThemeSelector } from './components/ThemeSelector';
import { LandingPage } from './components/LandingPage';
import { Parking2DMap } from './components/Parking2DMap';
import { DoubleBookingAlertModal } from './components/DoubleBookingAlertModal';
import { AuthModal } from './components/AuthModal';
import { MyParkingView } from './components/MyParkingView';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';

import {
  Activity,
  AlertCircle,
  Binary,
  BookOpen,
  Car,
  CheckCircle2,
  Compass,
  Database,
  Eye,
  Filter,
  Grid,
  History,
  Layers,
  MapPin,
  Mic,
  Navigation,
  Palette,
  QrCode,
  RotateCcw,
  Search,
  Shield,
  Sliders,
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Theme & Sound State
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Core DBMS State
  const [slots, setSlots] = useState<ParkingSlot[]>(() => [...dbms.slots]);
  const [zones, setZones] = useState<ParkingZone[]>(() => [...dbms.zones]);
  const [bookings, setBookings] = useState<Booking[]>(() => [...dbms.bookings]);
  const [currentUser, setCurrentUser] = useState<User>(dbms.users[0]);

  // Active Interactive State
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [activeGate, setActiveGate] = useState<string>('Gate 1');
  const [slotTypeFilter, setSlotTypeFilter] = useState<string>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mainViewMode, setMainViewMode] = useState<'3d' | '2d' | 'myparking' | 'analytics' | 'admin'>('3d');

  // Modals visibility state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [activeTicketBooking, setActiveTicketBooking] = useState<Booking | null>(null);
  const [isHeapWorkbenchOpen, setIsHeapWorkbenchOpen] = useState<boolean>(false);
  const [isDbmsModalOpen, setIsDbmsModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isLandingModalOpen, setIsLandingModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState<boolean>(false);
  const [doubleBookingConflict, setDoubleBookingConflict] = useState<{
    requestedSlotNumber: string;
    alternatives: string[];
  } | null>(null);

  const [alertBanner, setAlertBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize data on load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSlots([...dbms.slots]);
    setZones([...dbms.zones]);
    setBookings([...dbms.bookings]);
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 5000);
  };

  // Python AI Recommendation
  const currentRecommendation = PythonOccupancyPredictor.recommendBestZone(
    slots,
    zones,
    new Date().getHours(),
    currentUser.savedVehicles[0]?.type || 'STANDARD'
  );

  // Selected slot object
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;
  const selectedZone = selectedSlot ? zones.find((z) => z.code === selectedSlot.zoneCode) || null : null;

  // Active booking for the user
  const latestActiveBooking =
    bookings.find(
      (b) => b.userId === currentUser.id && (b.status === 'CONFIRMED' || b.status === 'ACTIVE')
    ) || null;

  // Filtered slots for sidebar list
  const filteredSlots = slots.filter((slot) => {
    if (slotTypeFilter !== 'ALL' && slot.type !== slotTypeFilter) return false;
    if (zoneFilter !== 'ALL' && slot.zoneCode !== zoneFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = slot.slotNumber.toLowerCase().includes(q);
      const matchType = slot.type.toLowerCase().includes(q);
      const matchPlate = slot.currentVehiclePlate?.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchPlate) return false;
    }
    return true;
  });

  // Action: Find Nearest Available Slot via ADSA Min-Heap
  const handleFindNearestSlot = () => {
    soundEffects.playSlotSelect();
    const { nearest } = AdsaMinHeap.buildFromSlots(
      slots,
      activeGate as any,
      slotTypeFilter === 'ALL' ? undefined : slotTypeFilter
    );

    if (nearest) {
      setSelectedSlotId(nearest.slot.id);
      soundEffects.playBookingSuccess();
      showAlert(
        `ADSA Min-Heap allocated nearest bay ${nearest.slot.slotNumber} (${nearest.distance.toFixed(1)}m from ${activeGate}).`
      );
    } else {
      showAlert('No free parking bays found matching current criteria.', 'error');
    }
  };

  // Action: Confirm Booking
  const handleConfirmBooking = (params: {
    userId: string;
    userName: string;
    vehiclePlate: string;
    vehicleModel: string;
    slotId: string;
    entryGate: string;
  }) => {
    const result = dbms.allocateAndBookSlot(params);
    if (result.success && result.booking) {
      refreshData();
      setIsBookingModalOpen(false);
      setActiveTicketBooking(result.booking);
      setIsTicketModalOpen(true);
      showAlert(`Bay ${result.booking.slotNumber} successfully reserved! Digital ticket issued.`);
      if (speechAssistant.voiceNotificationsEnabled) {
        speechAssistant.speak(`Slot ${result.booking.slotNumber} reserved. Digital ticket is ready.`);
      }
    } else {
      soundEffects.playDoubleBookingAlert();
      setIsBookingModalOpen(false);
      const reqSlot = slots.find((s) => s.id === params.slotId);
      setDoubleBookingConflict({
        requestedSlotNumber: reqSlot?.slotNumber || 'Requested Slot',
        alternatives: result.alternatives || [],
      });
      showAlert(result.error || 'Allocation error occurred: Slot unavailable.', 'error');
    }
  };

  // Action: Vehicle Parks (Slot = OCCUPIED)
  const handleVehicleArrived = (bookingId: string) => {
    const ok = dbms.vehicleParked(bookingId);
    if (ok) {
      refreshData();
      showAlert('Vehicle parked. Optical sensor updated Bay to OCCUPIED.');
    }
  };

  // Action: Vehicle Leaves (Slot = FREE)
  const handleVehicleExited = (bookingId: string) => {
    const res = dbms.releaseAndCompleteBooking(bookingId);
    if (res.success) {
      refreshData();
      setIsTicketModalOpen(false);
      showAlert(`Bay released. Total charged: $${res.totalAmount}. Thank you for parking with SmartPark!`);
      if (speechAssistant.voiceNotificationsEnabled) {
        speechAssistant.speak('Slot released. Boom barrier opened for exit.');
      }
    }
  };

  // Action: Voice Command Processing (matching prompt section 8)
  const handleExecuteVoiceCommand = (cmd: VoiceCommandResult) => {
    if (cmd.action === 'FIND_NEAREST') {
      handleFindNearestSlot();
    } else if (cmd.action === 'FILTER_ZONE') {
      if (cmd.param) {
        const zoneLetter = cmd.param.toUpperCase();
        setZoneFilter(zoneLetter);
        showAlert(`Voice Assistant: Filtered bays to Zone ${zoneLetter}`);
        if (speechAssistant.voiceNotificationsEnabled) {
          speechAssistant.speak(`Displaying parking slots in Zone ${zoneLetter}`);
        }
      }
    } else if (cmd.action === 'SHOW_AVAILABLE') {
      setSlotTypeFilter('ALL');
      setMainViewMode('2d');
      showAlert('Voice Assistant: Showing all available bays in 2D map');
      if (speechAssistant.voiceNotificationsEnabled) {
        speechAssistant.speak('Here are all currently available parking slots in the mall.');
      }
    } else if (cmd.action === 'WHERE_IS_MY_SLOT') {
      if (latestActiveBooking) {
        setSelectedSlotId(latestActiveBooking.slotId);
        setIsNavModalOpen(true);
        if (speechAssistant.voiceNotificationsEnabled) {
          speechAssistant.speak(
            `Your vehicle ${latestActiveBooking.vehiclePlate} is parked at slot ${latestActiveBooking.slotNumber} in Zone ${latestActiveBooking.zoneCode}.`
          );
        }
      } else {
        showAlert('No active parking reservation found for this vehicle.', 'error');
        if (speechAssistant.voiceNotificationsEnabled) {
          speechAssistant.speak('You do not have an active parking reservation.');
        }
      }
    } else if (cmd.action === 'RECOMMEND_ZONE') {
      setZoneFilter(currentRecommendation.recommendedZoneCode);
      if (currentRecommendation.suggestedSlotId) {
        setSelectedSlotId(currentRecommendation.suggestedSlotId);
      }
      showAlert(`Zone ${currentRecommendation.recommendedZoneCode} recommended by Python forecast model.`);
    } else if (cmd.action === 'BOOK_SLOT') {
      if (cmd.param) {
        const target = slots.find((s) => s.slotNumber.toLowerCase() === cmd.param?.toLowerCase());
        if (target) {
          setSelectedSlotId(target.id);
          setIsBookingModalOpen(true);
          return;
        }
      }
      handleFindNearestSlot();
      setIsBookingModalOpen(true);
    } else if (cmd.action === 'SHOW_TICKET') {
      if (latestActiveBooking) {
        setActiveTicketBooking(latestActiveBooking);
        setIsTicketModalOpen(true);
      } else {
        showAlert('No active ticket found for this vehicle.', 'error');
      }
    } else if (cmd.action === 'NAVIGATE') {
      if (selectedSlot) {
        setIsNavModalOpen(true);
      } else {
        handleFindNearestSlot();
        setIsNavModalOpen(true);
      }
    } else if (cmd.action === 'CHECK_OCCUPANCY') {
      setMainViewMode('analytics');
    } else if (cmd.action === 'TOGGLE_THEME') {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    } else if (cmd.action === 'CANCEL_BOOKING') {
      if (latestActiveBooking) {
        dbms.cancelBooking(latestActiveBooking.id);
        refreshData();
        showAlert('Booking cancelled and slot released.');
      }
    }
  };

  // Section 9: Theme Wrapper Classes
  const themeClasses: Record<AppTheme, string> = {
    dark: 'bg-slate-950 text-slate-100',
    light: 'bg-slate-50 text-slate-900',
    blue: 'bg-blue-950/80 text-blue-100',
    green: 'bg-emerald-950/80 text-emerald-100',
    purple: 'bg-purple-950/80 text-purple-100',
    emerald: 'bg-emerald-950/90 text-emerald-100',
    sapphire: 'bg-blue-950 text-sky-100',
    cyber: 'bg-zinc-950 text-cyan-300',
  };

  return (
    <div className={`min-h-screen ${themeClasses[theme]} flex flex-col font-sans transition-colors duration-300`}>
      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 transition animate-in slide-in-from-top ${
            alertBanner.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white shadow-md'
          }`}
        >
          {alertBanner.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{alertBanner.message}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Live Occupancy Badge */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/50">
            <Car size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base lg:text-lg tracking-tight text-white flex items-center gap-1.5">
                SmartPark
                <span className="text-[10px] font-mono font-normal bg-cyan-950 border border-cyan-700/60 text-cyan-400 px-2 py-0.5 rounded-full">
                  v3.4 3D
                </span>
              </h1>
              {currentUser.role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-600 text-[10px] font-bold text-purple-300">
                  ADMIN CONSOLE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Intelligent Mall Parking • ADSA Min-Heap • Python ML • DBMS
            </p>
          </div>
        </div>

        {/* Center: Entrance Gate Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-850 p-1 rounded-xl border border-slate-750 text-xs">
          <span className="text-slate-400 text-[11px] px-2 font-medium flex items-center gap-1">
            <Compass size={13} className="text-cyan-400" /> Entry Gate:
          </span>
          {['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4'].map((g) => (
            <button
              key={g}
              onClick={() => {
                soundEffects.playSlotSelect();
                setActiveGate(g);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeGate === g
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Right Action Tools & Profile */}
        <div className="flex items-center gap-2">
          {/* Main View Switcher */}
          <div className="bg-slate-850 border border-slate-750 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setMainViewMode('3d')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                mainViewMode === '3d'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Interactive 3D Virtual Parking Floor"
            >
              <Eye size={14} /> <span className="hidden sm:inline">3D View</span>
            </button>
            <button
              onClick={() => setMainViewMode('2d')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                mainViewMode === '2d'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="2D Parking Bay Map"
            >
              <Grid size={14} /> <span className="hidden sm:inline">2D Map</span>
            </button>
            <button
              onClick={() => setMainViewMode('myparking')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 relative ${
                mainViewMode === 'myparking'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="My Parking & Booking History"
            >
              <History size={14} /> <span className="hidden sm:inline">My Parking</span>
              {latestActiveBooking && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setMainViewMode('analytics')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                mainViewMode === 'analytics'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Occupancy & Python ML Predictions"
            >
              <Activity size={14} /> <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => setMainViewMode('admin')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                mainViewMode === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mall Operator Admin Console"
            >
              <Sliders size={14} /> <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Guide & Specification Modal Trigger */}
          <button
            onClick={() => setIsLandingModalOpen(true)}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-750 border border-slate-750 text-cyan-400 transition"
            title="System Overview & User Guide"
          >
            <BookOpen size={17} />
          </button>

          {/* ADSA Heap Modal Trigger */}
          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              setIsHeapWorkbenchOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-750 border border-slate-750 text-emerald-400 transition"
            title="ADSA Min-Heap Nearest-Slot Workbench"
          >
            <Binary size={17} />
          </button>

          {/* DBMS ER Schema Trigger */}
          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              setIsDbmsModalOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-750 border border-slate-750 text-indigo-400 transition"
            title="DBMS ER Model & Relational Algebra"
          >
            <Database size={17} />
          </button>

          {/* Voice Assistant Trigger */}
          <button
            onClick={() => {
              soundEffects.playSlotSelect();
              setIsVoiceModalOpen(true);
            }}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md shadow-purple-950/50"
            title="SmartPark Voice Assistant"
          >
            <Mic size={17} />
          </button>

          {/* Theme & Sound Settings Modal Trigger */}
          <button
            onClick={() => setIsThemeSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-750 border border-slate-750 text-amber-400 transition"
            title="Appearance & Audio Settings"
          >
            <Palette size={17} />
          </button>

          {/* User / Driver Account Switcher Modal Trigger */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-750 border border-slate-750 transition text-xs font-semibold text-slate-200"
            title="Switch User / Driver Profile"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
              {currentUser.name[0]}
            </div>
            <span className="hidden xl:inline">{currentUser.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Active Digital Ticket Alert Strip (If user has a confirmed booking) */}
        {latestActiveBooking && (
          <div className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/50 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-300">
                <QrCode size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Active Parking Pass
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-200 border border-cyan-800">
                    {latestActiveBooking.bookingRef}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  Bay {latestActiveBooking.slotNumber} (Zone {latestActiveBooking.zoneCode}) •{' '}
                  {latestActiveBooking.vehiclePlate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSlotId(latestActiveBooking.slotId);
                  setIsNavModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Navigation size={14} className="text-cyan-400" /> Turn-by-Turn Route
              </button>
              <button
                onClick={() => {
                  setActiveTicketBooking(latestActiveBooking);
                  setIsTicketModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-950/50"
              >
                <QrCode size={14} /> Open Digital Ticket
              </button>
            </div>
          </div>
        )}

        {/* View Mode 1: 3D Interactive Parking Stage + Control Panel */}
        {mainViewMode === '3d' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3D Visualizer Stage (Left Column) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-[560px] w-full">
                <Parking3DView
                  slots={slots}
                  zones={zones}
                  selectedSlotId={selectedSlotId}
                  activeGate={activeGate}
                  onSelectSlot={(slot) => {
                    setSelectedSlotId(slot.id);
                  }}
                  showNavigationPath={true}
                  navTargetSlotId={latestActiveBooking?.slotId}
                />
              </div>

              {/* Quick 3D Navigation & Action Helper Footer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">Orbit:</span> Click & Drag
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">Zoom:</span> Scroll Wheel
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">Select:</span> Click Bay
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFindNearestSlot}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
                  >
                    <Binary size={15} /> Find Nearest Free Bay (ADSA Min-Heap)
                  </button>
                  {selectedSlot && (
                    <button
                      onClick={() => setIsNavModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-950/40"
                    >
                      <Navigation size={15} /> Route Directions
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Smart Allocation, Filter & Bay Selector */}
            <div className="lg:col-span-4 space-y-5">
              {/* Python AI Recommendation Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Sparkles size={16} /> Python Occupancy Forecast
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                    ML Optimal
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">
                    Zone {currentRecommendation.recommendedZoneCode} Recommended
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {currentRecommendation.reason}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Predicted Load Now:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currentRecommendation.predictedOccupancyNow}%
                  </span>
                </div>
                <button
                  onClick={() => {
                    setZoneFilter(currentRecommendation.recommendedZoneCode);
                    if (currentRecommendation.suggestedSlotId) {
                      setSelectedSlotId(currentRecommendation.suggestedSlotId);
                    }
                    soundEffects.playSlotSelect();
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Filter & Select in Zone {currentRecommendation.recommendedZoneCode}
                </button>
              </div>

              {/* Selected Slot Inspector Card */}
              {selectedSlot ? (
                <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 space-y-4 shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        Selected Parking Bay
                      </div>
                      <div className="text-3xl font-black text-white font-mono mt-0.5">
                        {selectedSlot.slotNumber}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedSlot.status === 'AVAILABLE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : selectedSlot.status === 'OCCUPIED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {selectedSlot.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-850 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400">Zone Sector:</span>
                      <div className="font-semibold text-white">Zone {selectedSlot.zoneCode}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Bay Type:</span>
                      <div className="font-semibold text-cyan-300">{selectedSlot.type}</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-400">Hourly Rate:</span>
                      <div className="font-semibold text-emerald-400">${selectedSlot.hourlyRate}/hr</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-400">Distance ({activeGate}):</span>
                      <div className="font-semibold text-slate-200">
                        {activeGate === 'Gate 2'
                          ? selectedSlot.distanceFromGate2
                          : activeGate === 'Gate 3'
                          ? selectedSlot.distanceFromGate3
                          : activeGate === 'Gate 4'
                          ? selectedSlot.distanceFromGate4
                          : selectedSlot.distanceFromGate1}m
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedSlot.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => {
                        soundEffects.playSlotSelect();
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} /> Reserve This Bay Now
                    </button>
                  ) : (
                    <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl text-center text-xs text-red-300">
                      This bay is currently {selectedSlot.status.toLowerCase()} by another vehicle.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-400">
                  <MapPin size={24} className="mx-auto mb-2 text-slate-600" />
                  Click on any parking bay in the 3D map or select from list below to view specs and book.
                </div>
              )}

              {/* Slot Filter & List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Filter size={15} className="text-cyan-400" /> Bay Filter & Directory
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {filteredSlots.length} bays shown
                  </span>
                </div>

                {/* Filter Controls */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search bay number, type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                      className="bg-slate-850 border border-slate-750 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none text-xs"
                    >
                      <option value="ALL">All Zones</option>
                      <option value="A">Zone A (Retail)</option>
                      <option value="B">Zone B (Cinema)</option>
                      <option value="C">Zone C (Hypermarket)</option>
                      <option value="D">Zone D (VIP/EV)</option>
                    </select>

                    <select
                      value={slotTypeFilter}
                      onChange={(e) => setSlotTypeFilter(e.target.value)}
                      className="bg-slate-850 border border-slate-750 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none text-xs"
                    >
                      <option value="ALL">All Types</option>
                      <option value="STANDARD">Standard</option>
                      <option value="COMPACT">Compact</option>
                      <option value="SUV">SUV</option>
                      <option value="EV">EV Charger</option>
                      <option value="ACCESSIBLE">Accessible</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                {/* Scrollable Slots Grid */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => {
                        soundEffects.playSlotSelect();
                        setSelectedSlotId(slot.id);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                        selectedSlotId === slot.id
                          ? 'bg-cyan-950/40 border-cyan-500 text-white'
                          : 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-650'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-cyan-400">
                          {slot.slotNumber}
                        </span>
                        <div>
                          <div className="text-[11px] font-medium text-slate-300">
                            Zone {slot.zoneCode} • {slot.type}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {slot.distanceFromGate1}m from G1
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-medium">
                          ${slot.hourlyRate}/h
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            slot.status === 'AVAILABLE'
                              ? 'bg-emerald-500'
                              : slot.status === 'OCCUPIED'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: 2D Bay Layout Map */}
        {mainViewMode === '2d' && (
          <Parking2DMap
            slots={slots}
            zones={zones}
            selectedSlotId={selectedSlotId}
            onSelectSlot={(slot: ParkingSlot) => setSelectedSlotId(slot.id)}
            onBookSlot={(slot: ParkingSlot) => {
              setSelectedSlotId(slot.id);
              setIsBookingModalOpen(true);
            }}
          />
        )}

        {/* View Mode 3: My Parking Pass & History */}
        {mainViewMode === 'myparking' && (
          <MyParkingView
            activeBooking={latestActiveBooking}
            parkingHistory={dbms.parkingHistory}
            onViewDirections={() => {
              if (latestActiveBooking) {
                setSelectedSlotId(latestActiveBooking.slotId);
                setIsNavModalOpen(true);
              }
            }}
            onCancelBooking={(bookingId) => {
              const ok = dbms.cancelBooking(bookingId);
              if (ok) {
                refreshData();
                showAlert('Booking cancelled and slot released.');
              }
            }}
            onShowTicket={() => {
              if (latestActiveBooking) {
                setActiveTicketBooking(latestActiveBooking);
                setIsTicketModalOpen(true);
              }
            }}
          />
        )}

        {/* View Mode 4: Live Analytics & Python Forecasting */}
        {mainViewMode === 'analytics' && (
          <AnalyticsDashboard
            slots={slots}
            zones={zones}
            recommendation={currentRecommendation}
            onSelectZone={(code) => {
              setZoneFilter(code);
              setMainViewMode('3d');
            }}
          />
        )}

        {/* View Mode 5: Admin Management Console */}
        {mainViewMode === 'admin' && (
          <AdminPanel
            slots={slots}
            zones={zones}
            bookings={bookings}
            users={dbms.users}
            onUpdateSlotStatus={(slotId, status) => {
              const s = dbms.slots.find((slot) => slot.id === slotId);
              if (s) {
                s.status = status;
                if (status === 'AVAILABLE') {
                  s.currentVehiclePlate = undefined;
                  s.currentVehicleModel = undefined;
                  s.occupiedSince = undefined;
                } else if (status === 'OCCUPIED') {
                  s.currentVehiclePlate = s.currentVehiclePlate || 'ADMIN-OVERRIDE';
                }
                refreshData();
              }
            }}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* All Subsystem Modals */}
      <DoubleBookingAlertModal
        isOpen={!!doubleBookingConflict}
        onClose={() => setDoubleBookingConflict(null)}
        slotNumber={doubleBookingConflict?.requestedSlotNumber || ''}
        alternatives={doubleBookingConflict?.alternatives || []}
        onSelectAlternative={(altSlotNumber: string) => {
          setDoubleBookingConflict(null);
          const found = slots.find(
            (s) => s.slotNumber.toUpperCase() === altSlotNumber.toUpperCase() || s.id === altSlotNumber
          );
          if (found) {
            setSelectedSlotId(found.id);
            setIsBookingModalOpen(true);
          }
        }}
      />

      <ThemeSettingsModal
        isOpen={isThemeSettingsOpen}
        onClose={() => setIsThemeSettingsOpen(false)}
        currentTheme={theme}
        onSelectTheme={setTheme}
        soundEnabled={!isMuted}
        onToggleSound={() => {
          const enabled = soundEffects.toggleMute();
          setIsMuted(!enabled);
        }}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled((prev) => !prev)}
        voiceNotificationsEnabled={speechAssistant.voiceNotificationsEnabled}
        onToggleVoiceNotifications={() => {
          speechAssistant.toggleVoiceNotifications();
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u: User) => {
          setCurrentUser(u);
          showAlert(`Logged in as ${u.name} (${u.role})`);
          if (u.role === 'ADMIN') {
            setMainViewMode('admin');
          }
        }}
        onRegisterUser={(name: string, email: string, plate: string, model: string) => {
          const res = dbms.registerUser({
            name,
            email,
            phone: '+91 98765 43210',
            vehiclePlate: plate,
            vehicleModel: model,
          });
          refreshData();
          setCurrentUser(res.user);
          showAlert(`Registered driver ${res.user.name} with vehicle ${plate}`);
        }}
      />

      {/* Interactive Guide / Landing Modal */}
      {isLandingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex flex-col justify-center">
          <div className="relative max-w-5xl w-full mx-auto my-auto">
            <button
              onClick={() => setIsLandingModalOpen(false)}
              className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
            >
              ✕ Close Guide
            </button>
            <LandingPage
              onGetStarted={() => setIsLandingModalOpen(false)}
              onOpenMap={() => {
                setIsLandingModalOpen(false);
                setMainViewMode('3d');
              }}
              onOpenAdmin={() => {
                setIsLandingModalOpen(false);
                setMainViewMode('admin');
              }}
            />
          </div>
        </div>
      )}
      <SlotBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        slot={selectedSlot}
        zone={selectedZone}
        user={currentUser}
        activeGate={activeGate}
        onConfirmBooking={handleConfirmBooking}
      />

      <DigitalTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={activeTicketBooking}
        onVehicleArrived={handleVehicleArrived}
        onVehicleExited={handleVehicleExited}
        onNavigateToSlot={(slotId) => {
          setSelectedSlotId(slotId);
          setIsNavModalOpen(true);
        }}
      />

      <AdsaHeapWorkbench
        isOpen={isHeapWorkbenchOpen}
        onClose={() => setIsHeapWorkbenchOpen(false)}
        slots={slots}
        activeGate={activeGate}
        onGateChange={setActiveGate}
        onSelectSlot={(slot) => {
          setSelectedSlotId(slot.id);
          setIsBookingModalOpen(true);
        }}
      />

      <DbmsSchemaModal
        isOpen={isDbmsModalOpen}
        onClose={() => setIsDbmsModalOpen(false)}
      />

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      <NavigationGuideModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        slot={selectedSlot}
        zone={selectedZone}
        activeGate={activeGate}
        onArrivedAtSlot={() => {
          if (latestActiveBooking) {
            handleVehicleArrived(latestActiveBooking.id);
          }
        }}
      />

      <UserVehicleModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={currentUser}
        onAddVehicle={(v) => {
          currentUser.savedVehicles.push(v);
          setCurrentUser({ ...currentUser });
          showAlert(`Vehicle ${v.plateNumber} added to DBMS registry.`);
        }}
        onSwitchRole={(role) => {
          currentUser.role = role;
          setCurrentUser({ ...currentUser });
          if (role === 'ADMIN') {
            setMainViewMode('admin');
          } else {
            setMainViewMode('3d');
          }
        }}
      />
    </div>
  );
}
