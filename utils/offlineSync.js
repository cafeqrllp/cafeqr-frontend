import api from './api';
import {
  getQueuedOperations,
  markOperationFailed,
  markOperationSynced,
  setSyncMetadata,
  upsertEntities,
} from './offlineStore';

let syncInFlight = false;

function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export async function bootstrapOfflineData() {
  if (!isOnline()) {
    return null;
  }

  const response = await api.get('/api/v1/sync/bootstrap', {
    skipOfflineCache: true,
    skipOfflineQueue: true,
  });
  const data = unwrapData(response);

  if (!data) {
    return null;
  }

  await Promise.all([
    upsertEntities('products', data.products || []),
    upsertEntities('categories', data.categories || []),
    upsertEntities('uoms', data.uoms || []),
    upsertEntities('variantGroups', data.variantGroups || []),
    upsertEntities('tables', data.tables || []),
    upsertEntities('orders', data.orders || []),
    setSyncMetadata('lastBootstrapAt', data.serverTime || new Date().toISOString()),
    setSyncMetadata('lastChangeCursor', data.serverTime || new Date().toISOString()),
  ]);

  return data;
}

export async function syncQueuedOperations() {
  if (syncInFlight || !isOnline()) {
    return { skipped: true };
  }

  syncInFlight = true;

  try {
    const operations = await getQueuedOperations();
    if (!operations.length) {
      return { pushed: 0 };
    }

    const response = await api.post(
      '/api/v1/sync/push',
      { operations },
      {
        skipOfflineCache: true,
        skipOfflineQueue: true,
      }
    );

    const data = unwrapData(response);
    const results = data?.results || [];

    await Promise.all(results.map((result) => {
      if (result.success) {
        return markOperationSynced(result.operationId, result);
      }
      return markOperationFailed(result.operationId, result.message);
    }));

    if (data?.serverTime) {
      await setSyncMetadata('lastSuccessfulSyncAt', data.serverTime);
    }

    return { pushed: operations.length, results };
  } finally {
    syncInFlight = false;
  }
}

export function registerOfflineSyncListeners() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const run = () => {
    syncQueuedOperations().catch((error) => {
      console.warn('[Offline Sync] Sync attempt failed:', error?.message || error);
    });
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      run();
    }
  };

  window.addEventListener('online', run);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const intervalId = window.setInterval(run, 60000);
  run();

  return () => {
    window.removeEventListener('online', run);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.clearInterval(intervalId);
  };
}
