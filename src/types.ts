export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'SELECTED';

export type SlotType = 'STANDARD' | 'COMPACT' | 'SUV' | 'EV' | 'ACCESSIBLE' | 'VIP';

export interface ParkingZone {
  id: string;
  name: string;
  code: string; // 'A', 'B', 'C', 'D'
  description: string;
  floor: number;
  entryGate: string;
  color: string;
  baseRatePerHour: number;
  totalSlots: number;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string; // e.g. "A-01"
  zoneCode: string; // "A"
  zoneId: string;
  type: SlotType;
  status: SlotStatus;
  floor: number;
  row: number;
  col: number;
  // 3D coordinates for Three.js
  x: number;
  z: number;
  rotation: number;
  // Distances from 4 gates in meters (used by ADSA Min-Heap)
  distanceFromGate1: number; // Gate 1: North (Mall Main Entrance)
  distanceFromGate2: number; // Gate 2: South (Cinema & Food Court)
  distanceFromGate3: number; // Gate 3: West (Hypermarket)
  distanceFromGate4: number; // Gate 4: East (VIP / EV Plaza)
  currentVehiclePlate?: string;
  currentVehicleModel?: string;
  occupiedSince?: string;
  hourlyRate: number;
}

export interface Vehicle {
  plateNumber: string;
  make: string;
  model: string;
  type: SlotType;
  color: string;
  ownerId: string;
  registeredAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  registeredAt: string;
  savedVehicles: Vehicle[];
  vehiclePlate?: string;
  vehicleModel?: string;
}

export type BookingStatus = 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  userName: string;
  vehiclePlate: string;
  vehicleModel: string;
  slotId: string;
  slotNumber: string;
  zoneCode: string;
  entryGate: string;
  startTime: string;
  endTime?: string;
  status: BookingStatus;
  hourlyRate: number;
  totalAmount?: number;
  qrCodeData: string;
  paymentStatus: 'PAID' | 'PENDING';
}

export interface OccupancyForecast {
  zoneCode: string;
  hour: number; // 8 to 23
  predictedOccupancyPercent: number;
  confidenceScore: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
}

export interface ZoneRecommendation {
  recommendedZoneCode: string;
  reason: string;
  availableSlotsCount: number;
  predictedOccupancyNow: number;
  predictedOccupancyNextHour: number;
  bestEntryGate: string;
  suggestedSlotId: string;
}

export interface HeapNode {
  slot: ParkingSlot;
  distance: number;
  gate: string;
}

export interface HeapTraceStep {
  step: number;
  action: string;
  heapState: { slotNumber: string; distance: number }[];
  description: string;
}

export interface DMGTQueryPreset {
  id: string;
  title: string;
  algebraExpression: string;
  sqlEquivalent: string;
  explanation: string;
  execute: () => any[];
}

export type AppTheme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'emerald' | 'sapphire' | 'cyber';

export interface ParkingHistoryItem {
  id: string;
  date: string; // e.g. "18 Sep"
  slotNumber: string; // e.g. "C03"
  zoneCode: string;
  durationHours: number; // e.g. 3
  amountPaid: number;
  vehiclePlate: string;
  status: 'COMPLETED' | 'CANCELLED';
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  direction: 'STRAIGHT' | 'RIGHT' | 'LEFT' | 'ARRIVED';
  landmark: string;
}
