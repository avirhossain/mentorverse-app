// A simple, lightweight event emitter.
type Listener<T> = (data: T) => void;

class EventEmitter<T> {
  private listeners: Map<string, Listener<T>[]> = new Map();

  on(event: string, listener: Listener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Listener<T>): void {
    if (!this.listeners.has(event)) {
      return;
    }
    const eventListeners = this.listeners.get(event)!;
    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  }

  emit(event: string, data: T): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(listener => listener(data));
    }
  }
}

// Global error emitter instance for Firestore permission errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorEmitter = new EventEmitter<any>();
