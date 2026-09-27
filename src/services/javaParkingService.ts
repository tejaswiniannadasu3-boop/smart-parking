export class JavaParkingService {
  /**
   * Complete Java OOPJ source code representation for inspection
   */
  public static getJavaSourceCode(): { title: string; filename: string; code: string }[] {
    return [
      {
        title: 'ParkingLotManager (Singleton & Facade Pattern)',
        filename: 'ParkingLotManager.java',
        code: `package com.smartpark.core;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Singleton ParkingLotManager controlling thread-safe slot allocation,
 * vehicle admission, state transitions, and double-booking concurrency locks.
 */
public class ParkingLotManager {
    private static volatile ParkingLotManager instance;
    private final Map<String, ParkingSlot> slotRegistry;
    private final Map<String, Booking> activeBookings;
    private final ReentrantLock allocationLock;
    private AllocationStrategy currentStrategy;

    private ParkingLotManager() {
        this.slotRegistry = new ConcurrentHashMap<>();
        this.activeBookings = new ConcurrentHashMap<>();
        this.allocationLock = new ReentrantLock();
        this.currentStrategy = new NearestHeapAllocationStrategy();
    }

    public static ParkingLotManager getInstance() {
        if (instance == null) {
            synchronized (ParkingLotManager.class) {
                if (instance == null) {
                    instance = new ParkingLotManager();
                }
            }
        }
        return instance;
    }

    public synchronized Booking allocateSlot(Vehicle vehicle, Gate entryGate) 
            throws SlotUnavailableException, DoubleBookingException {
        allocationLock.lock();
        try {
            // Find optimal slot using selected Strategy (ADSA Min-Heap)
            ParkingSlot optimalSlot = currentStrategy.findSlot(
                new ArrayList<>(slotRegistry.values()), 
                vehicle, 
                entryGate
            );

            if (optimalSlot == null) {
                throw new SlotUnavailableException("No suitable parking bays currently free.");
            }

            // Enforce atomic state transition to prevent race conditions / double bookings
            if (optimalSlot.getStatus() != SlotStatus.AVAILABLE) {
                throw new DoubleBookingException("Slot " + optimalSlot.getSlotNumber() + " already occupied!");
            }

            optimalSlot.transitionState(SlotStatus.RESERVED);
            
            Booking booking = new Booking(
                UUID.randomUUID().toString(),
                vehicle.getPlateNumber(),
                optimalSlot.getId(),
                entryGate.getName(),
                LocalDateTime.now()
            );

            activeBookings.put(booking.getId(), booking);
            return booking;
        } finally {
            allocationLock.unlock();
        }
    }

    public void vehicleArrived(String bookingId) {
        Booking booking = activeBookings.get(bookingId);
        if (booking != null) {
            ParkingSlot slot = slotRegistry.get(booking.getSlotId());
            slot.transitionState(SlotStatus.OCCUPIED);
            booking.setStatus(BookingStatus.ACTIVE);
        }
    }

    public Receipt processVehicleExit(String bookingId) {
        Booking booking = activeBookings.remove(bookingId);
        if (booking != null) {
            ParkingSlot slot = slotRegistry.get(booking.getSlotId());
            slot.transitionState(SlotStatus.AVAILABLE);
            return new Receipt(booking, LocalDateTime.now());
        }
        throw new IllegalArgumentException("Invalid booking reference.");
    }
}`
      },
      {
        title: 'Strategy Pattern: NearestHeapAllocationStrategy',
        filename: 'NearestHeapAllocationStrategy.java',
        code: `package com.smartpark.strategy;

import com.smartpark.model.*;
import java.util.PriorityQueue;
import java.util.List;

/**
 * Strategy implementation using Min-Heap PriorityQueue (ADSA)
 * to evaluate and allocate nearest euclidean slot from driver entry gate.
 */
public class NearestHeapAllocationStrategy implements AllocationStrategy {

    @Override
    public ParkingSlot findSlot(List<ParkingSlot> slots, Vehicle vehicle, Gate gate) {
        // PriorityQueue min-heap ordered by distance from driver entrance
        PriorityQueue<SlotDistancePair> minHeap = new PriorityQueue<>(
            (a, b) -> Double.compare(a.distance, b.distance)
        );

        for (ParkingSlot slot : slots) {
            if (slot.getStatus() == SlotStatus.AVAILABLE && slot.isCompatible(vehicle.getType())) {
                double distance = gate.calculateDistance(slot.getX(), slot.getZ());
                minHeap.offer(new SlotDistancePair(slot, distance));
            }
        }

        SlotDistancePair nearest = minHeap.poll();
        return nearest != null ? nearest.slot : null;
    }

    private static class SlotDistancePair {
        final ParkingSlot slot;
        final double distance;
        SlotDistancePair(ParkingSlot s, double d) { this.slot = s; this.distance = d; }
    }
}`
      },
      {
        title: 'State Pattern: Slot State Lifecycle',
        filename: 'SlotState.java',
        code: `package com.smartpark.state;

/**
 * State Design Pattern managing valid state transitions:
 * AVAILABLE -> RESERVED -> OCCUPIED -> AVAILABLE
 */
public interface SlotState {
    void handleReservation(ParkingSlot context);
    void handleOccupancy(ParkingSlot context);
    void handleRelease(ParkingSlot context);
    String getStatusName();
}

public class AvailableState implements SlotState {
    @Override
    public void handleReservation(ParkingSlot context) {
        context.setState(new ReservedState());
    }
    @Override
    public void handleOccupancy(ParkingSlot context) {
        context.setState(new OccupiedState());
    }
    @Override
    public void handleRelease(ParkingSlot context) {
        // Already free
    }
    @Override
    public String getStatusName() { return "AVAILABLE"; }
}`
      }
    ];
  }
}
