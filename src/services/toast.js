/**
 * Global toast system. Any component can import { toast } and call
 *   toast.success('Saved')
 *   toast.error('Something broke')
 *
 * A single <Toaster /> in App.jsx renders all messages in a consistent place.
 */

const listeners = new Set();
let nextId = 1;

const dispatch = (item) => {
  listeners.forEach((fn) => {
    try {
      fn(item);
    } catch {
      // ignore listener errors
    }
  });
};

export const toast = {
  show: (message, options = {}) => {
    if (!message) return null;
    const item = {
      id: nextId++,
      message: String(message),
      type: options.type === 'error' ? 'error' : 'success',
      duration: typeof options.duration === 'number' ? options.duration : 4000,
    };
    dispatch(item);
    return item.id;
  },
  success: (message, options) => toast.show(message, { ...options, type: 'success' }),
  error: (message, options) => toast.show(message, { ...options, type: 'error' }),
};

export const subscribeToToasts = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
