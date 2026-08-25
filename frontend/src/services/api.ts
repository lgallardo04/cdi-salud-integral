import { CDIDataState, KPIStats } from '../types';
import { LocalDataService } from './storage';

// Configurable API base URL (por ejemplo para backend Python FastAPI o despliegue en la nube)
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export class ApiService {
  private static useRemoteBackend = false;

  public static setUseRemoteBackend(enabled: boolean) {
    this.useRemoteBackend = enabled;
  }

  public static isRemoteBackendEnabled(): boolean {
    return this.useRemoteBackend;
  }

  public static async checkBackendHealth(): Promise<{ online: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, message: data.status || 'Conectado a FastAPI' };
      }
      return { online: false, message: 'Servidor respondió con error' };
    } catch {
      return { online: false, message: 'Backend remoto fuera de línea (usando motor local offline)' };
    }
  }

  public static async getAll<K extends keyof CDIDataState>(collection: K): Promise<CDIDataState[K]> {
    if (this.useRemoteBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/${String(collection)}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('API error, falling back to LocalStorage', e);
      }
    }
    return LocalDataService.getAll(collection);
  }

  public static async getById<K extends keyof CDIDataState>(collection: K, id: string): Promise<any | null> {
    if (this.useRemoteBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/${String(collection)}/${id}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('API error, falling back to LocalStorage', e);
      }
    }
    return LocalDataService.getById(collection, id);
  }

  public static async create<K extends keyof CDIDataState>(collection: K, item: any): Promise<any> {
    if (this.useRemoteBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/${String(collection)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('API error, saving locally', e);
      }
    }
    return LocalDataService.create(collection, item);
  }

  public static async update<K extends keyof CDIDataState>(collection: K, id: string, data: any): Promise<any> {
    if (this.useRemoteBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/${String(collection)}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('API error, updating locally', e);
      }
    }
    return LocalDataService.update(collection, id, data);
  }

  public static async delete<K extends keyof CDIDataState>(collection: K, id: string): Promise<boolean> {
    if (this.useRemoteBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/${String(collection)}/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          return true;
        }
      } catch (e) {
        console.warn('API error, deleting locally', e);
      }
    }
    return LocalDataService.delete(collection, id);
  }

  public static getKPIs(): KPIStats {
    return LocalDataService.getKPIs();
  }
}
