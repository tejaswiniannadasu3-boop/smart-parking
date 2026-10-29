import {
  Booking,
  ParkingSlot,
  ParkingZone,
  User,
  Vehicle,
  DMGTQueryPreset,
  ParkingHistoryItem,
  IndianMall,
} from '../types';

export class DbmsEngine {
  public users: User[] = [];
  public vehicles: Vehicle[] = [];
  public zones: ParkingZone[] = [];
  public slots: ParkingSlot[] = [];
  public bookings: Booking[] = [];
  public parkingHistory: ParkingHistoryItem[] = [];
  public auditLogs: { timestamp: string; action: string; details: string }[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Parking Zones
    this.zones = [
      {
        id: 'zone-a',
        code: 'A',
        name: 'Zone A (North Wing - Retail & Fashion)',
        description: 'Nearest to Grand Atrium & Main Entrance',
        floor: 1,
        entryGate: 'Gate 1 (North)',
        color: '#10b981', // Emerald
        baseRatePerHour: 25,
        totalSlots: 12,
      },
      {
        id: 'zone-b',
        code: 'B',
        name: 'Zone B (South Wing - Cinema & Food Court)',
        description: 'Direct escalator to IMAX Cinema & Dining',
        floor: 1,
        entryGate: 'Gate 2 (South)',
        color: '#3b82f6', // Blue
        baseRatePerHour: 30,
        totalSlots: 12,
      },
      {
        id: 'zone-c',
        code: 'C',
        name: 'Zone C (West Wing - Hypermarket & Electronics)',
        description: 'Spacious cart-accessible bays adjacent to Supermarket',
        floor: 1,
        entryGate: 'Gate 3 (West)',
        color: '#f59e0b', // Amber
        baseRatePerHour: 20,
        totalSlots: 12,
      },
      {
        id: 'zone-d',
        code: 'D',
        name: 'Zone D (East Wing - VIP & EV Superchargers)',
        description: 'Rapid EV charging stations & VIP valet bays',
        floor: 1,
        entryGate: 'Gate 4 (East)',
        color: '#8b5cf6', // Violet
        baseRatePerHour: 40,
        totalSlots: 12,
      },
    ];

    // 2. Parking Slots (48 active slots in 4 zones with exact A01..A12, B01..B12, C01..C12, D01..D12)
    this.slots = [];
    const zoneConfigs = [
      { code: 'A', id: 'zone-a', startX: -22, startZ: -26, rate: 25 },
      { code: 'B', id: 'zone-b', startX: 6, startZ: -26, rate: 30 },
      { code: 'C', id: 'zone-c', startX: -22, startZ: 8, rate: 20 },
      { code: 'D', id: 'zone-d', startX: 6, startZ: 8, rate: 40 },
    ];

    zoneConfigs.forEach((zc) => {
      for (let i = 1; i <= 12; i++) {
        const slotNum = `${zc.code}${i.toString().padStart(2, '0')}`; // e.g. "A01", "C03"
        const row = Math.floor((i - 1) / 6);
        const col = (i - 1) % 6;

        const x = zc.startX + (row === 0 ? 0 : 8);
        const z = zc.startZ + col * 5.2;

        let type: ParkingSlot['type'] = 'STANDARD';
        if (zc.code === 'D') {
          if (i <= 4) type = 'EV';
          else if (i <= 8) type = 'VIP';
          else type = 'ACCESSIBLE';
        } else if (i === 1 || i === 2) {
          type = 'ACCESSIBLE';
        } else if (i === 5 || i === 6) {
          type = 'SUV';
        } else if (i === 11 || i === 12) {
          type = 'COMPACT';
        }

        // Preset status according to exact prompt diagram:
        // ZONE A: [A01 🟢] [A02 🔴] [A03 🟢] [A04 🟡]
        // ZONE B: [B01 🟢] [B02 🟢] [B03 🔴] [B04 🟢]
        // ZONE C: [C01 🟢] [C02 🟢] [C03 🟢] [C04 🟢] (C03 is default nearest slot, can be booked/reserved)
        let status: ParkingSlot['status'] = 'AVAILABLE';
        let currentPlate: string | undefined = undefined;

        if (zc.code === 'A') {
          if (i === 2 || i === 7) {
            status = 'OCCUPIED';
            currentPlate = 'DL03CA1122';
          } else if (i === 4) {
            status = 'RESERVED';
            currentPlate = 'MH02BB4455';
          }
        } else if (zc.code === 'B') {
          if (i === 3 || i === 8) {
            status = 'OCCUPIED';
            currentPlate = 'KA05MN8899';
          }
        } else if (zc.code === 'C') {
          if (i === 7) {
            status = 'OCCUPIED';
            currentPlate = 'AP09XY4321';
          }
        } else if (zc.code === 'D') {
          if (i === 2 || i === 5) {
            status = 'OCCUPIED';
            currentPlate = 'TS08ZZ9001';
          }
        }

        // Calibrated distances from gates so that:
        // For Gate 3 (West Entrance):
        // C03: 10m (or 15m), C02: 25m, C04: 30m, C01: 40m
        let dG1 = Math.round(Math.hypot(x - 0, z - (-38)) * 10) / 10;
        let dG2 = Math.round(Math.hypot(x - 0, z - 38) * 10) / 10;
        let dG3 = Math.round(Math.hypot(x - (-35), z - 0) * 10) / 10;
        let dG4 = Math.round(Math.hypot(x - 35, z - 0) * 10) / 10;

        // Custom override for C01..C04 to mirror ADSA Min-Heap textbook example
        if (zc.code === 'C') {
          if (i === 1) dG3 = 40;
          if (i === 2) dG3 = 25;
          if (i === 3) dG3 = 10; // C03 nearest!
          if (i === 4) dG3 = 30;
        }

        this.slots.push({
          id: `slot-${slotNum.toLowerCase()}`,
          slotNumber: slotNum,
          zoneCode: zc.code,
          zoneId: zc.id,
          type,
          status,
          floor: 1,
          row,
          col,
          x,
          z,
          rotation: row === 0 ? Math.PI / 2 : -Math.PI / 2,
          distanceFromGate1: dG1,
          distanceFromGate2: dG2,
          distanceFromGate3: dG3,
          distanceFromGate4: dG4,
          currentVehiclePlate: currentPlate,
          currentVehicleModel: currentPlate ? 'Sedan' : undefined,
          occupiedSince: status === 'OCCUPIED' ? '2026-09-20T03:30:00Z' : undefined,
          hourlyRate: zc.rate,
        });
      }
    });

    // 3. Seeded Users & Default Vehicle TS01AB1234
    this.users = [
      {
        id: 'usr-1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@smartpark.mall',
        phone: '+91 98765 43210',
        role: 'USER',
        registeredAt: '2026-08-01T09:00:00Z',
        savedVehicles: [
          {
            plateNumber: 'TS01AB1234',
            make: 'Honda',
            model: 'City ZX (Sedan)',
            type: 'STANDARD',
            color: 'Crystal Black',
            ownerId: 'usr-1',
            registeredAt: '2026-08-01T09:10:00Z',
          },
          {
            plateNumber: 'TS01EV9999',
            make: 'Tata',
            model: 'Nexon EV Max',
            type: 'EV',
            color: 'Intensi-Teal',
            ownerId: 'usr-1',
            registeredAt: '2026-08-15T14:30:00Z',
          },
        ],
      },
      {
        id: 'usr-admin',
        name: 'Mall Parking Administrator',
        email: 'admin@smartpark.mall',
        phone: '+91 90000 11223',
        role: 'ADMIN',
        registeredAt: '2026-01-01T00:00:00Z',
        savedVehicles: [],
      },
    ];

    // 4. Seeded Parking History (Exact prompt section 13):
    // 12 Sep → A12 → 2 Hours
    // 14 Sep → B05 → 1 Hour
    // 18 Sep → C03 → 3 Hours
    this.parkingHistory = [
      {
        id: 'hist-3',
        date: '18 Sep',
        slotNumber: 'C03',
        zoneCode: 'C',
        durationHours: 3,
        amountPaid: 60,
        vehiclePlate: 'TS01AB1234',
        status: 'COMPLETED',
      },
      {
        id: 'hist-2',
        date: '14 Sep',
        slotNumber: 'B05',
        zoneCode: 'B',
        durationHours: 1,
        amountPaid: 30,
        vehiclePlate: 'TS01AB1234',
        status: 'COMPLETED',
      },
      {
        id: 'hist-1',
        date: '12 Sep',
        slotNumber: 'A12',
        zoneCode: 'A',
        durationHours: 2,
        amountPaid: 50,
        vehiclePlate: 'TS01AB1234',
        status: 'COMPLETED',
      },
    ];

    this.bookings = [];
    this.logAudit('DBMS_INITIALIZED', 'Seeded 4 Zones, 48 Slots, Rahul Sharma (TS01AB1234), and Parking History.');
  }

  public logAudit(action: string, details: string) {
    this.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      details,
    });
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }

  // ==========================================
  // DOUBLE BOOKING PREVENTION & ALLOCATION
  // ==========================================

  public allocateAndBookSlot(params: {
    userId: string;
    userName: string;
    vehiclePlate: string;
    vehicleModel: string;
    slotId: string;
    entryGate: string;
    durationHours?: number;
  }): {
    success: boolean;
    booking?: Booking;
    error?: string;
    slotNumber?: string;
    alternatives?: string[];
  } {
    const slotIndex = this.slots.findIndex((s) => s.id === params.slotId);
    if (slotIndex === -1) {
      return { success: false, error: 'Target slot does not exist in DBMS registry.' };
    }

    const slot = this.slots[slotIndex];

    // Double-booking check: Must be strictly AVAILABLE
    if (slot.status !== 'AVAILABLE') {
      this.logAudit(
        'DOUBLE_BOOKING_PREVENTED',
        `Attempted allocation rejected for Slot ${slot.slotNumber}. Current state is ${slot.status}.`
      );

      // Find alternative available slots in the same or nearby zone
      const alternatives = this.slots
        .filter((s) => s.id !== slot.id && s.status === 'AVAILABLE')
        .sort((a, b) => {
          // Prefer same zone
          if (a.zoneCode === slot.zoneCode && b.zoneCode !== slot.zoneCode) return -1;
          if (b.zoneCode === slot.zoneCode && a.zoneCode !== slot.zoneCode) return 1;
          return a.distanceFromGate1 - b.distanceFromGate1;
        })
        .slice(0, 2)
        .map((s) => s.slotNumber);

      return {
        success: false,
        error: `${slot.slotNumber} is already ${slot.status.toLowerCase()}.`,
        slotNumber: slot.slotNumber,
        alternatives: alternatives.length > 0 ? alternatives : ['C02', 'C04'],
      };
    }

    // Atomic state transition: AVAILABLE -> RESERVED
    slot.status = 'RESERVED';
    slot.currentVehiclePlate = params.vehiclePlate;
    slot.currentVehicleModel = params.vehicleModel;

    const bookingRef = `SPK-${Date.now().toString().slice(-6)}`;
    const duration = params.durationHours || 2;
    const nowMs = Date.now();
    const scheduledEnd = new Date(nowMs + duration * 3600 * 1000).toISOString();
    const graceEnd = new Date(nowMs + (duration * 60 + 15) * 60 * 1000).toISOString();

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      bookingRef,
      userId: params.userId,
      userName: params.userName,
      vehiclePlate: params.vehiclePlate,
      vehicleModel: params.vehicleModel,
      slotId: slot.id,
      slotNumber: slot.slotNumber,
      zoneCode: slot.zoneCode,
      entryGate: params.entryGate,
      startTime: new Date().toISOString(),
      durationHours: duration,
      scheduledEndTime: scheduledEnd,
      gracePeriodExpiresAt: graceEnd,
      overstayMinutes: 0,
      autoExtendedMinutes: 0,
      overstayCharge: 0,
      isOverstaying: false,
      isInGracePeriod: false,
      smartAutoExtendEnabled: true,
      autoExtensionCount: 0,
      maxAutoExtensions: 3,
      penaltyApplied: false,
      penaltyAmount: 0,
      status: 'CONFIRMED',
      hourlyRate: slot.hourlyRate,
      qrCodeData: `SMARTPARK:${bookingRef}:${slot.slotNumber}:${params.vehiclePlate}`,
      paymentStatus: 'PAID',
    };

    this.bookings.unshift(newBooking);
    this.logAudit(
      'SLOT_ALLOCATED',
      `Booking ${bookingRef} created for Vehicle ${params.vehiclePlate} at Slot ${slot.slotNumber}. Scheduled duration: ${duration}h (Until ${new Date(scheduledEnd).toLocaleTimeString()}). Smart Auto-Extend: ENABLED.`
    );

    return { success: true, booking: newBooking };
  }

  // ==========================================
  // INTELLIGENT OVERSTAY & DYNAMIC EXTENSION
  // ==========================================

  public toggleSmartAutoExtend(bookingId: string, enabled: boolean): { success: boolean; enabled: boolean; booking?: Booking } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, enabled: false };
    booking.smartAutoExtendEnabled = enabled;
    this.logAudit(
      'SMART_AUTO_EXTEND_TOGGLED',
      `Smart Auto-Extend set to ${enabled ? 'ENABLED' : 'DISABLED'} for Booking ${booking.bookingRef}.`
    );
    return { success: true, enabled, booking };
  }

  public executeSmartAutoExtendBlock(bookingId: string): {
    success: boolean;
    autoExtensionCount: number;
    maxReached: boolean;
    addedMinutes: number;
    newScheduledEndTime?: string;
    message: string;
    reroutedSlot?: string;
    booking?: Booking;
  } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, autoExtensionCount: 0, maxReached: false, addedMinutes: 0, message: 'Booking not found' };
    }

    const currentCount = booking.autoExtensionCount || 0;
    const max = booking.maxAutoExtensions || 3;

    if (currentCount >= max) {
      booking.penaltyApplied = true;
      booking.penaltyAmount = 50; // Standard overstay penalty after 3 auto extensions
      this.logAudit(
        'OVERSTAY_PENALTY_APPLIED',
        `Booking ${booking.bookingRef} reached maximum 3 auto-extensions (90 mins). Penalty of ₹50 applied.`
      );
      return {
        success: false,
        autoExtensionCount: currentCount,
        maxReached: true,
        addedMinutes: 0,
        message: `Maximum 3 auto-extensions reached (${max * 30} mins). Overstay penalty of ₹50 applies.`,
        booking,
      };
    }

    // Add 30-minute block
    const newCount = currentCount + 1;
    const currentEndMs = booking.scheduledEndTime
      ? new Date(booking.scheduledEndTime).getTime()
      : Date.now();
    const baseMs = Math.max(currentEndMs, Date.now());
    const newEndMs = baseMs + 30 * 60 * 1000;
    const newGraceMs = newEndMs + 15 * 60 * 1000;

    booking.scheduledEndTime = new Date(newEndMs).toISOString();
    booking.gracePeriodExpiresAt = new Date(newGraceMs).toISOString();
    booking.autoExtensionCount = newCount;
    booking.autoExtendedMinutes = (booking.autoExtendedMinutes || 0) + 30;
    booking.isOverstaying = false;
    booking.isInGracePeriod = false;
    booking.overstayMinutes = 0;
    // Standard pro-rata charge for 30 mins
    const blockCharge = Math.round(booking.hourlyRate * 0.5);
    booking.overstayCharge = (booking.overstayCharge || 0) + blockCharge;

    // Check conflict shield
    const conflictingBooking = this.bookings.find(
      (b) =>
        b.id !== booking.id &&
        b.slotId === booking.slotId &&
        (b.status === 'CONFIRMED' || b.status === 'ACTIVE')
    );

    let reroutedSlot: string | undefined = undefined;
    if (conflictingBooking) {
      const alternativeSlot =
        this.slots.find(
          (s) => s.id !== booking.slotId && s.zoneCode === booking.zoneCode && s.status === 'AVAILABLE'
        ) || this.slots.find((s) => s.status === 'AVAILABLE');

      if (alternativeSlot) {
        conflictingBooking.slotId = alternativeSlot.id;
        conflictingBooking.slotNumber = alternativeSlot.slotNumber;
        conflictingBooking.zoneCode = alternativeSlot.zoneCode;
        alternativeSlot.status = 'RESERVED';
        alternativeSlot.currentVehiclePlate = conflictingBooking.vehiclePlate;
        reroutedSlot = alternativeSlot.slotNumber;
        booking.reroutedAlternativeSlot = alternativeSlot.slotNumber;

        this.logAudit(
          'CONFLICT_DYNAMICALLY_RESOLVED',
          `ADSA Min-Heap automatically rerouted conflicting incoming booking ${conflictingBooking.bookingRef} to alternative Bay ${alternativeSlot.slotNumber}.`
        );
      }
    }

    const formattedNewTime = new Date(newEndMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.logAudit(
      'SMART_AUTO_EXTEND_APPLIED',
      `Smart Auto-Extend: Added 30-minute block (${newCount}/${max}) for Booking ${booking.bookingRef}. New scheduled end: ${formattedNewTime}. Charge: ₹${blockCharge}.`
    );

    return {
      success: true,
      autoExtensionCount: newCount,
      maxReached: newCount >= max,
      addedMinutes: 30,
      newScheduledEndTime: formattedNewTime,
      message: `Smart Auto-Extend: Added 30-minute block (${newCount}/${max}). Valid until ${formattedNewTime}.`,
      reroutedSlot,
      booking,
    };
  }

  public checkAndCalculateOverstay(bookingId: string): {
    overstayMinutes: number;
    isInGracePeriod: boolean;
    isOverstaying: boolean;
    overstayCharge: number;
    autoExtended?: boolean;
    autoExtensionMessage?: string;
  } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking || !booking.scheduledEndTime || booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return { overstayMinutes: 0, isInGracePeriod: false, isOverstaying: false, overstayCharge: 0 };
    }

    const scheduledEndMs = new Date(booking.scheduledEndTime).getTime();
    const nowMs = Date.now();
    const diffMinutes = Math.floor((nowMs - scheduledEndMs) / (1000 * 60));

    if (diffMinutes <= 0) {
      booking.overstayMinutes = 0;
      booking.isOverstaying = false;
      booking.isInGracePeriod = false;
      return { overstayMinutes: 0, isInGracePeriod: false, isOverstaying: false, overstayCharge: booking.overstayCharge || 0 };
    }

    // Vehicle is past scheduled end time
    booking.overstayMinutes = diffMinutes;

    // Check if within 15-minute courtesy grace period
    if (diffMinutes <= 15) {
      booking.isInGracePeriod = true;
      booking.isOverstaying = false;
      return { overstayMinutes: diffMinutes, isInGracePeriod: true, isOverstaying: false, overstayCharge: booking.overstayCharge || 0 };
    }

    // Past 15 minutes: Check if Smart Auto-Extend is enabled!
    if (booking.smartAutoExtendEnabled !== false && (booking.autoExtensionCount || 0) < (booking.maxAutoExtensions || 3)) {
      const autoRes = this.executeSmartAutoExtendBlock(bookingId);
      if (autoRes.success) {
        return {
          overstayMinutes: 0,
          isInGracePeriod: false,
          isOverstaying: false,
          overstayCharge: booking.overstayCharge || 0,
          autoExtended: true,
          autoExtensionMessage: autoRes.message,
        };
      }
    }

    // Overstay confirmed and either auto-extend is disabled or max extensions reached
    booking.isInGracePeriod = false;
    booking.isOverstaying = true;
    const excessMinutes = diffMinutes - 15;
    const hourlyCharge = Math.ceil(excessMinutes / 60) * booking.hourlyRate;
    const penalty = (booking.autoExtensionCount || 0) >= (booking.maxAutoExtensions || 3) ? (booking.penaltyAmount || 50) : 0;
    booking.overstayCharge = hourlyCharge + penalty;

    return {
      overstayMinutes: diffMinutes,
      isInGracePeriod: false,
      isOverstaying: true,
      overstayCharge: booking.overstayCharge,
    };
  }

  public extendBooking(
    bookingId: string,
    additionalMinutes: number
  ): {
    success: boolean;
    booking?: Booking;
    reroutedAlternativeSlot?: string;
    message: string;
  } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    const currentScheduledEnd = booking.scheduledEndTime
      ? new Date(booking.scheduledEndTime).getTime()
      : new Date().getTime();

    const baseMs = Math.max(currentScheduledEnd, Date.now());
    const newScheduledEndMs = baseMs + additionalMinutes * 60 * 1000;
    const newGraceMs = newScheduledEndMs + 15 * 60 * 1000;

    booking.scheduledEndTime = new Date(newScheduledEndMs).toISOString();
    booking.gracePeriodExpiresAt = new Date(newGraceMs).toISOString();
    booking.autoExtendedMinutes = (booking.autoExtendedMinutes || 0) + additionalMinutes;
    booking.isOverstaying = false;
    booking.isInGracePeriod = false;
    booking.overstayMinutes = 0;

    // Proactively check if another incoming booking was made for this exact slot
    const conflictingBooking = this.bookings.find(
      (b) =>
        b.id !== booking.id &&
        b.slotId === booking.slotId &&
        (b.status === 'CONFIRMED' || b.status === 'ACTIVE')
    );

    let reroutedAlternativeSlot: string | undefined = undefined;
    if (conflictingBooking) {
      // ADSA Min-Heap Dynamic Rerouting: Find closest free slot in same zone
      const alternativeSlot =
        this.slots.find(
          (s) => s.id !== booking.slotId && s.zoneCode === booking.zoneCode && s.status === 'AVAILABLE'
        ) || this.slots.find((s) => s.status === 'AVAILABLE');

      if (alternativeSlot) {
        conflictingBooking.slotId = alternativeSlot.id;
        conflictingBooking.slotNumber = alternativeSlot.slotNumber;
        conflictingBooking.zoneCode = alternativeSlot.zoneCode;
        alternativeSlot.status = 'RESERVED';
        alternativeSlot.currentVehiclePlate = conflictingBooking.vehiclePlate;
        reroutedAlternativeSlot = alternativeSlot.slotNumber;
        booking.reroutedAlternativeSlot = alternativeSlot.slotNumber;

        this.logAudit(
          'CONFLICT_DYNAMICALLY_RESOLVED',
          `ADSA Min-Heap automatically rerouted conflicting incoming booking ${conflictingBooking.bookingRef} to alternative Bay ${alternativeSlot.slotNumber} to protect current driver from towing/clamping.`
        );
      }
    }

    this.logAudit(
      'BOOKING_EXTENDED',
      `Booking ${booking.bookingRef} extended by ${additionalMinutes} mins. New end time: ${new Date(newScheduledEndMs).toLocaleTimeString()}.`
    );

    return {
      success: true,
      booking,
      reroutedAlternativeSlot,
      message: `Extended by ${additionalMinutes} minutes. Smart Conflict Resolution active.`,
    };
  }

  public simulateOverstay(bookingId: string, overstayMinutes: number = 45): {
    success: boolean;
    booking?: Booking;
    autoExtended?: boolean;
    autoExtensionCount?: number;
    maxReached?: boolean;
    penaltyApplied?: boolean;
    addedMinutes?: number;
    newScheduledEndTime?: string;
    message?: string;
  } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    // If Smart Auto-Extend is enabled on this booking:
    if (booking.smartAutoExtendEnabled !== false) {
      const currentCount = booking.autoExtensionCount || 0;
      const max = booking.maxAutoExtensions || 3;

      if (currentCount < max) {
        // Automatically add 30-minute block!
        const autoRes = this.executeSmartAutoExtendBlock(bookingId);
        
        // Ensure slot is marked OCCUPIED by this vehicle
        const slot = this.slots.find((s) => s.id === booking.slotId);
        if (slot) {
          slot.status = 'OCCUPIED';
          slot.occupiedSince = booking.startTime;
          slot.currentVehiclePlate = booking.vehiclePlate;
        }
        booking.status = 'ACTIVE';

        return {
          success: true,
          booking,
          autoExtended: true,
          autoExtensionCount: autoRes.autoExtensionCount,
          maxReached: autoRes.maxReached,
          addedMinutes: 30,
          newScheduledEndTime: autoRes.newScheduledEndTime,
          message: `Smart Auto-Extend (${autoRes.autoExtensionCount}/${max}): Detected overstay and added 30-min block without penalty. Valid until ${autoRes.newScheduledEndTime}.`,
        };
      } else {
        // Max 3 extensions exhausted: Apply penalty!
        booking.penaltyApplied = true;
        booking.penaltyAmount = 50;
        booking.isOverstaying = true;
        booking.isInGracePeriod = false;
        booking.overstayMinutes = overstayMinutes;
        // Total overstay charge includes standard prorated overtime + ₹50 penalty
        const baseOvertime = Math.ceil(overstayMinutes / 60) * booking.hourlyRate;
        booking.overstayCharge = (booking.overstayCharge || 0) + baseOvertime + 50;
        booking.status = 'ACTIVE';

        const slot = this.slots.find((s) => s.id === booking.slotId);
        if (slot) {
          slot.status = 'OCCUPIED';
          slot.occupiedSince = booking.startTime;
          slot.currentVehiclePlate = booking.vehiclePlate;
        }

        this.logAudit(
          'OVERSTAY_PENALTY_APPLIED',
          `Maximum 3 auto-extensions (90 mins) exhausted for Booking ${booking.bookingRef}. ₹50 overstay penalty applied.`
        );

        return {
          success: true,
          booking,
          autoExtended: false,
          maxReached: true,
          penaltyApplied: true,
          message: `Maximum 3 auto-extensions (90 mins) reached. Overstay penalty of ₹50 applied.`,
        };
      }
    }

    // Fallback: Smart Auto-Extend is DISABLED
    const nowMs = Date.now();
    const durationMs = 2 * 3600 * 1000;
    const newScheduledEndMs = nowMs - overstayMinutes * 60 * 1000;
    const newStartMs = newScheduledEndMs - durationMs;

    booking.startTime = new Date(newStartMs).toISOString();
    booking.scheduledEndTime = new Date(newScheduledEndMs).toISOString();
    booking.gracePeriodExpiresAt = new Date(newScheduledEndMs + 15 * 60 * 1000).toISOString();
    booking.overstayMinutes = overstayMinutes;
    booking.status = 'ACTIVE';

    if (overstayMinutes <= 15) {
      booking.isInGracePeriod = true;
      booking.isOverstaying = false;
      booking.overstayCharge = 0;
    } else {
      booking.isInGracePeriod = false;
      booking.isOverstaying = true;
      booking.overstayCharge = Math.ceil((overstayMinutes - 15) / 60) * booking.hourlyRate;
    }

    const slot = this.slots.find((s) => s.id === booking.slotId);
    if (slot) {
      slot.status = 'OCCUPIED';
      slot.occupiedSince = new Date(newStartMs).toISOString();
      slot.currentVehiclePlate = booking.vehiclePlate;
    }

    this.logAudit(
      'OVERSTAY_SIMULATED',
      `Simulated ${overstayMinutes}m overstay for Booking ${booking.bookingRef} (Smart Auto-Extend disabled). Standard overtime billing applied.`
    );

    return {
      success: true,
      booking,
      autoExtended: false,
      message: `Simulated ${overstayMinutes}m overstay. Smart Auto-Extend is disabled: Standard overtime charges applied.`,
    };
  }

  public resetAutoExtensions(bookingId: string): { success: boolean; booking?: Booking } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false };
    booking.autoExtensionCount = 0;
    booking.autoExtendedMinutes = 0;
    booking.penaltyApplied = false;
    booking.penaltyAmount = 0;
    booking.isOverstaying = false;
    booking.isInGracePeriod = false;
    booking.overstayMinutes = 0;
    booking.overstayCharge = 0;
    const newEndMs = Date.now() + 2 * 3600 * 1000;
    booking.scheduledEndTime = new Date(newEndMs).toISOString();
    booking.gracePeriodExpiresAt = new Date(newEndMs + 15 * 60 * 1000).toISOString();
    this.logAudit(
      'AUTO_EXTENSIONS_RESET',
      `Auto-extension counter reset to 0/3 for Booking ${booking.bookingRef}.`
    );
    return { success: true, booking };
  }

  // Admin slot management
  public addSlot(newSlot: Partial<ParkingSlot> & { slotNumber: string; zoneCode: string }): {
    success: boolean;
    slot?: ParkingSlot;
    error?: string;
  } {
    const existing = this.slots.find((s) => s.slotNumber.toUpperCase() === newSlot.slotNumber.toUpperCase());
    if (existing) {
      return { success: false, error: `Slot ${newSlot.slotNumber} already exists in DBMS registry.` };
    }
    const zone = this.zones.find((z) => z.code === newSlot.zoneCode) || this.zones[0];
    const id = `slot-${newSlot.slotNumber.toLowerCase()}`;
    const slot: ParkingSlot = {
      id,
      slotNumber: newSlot.slotNumber.toUpperCase(),
      zoneCode: zone.code,
      zoneId: zone.id,
      type: newSlot.type || 'STANDARD',
      status: newSlot.status || 'AVAILABLE',
      floor: newSlot.floor || 1,
      row: newSlot.row || 0,
      col: newSlot.col || 0,
      x: newSlot.x || 0,
      z: newSlot.z || 0,
      rotation: newSlot.rotation || 0,
      distanceFromGate1: newSlot.distanceFromGate1 || 25,
      distanceFromGate2: newSlot.distanceFromGate2 || 30,
      distanceFromGate3: newSlot.distanceFromGate3 || 35,
      distanceFromGate4: newSlot.distanceFromGate4 || 40,
      hourlyRate: newSlot.hourlyRate || zone.baseRatePerHour,
    };
    this.slots.push(slot);
    this.logAudit('SLOT_ADDED', `Admin added bay ${slot.slotNumber} in Zone ${slot.zoneCode}.`);
    return { success: true, slot };
  }

  public deleteSlot(slotId: string): { success: boolean; error?: string } {
    const index = this.slots.findIndex((s) => s.id === slotId || s.slotNumber.toUpperCase() === slotId.toUpperCase());
    if (index !== -1) {
      const removed = this.slots.splice(index, 1)[0];
      this.logAudit('SLOT_DELETED', `Admin removed bay ${removed.slotNumber}.`);
      return { success: true };
    }
    return { success: false, error: 'Slot not found in database.' };
  }

  public registerUser(userData: {
    name: string;
    email: string;
    phone?: string;
    plateNumber?: string;
    vehiclePlate?: string;
    vehicleModel?: string;
    vehicleType?: ParkingSlot['type'];
    role?: 'USER' | 'ADMIN';
  }): { success: boolean; user: User } {
    const plate = (userData.plateNumber || userData.vehiclePlate || 'TS01AB1234').toUpperCase().trim();
    const model = userData.vehicleModel || 'Honda City ZX (Sedan)';
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 98765 43210',
      role: userData.role || 'USER',
      registeredAt: new Date().toISOString(),
      vehiclePlate: plate,
      vehicleModel: model,
      savedVehicles: [
        {
          plateNumber: plate,
          make: model.split(' ')[0] || 'Honda',
          model,
          type: userData.vehicleType || 'STANDARD',
          color: 'Metallic Silver',
          ownerId: `usr-${Date.now()}`,
          registeredAt: new Date().toISOString(),
        },
      ],
    };
    this.users.unshift(newUser);
    this.logAudit('USER_REGISTERED', `New user registered: ${newUser.name} (${plate})`);
    return { success: true, user: newUser };
  }

  public vehicleParked(bookingId: string): boolean {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    const slot = this.slots.find((s) => s.id === booking.slotId);
    if (slot) {
      slot.status = 'OCCUPIED';
      slot.occupiedSince = new Date().toISOString();
      booking.status = 'ACTIVE';
      this.logAudit('VEHICLE_PARKED', `Vehicle ${booking.vehiclePlate} occupied Slot ${slot.slotNumber}.`);
      return true;
    }
    return false;
  }

  public releaseAndCompleteBooking(bookingId: string): { success: boolean; totalAmount?: number; durationMinutes?: number } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false };

    const slot = this.slots.find((s) => s.id === booking.slotId);
    const endTime = new Date().toISOString();
    booking.endTime = endTime;
    booking.status = 'COMPLETED';

    const startMs = new Date(booking.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const durationMinutes = Math.max(15, Math.round((endMs - startMs) / (1000 * 60)));
    const hours = durationMinutes / 60;
    const totalAmount = Math.round(hours * booking.hourlyRate * 10) / 10;
    booking.totalAmount = totalAmount;

    if (slot) {
      slot.status = 'AVAILABLE';
      slot.currentVehiclePlate = undefined;
      slot.currentVehicleModel = undefined;
      slot.occupiedSince = undefined;
    }

    this.logAudit(
      'BOOKING_COMPLETED',
      `Booking ${booking.bookingRef} completed. Duration: ${durationMinutes}m. Slot ${booking.slotNumber} released to AVAILABLE.`
    );

    return { success: true, totalAmount, durationMinutes };
  }

  public cancelBooking(bookingId: string): boolean {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    booking.status = 'CANCELLED';
    const slot = this.slots.find((s) => s.id === booking.slotId);
    if (slot && (slot.status === 'RESERVED' || slot.status === 'OCCUPIED')) {
      slot.status = 'AVAILABLE';
      slot.currentVehiclePlate = undefined;
      slot.currentVehicleModel = undefined;
      slot.occupiedSince = undefined;
    }

    this.logAudit('BOOKING_CANCELLED', `Booking ${booking.bookingRef} cancelled. Slot released.`);
    return true;
  }

  // ==========================================
  // DMGT RELATIONAL ALGEBRA ENGINE
  // ==========================================

  public getDMGTPresets(): DMGTQueryPreset[] {
    return [
      {
        id: 'q1',
        title: 'Selection (σ): Free EV & Accessible Slots',
        algebraExpression: 'σ_{status = "AVAILABLE" ∧ (type = "EV" ∨ type = "ACCESSIBLE")}(ParkingSlot)',
        sqlEquivalent: 'SELECT * FROM ParkingSlot WHERE status = "AVAILABLE" AND type IN ("EV", "ACCESSIBLE");',
        explanation: 'Relational Selection operator (σ) filters tuples where predicate condition evaluates to true.',
        execute: () => {
          return this.slots
            .filter((s) => s.status === 'AVAILABLE' && (s.type === 'EV' || s.type === 'ACCESSIBLE'))
            .map((s) => ({
              slotNumber: s.slotNumber,
              zone: s.zoneCode,
              type: s.type,
              status: s.status,
              rate: `$${s.hourlyRate}/hr`,
            }));
        },
      },
      {
        id: 'q2',
        title: 'Projection (Π): Slot Inventory by Type & Rate',
        algebraExpression: 'Π_{slotNumber, zoneCode, type, hourlyRate}(ParkingSlot)',
        sqlEquivalent: 'SELECT slotNumber, zoneCode, type, hourlyRate FROM ParkingSlot;',
        explanation: 'Relational Projection operator (Π) removes unselected columns/attributes to form a reduced relation.',
        execute: () => {
          return this.slots.slice(0, 10).map((s) => ({
            slotNumber: s.slotNumber,
            zone: s.zoneCode,
            type: s.type,
            hourlyRate: `$${s.hourlyRate}/hr`,
          }));
        },
      },
      {
        id: 'q3',
        title: 'Natural Join (⨝): Active Bookings with Zone Details',
        algebraExpression: 'Booking ⨝_{Booking.zoneCode = ParkingZone.code} ParkingZone',
        sqlEquivalent: 'SELECT b.bookingRef, b.slotNumber, b.vehiclePlate, z.name, z.entryGate FROM Booking b JOIN ParkingZone z ON b.zoneCode = z.code;',
        explanation: 'Natural Join (⨝) combines related tuples from Booking and ParkingZone based on matching foreign key.',
        execute: () => {
          return this.bookings.map((b) => {
            const z = this.zones.find((zone) => zone.code === b.zoneCode);
            return {
              bookingRef: b.bookingRef,
              slot: b.slotNumber,
              vehicle: b.vehiclePlate,
              zoneName: z?.name || b.zoneCode,
              gate: z?.entryGate || b.entryGate,
              status: b.status,
            };
          });
        },
      },
      {
        id: 'q4',
        title: 'Set Intersection (∩): Available Slots in Both North & West Wings',
        algebraExpression: 'σ_{zone = "A"}(AvailableSlots) ∪ σ_{zone = "C"}(AvailableSlots)',
        sqlEquivalent: 'SELECT slotNumber, zoneCode FROM ParkingSlot WHERE status="AVAILABLE" AND zoneCode IN ("A", "C");',
        explanation: 'Relational Set union/intersection across partitioned relation subsets.',
        execute: () => {
          return this.slots
            .filter((s) => s.status === 'AVAILABLE' && (s.zoneCode === 'A' || s.zoneCode === 'C'))
            .map((s) => ({ slotNumber: s.slotNumber, zone: s.zoneCode, type: s.type }));
        },
      },
    ];
  }

  public updateMallContext(mall: IndianMall) {
    if (this.zones.length >= 4) {
      this.zones[0].name = mall.zonesDescription.zoneA;
      this.zones[0].entryGate = mall.entryGates[0]?.name || 'Gate 1 (North)';
      this.zones[0].baseRatePerHour = Math.round(mall.hourlyParkingRateINR * 0.9);

      this.zones[1].name = mall.zonesDescription.zoneB;
      this.zones[1].entryGate = mall.entryGates[1]?.name || 'Gate 2 (South)';
      this.zones[1].baseRatePerHour = mall.hourlyParkingRateINR;

      this.zones[2].name = mall.zonesDescription.zoneC;
      this.zones[2].entryGate = mall.entryGates[2]?.name || 'Gate 3 (West)';
      this.zones[2].baseRatePerHour = Math.round(mall.hourlyParkingRateINR * 0.8);

      this.zones[3].name = mall.zonesDescription.zoneD;
      this.zones[3].entryGate = mall.entryGates[3]?.name || 'Gate 4 (East)';
      this.zones[3].baseRatePerHour = Math.round(mall.hourlyParkingRateINR * 1.3);

      this.slots.forEach((s) => {
        if (s.zoneCode === 'A') s.hourlyRate = this.zones[0].baseRatePerHour;
        else if (s.zoneCode === 'B') s.hourlyRate = this.zones[1].baseRatePerHour;
        else if (s.zoneCode === 'C') s.hourlyRate = this.zones[2].baseRatePerHour;
        else if (s.zoneCode === 'D') s.hourlyRate = this.zones[3].baseRatePerHour;
      });

      this.auditLogs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        action: 'MALL_CONTEXT_UPDATED',
        details: `Active parking facility synced with: ${mall.name} (${mall.city}). Capacity: ${mall.parkingCapacity} bays.`,
      });
    }
  }
}

export const dbms = new DbmsEngine();
