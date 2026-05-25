const QUEUE_KEY = 'splitam_sync_queue';

const readQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeQueue = (queue) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const addToOfflineQueue = (type, payload) => {
  const queue = readQueue();
  const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  queue.push({ tempId, type, payload: { ...payload, tempId }, status: 'pending' });
  writeQueue(queue);
  return tempId;
};

export const getPendingCount = () => readQueue().filter((i) => i.status !== 'synced').length;

let isSyncing = false;

export const syncOfflineData = async (api) => {
  if (!navigator.onLine || isSyncing) return { synced: 0, failed: 0 };
  const queue = readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  isSyncing = true;
  try {
    const { data } = await api.post('/sync/bulk', {
      queue: queue.map(({ tempId, type, payload }) => ({ tempId, type, payload })),
    });

    const results = data?.results || [];
    const byTempId = new Map(results.map((r) => [r.tempId, r]));

    const remaining = queue.filter((item) => {
      const r = byTempId.get(item.tempId);
      return !r || r.status !== 'synced';
    });

    writeQueue(remaining);

    const synced = results.filter((r) => r.status === 'synced').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    return { synced, failed };
  } catch (err) {
    console.error('Sync failed', err);
    return { synced: 0, failed: queue.length };
  } finally {
    isSyncing = false;
  }
};
