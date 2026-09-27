import { ParkingSlot, HeapNode, HeapTraceStep } from '../types';

export class AdsaMinHeap {
  private heap: HeapNode[] = [];
  public trace: HeapTraceStep[] = [];

  constructor() {
    this.heap = [];
    this.trace = [];
  }

  public clear(): void {
    this.heap = [];
    this.trace = [];
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public getHeapArray(): HeapNode[] {
    return [...this.heap];
  }

  private parentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private rightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  private logTrace(action: string, description: string): void {
    this.trace.push({
      step: this.trace.length + 1,
      action,
      heapState: this.heap.map((node) => ({
        slotNumber: node.slot.slotNumber,
        distance: Math.round(node.distance * 10) / 10,
      })),
      description,
    });
  }

  public insert(node: HeapNode): void {
    this.heap.push(node);
    this.logTrace(
      'INSERT',
      `Inserted Slot ${node.slot.slotNumber} (Distance: ${node.distance.toFixed(1)}m from ${node.gate}) at index ${this.heap.length - 1}`
    );
    this.heapifyUp(this.heap.length - 1);
  }

  private heapifyUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = this.parentIndex(current);
      if (this.heap[current].distance < this.heap[parent].distance) {
        this.logTrace(
          'HEAPIFY_UP_SWAP',
          `Distance ${this.heap[current].distance.toFixed(1)}m (${this.heap[current].slot.slotNumber}) < ${this.heap[parent].distance.toFixed(1)}m (${this.heap[parent].slot.slotNumber}). Swapping indices ${current} and ${parent}.`
        );
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  public peek(): HeapNode | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public extractMin(): HeapNode | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) {
      const min = this.heap.pop()!;
      this.logTrace('EXTRACT_MIN', `Extracted minimum slot ${min.slot.slotNumber} (Distance: ${min.distance.toFixed(1)}m). Heap is now empty.`);
      return min;
    }

    const min = this.heap[0];
    const last = this.heap.pop()!;
    this.heap[0] = last;
    this.logTrace(
      'EXTRACT_MIN',
      `Extracted min root ${min.slot.slotNumber} (${min.distance.toFixed(1)}m). Moved leaf ${last.slot.slotNumber} (${last.distance.toFixed(1)}m) to root.`
    );
    this.heapifyDown(0);
    return min;
  }

  private heapifyDown(index: number): void {
    let smallest = index;
    const left = this.leftChildIndex(index);
    const right = this.rightChildIndex(index);
    const size = this.heap.length;

    if (left < size && this.heap[left].distance < this.heap[smallest].distance) {
      smallest = left;
    }
    if (right < size && this.heap[right].distance < this.heap[smallest].distance) {
      smallest = right;
    }

    if (smallest !== index) {
      this.logTrace(
        'HEAPIFY_DOWN_SWAP',
        `Root value ${this.heap[index].distance.toFixed(1)}m violated min-heap property against child ${this.heap[smallest].distance.toFixed(1)}m (${this.heap[smallest].slot.slotNumber}). Swapping.`
      );
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  /**
   * Builds the Min-Heap for available slots given a reference gate
   */
  public static buildFromSlots(
    slots: ParkingSlot[],
    gate: 'Gate 1' | 'Gate 2' | 'Gate 3' | 'Gate 4' = 'Gate 1',
    filterType?: string
  ): { heap: AdsaMinHeap; nearest: HeapNode | null } {
    const minHeap = new AdsaMinHeap();

    // Filter slots that are AVAILABLE (or not OCCUPIED/RESERVED)
    const availableSlots = slots.filter((slot) => {
      if (slot.status !== 'AVAILABLE') return false;
      if (filterType && filterType !== 'ALL' && slot.type !== filterType) return false;
      return true;
    });

    for (const slot of availableSlots) {
      let dist = slot.distanceFromGate1;
      if (gate === 'Gate 2') dist = slot.distanceFromGate2;
      else if (gate === 'Gate 3') dist = slot.distanceFromGate3;
      else if (gate === 'Gate 4') dist = slot.distanceFromGate4;

      minHeap.insert({
        slot,
        distance: dist,
        gate,
      });
    }

    const nearest = minHeap.peek();
    return { heap: minHeap, nearest };
  }
}
