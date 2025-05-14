"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor() {
        this.listeners = [];
    }
    /**
     * Adds a listener to the event with optional priority.
     * @param callback The function to call when the event is invoked.
     * @param priority Determines order of execution (higher = earlier).
     */
    addListener(callback, priority = 0) {
        this.listeners.push({ callback, priority });
        this.listeners.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Removes a listener from the event.
     * @param callback The same function used to subscribe.
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l.callback !== callback);
    }
    /**
     * Invokes the event, calling all listeners in priority order.
     * @param data Optional event data to pass to listeners.
     */
    invoke(data) {
        for (const listener of this.listeners) {
            listener.callback(data);
        }
    }
    /**
     * Clears all listeners.
     */
    clear() {
        this.listeners.length = 0;
    }
}
exports.Event = Event;
