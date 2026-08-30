/**
 * Wovemark Reactive Data Store & REST Client
 */

export interface DataSourceState<T = any> {
  id: string;
  src: string;
  status: "idle" | "loading" | "success" | "error";
  data: T;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshTimer?: any;
}

export type StoreListener = (storeState: Record<string, any>) => void;

export class DataStore {
  private sources: Map<string, DataSourceState> = new Map();
  private mockRegistry: Map<string, any> = new Map();
  private listeners: Set<StoreListener> = new Set();

  public registerSource(id: string, src: string, mockData?: any, autoRefreshSeconds?: number) {
    if (mockData !== undefined) {
      this.mockRegistry.set(id, mockData);
    }

    const existing = this.sources.get(id);
    if (existing && existing.src === src) {
      return;
    }

    const initialState: DataSourceState = {
      id,
      src,
      status: "idle",
      data: mockData !== undefined ? mockData : null,
      error: null,
      lastUpdated: null,
    };

    this.sources.set(id, initialState);

    // Initial fetch
    this.fetchSource(id);

    // Auto-refresh interval
    if (autoRefreshSeconds && autoRefreshSeconds > 0) {
      if (initialState.autoRefreshTimer) {
        clearInterval(initialState.autoRefreshTimer);
      }
      initialState.autoRefreshTimer = setInterval(() => {
        this.fetchSource(id);
      }, autoRefreshSeconds * 1000);
    }
  }

  public async fetchSource(id: string) {
    const source = this.sources.get(id);
    if (!source) return;

    source.status = "loading";
    this.notify();

    // Check if mock is explicitly set
    if (this.mockRegistry.has(id)) {
      source.data = this.mockRegistry.get(id);
      source.status = "success";
      source.lastUpdated = Date.now();
      this.notify();
      return;
    }

    try {
      if (typeof fetch === "undefined") {
        throw new Error("Fetch is not available in this environment.");
      }

      const res = await fetch(source.src);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      source.data = json;
      source.status = "success";
      source.error = null;
      source.lastUpdated = Date.now();
    } catch (err: any) {
      // If network fetch fails and we have mock fallback or initial data
      if (this.mockRegistry.has(id)) {
        source.data = this.mockRegistry.get(id);
        source.status = "success";
      } else {
        source.status = "error";
        source.error = err.message || "Failed to fetch data";
      }
    }

    this.notify();
  }

  public setMock(id: string, mockData: any) {
    this.mockRegistry.set(id, mockData);
    const source = this.sources.get(id);
    if (source) {
      source.data = mockData;
      source.status = "success";
      this.notify();
    }
  }

  public async createItem(sourceId: string, item: any, endpoint?: string) {
    const source = this.sources.get(sourceId);
    const targetUrl = endpoint || source?.src;

    if (this.mockRegistry.has(sourceId) || !targetUrl) {
      // In-memory mock mutation
      const currentData = Array.isArray(source?.data) ? [...source.data] : [];
      const newItem = { id: item.id || `item-${Date.now()}`, ...item };
      currentData.unshift(newItem);
      this.mockRegistry.set(sourceId, currentData);
      if (source) {
        source.data = currentData;
        source.status = "success";
      }
      this.notify();
      return newItem;
    }

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const created = await res.json();
      await this.fetchSource(sourceId);
      return created;
    } catch (err) {
      console.error(`Failed to create item for source '${sourceId}':`, err);
      throw err;
    }
  }

  public async deleteItem(sourceId: string, itemId: string | number, endpoint?: string) {
    const source = this.sources.get(sourceId);
    
    if (this.mockRegistry.has(sourceId) || !source?.src) {
      // In-memory mock deletion
      if (Array.isArray(source?.data)) {
        const filtered = source.data.filter((item: any) => String(item.id) !== String(itemId));
        this.mockRegistry.set(sourceId, filtered);
        source.data = filtered;
        this.notify();
      }
      return;
    }

    try {
      const url = endpoint ? endpoint : `${source.src}/${itemId}`;
      await fetch(url, { method: "DELETE" });
      await this.fetchSource(sourceId);
    } catch (err) {
      console.error(`Failed to delete item '${itemId}':`, err);
      throw err;
    }
  }

  public getStateSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    for (const [id, state] of this.sources.entries()) {
      snapshot[id] = state.data;
      snapshot[`$${id}`] = state;
    }
    return snapshot;
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = this.getStateSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  public reset() {
    for (const source of this.sources.values()) {
      if (source.autoRefreshTimer) {
        clearInterval(source.autoRefreshTimer);
      }
    }
    this.sources.clear();
    this.mockRegistry.clear();
  }
}

export const dataStore = new DataStore();
