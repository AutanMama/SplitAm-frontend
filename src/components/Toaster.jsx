import React, { useEffect, useState } from 'react';
import { subscribeToToasts } from '../services/toast';

/**
 * Global toaster — renders all toast messages in one consistent place.
 *  - Mobile: anchored above the bottom navbar so it's never hidden by keyboard or off-screen
 *  - Desktop: top-center, below the top navbar
 *  - Always above modals (z-[300])
 *  - Bigger and bolder than the old inline toasts so users can't miss it
 */
const Toaster = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeToToasts((item) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
      }, item.duration);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 md:bottom-auto md:top-24 z-[300] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const SuccessIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h0" />
  </svg>
);

const ToastItem = ({ item }) => {
  const isError = item.type === 'error';
  const bgClass = isError
    ? 'bg-rose-600 text-white border-rose-700'
    : 'bg-emerald-700 text-white border-emerald-800';

  return (
    <div
      className={`pointer-events-auto w-full max-w-md flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border-2 ${bgClass} animate-in slide-in-from-bottom-5 md:slide-in-from-top-5 fade-in duration-300`}
      role="status"
      aria-live="polite"
    >
      <div className={`shrink-0 rounded-full p-1.5 ${isError ? 'bg-rose-500/40' : 'bg-emerald-500/40'}`}>
        {isError ? <ErrorIcon /> : <SuccessIcon />}
      </div>
      <p className="text-sm font-bold leading-snug">{item.message}</p>
    </div>
  );
};

export default Toaster;
