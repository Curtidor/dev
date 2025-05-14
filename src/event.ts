type EventCallback<T> = (data: T) => void;

interface Listener<T> {
  callback: EventCallback<T>;
  priority: number;
}

export class Event<T = void> {
  private listeners: Listener<T>[] = [];

  /**
   * Adds a listener to the event with optional priority.
   * @param callback The function to call when the event is invoked.
   * @param priority Determines order of execution (higher = earlier).
   */
  addListener(callback: EventCallback<T>, priority: number = 0): void {
    this.listeners.push({ callback, priority });
    this.listeners.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Removes a listener from the event.
   * @param callback The same function used to subscribe.
   */
  removeListener(callback: EventCallback<T>): void {
    this.listeners = this.listeners.filter(l => l.callback !== callback);
  }

  /**
   * Invokes the event, calling all listeners in priority order.
   * @param data Optional event data to pass to listeners.
   */
  invoke(data: T): void {
    for (const listener of this.listeners) {
      listener.callback(data);
    }
  }

  /**
   * Clears all listeners.
   */
  clear(): void {
    this.listeners.length = 0;
  }
}
