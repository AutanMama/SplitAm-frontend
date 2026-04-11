const QUEUE_KEY = 'splitam_sync_queue';

export const addToOfflineQueue = (type, payload) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  const tempId = Date.now().toString();
  queue.push({ tempId, type, payload, status: 'pending' });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return tempId;
};

export const syncOfflineData = async (apiFunc) => {
  if (!navigator.onLine) return;
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (queue.length === 0) return;

  try {
    const { data } = await apiFunc.post('/sync/bulk', { queue });
    // Filter out successfully synced items
    const syncedIds = data.results.filter(r => r.status === 'synced').map(r => r.tempId);
    const remaining = queue.filter(item => !syncedIds.includes(item.tempId));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.error("Sync failed", err);
  }
};