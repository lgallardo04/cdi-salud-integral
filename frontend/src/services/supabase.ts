import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CDIDataState } from '../types';
import { LocalDataService } from './storage';

export type CloudConnectionState = 'connected' | 'offline' | 'connecting' | 'error';

export interface CloudStatusInfo {
  state: CloudConnectionState;
  message: string;
  latencyMs?: number;
  lastChecked?: string;
  projectRef: string;
}

// Configuración de Supabase
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://oqlgfjtbjpmgpvqhvllz.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGdmanRianBtZ3B2cWh2bGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTgyNTcsImV4cCI6MjEwMzIzNDI1N30.zJqtuQTXWDYVnVwnmIskBjCrfbS3xZQXr1dv2ZmAhzA';

export const SUPABASE_PROJECT_REF = 'oqlgfjtbjpmgpvqhvllz';

// Cliente Supabase instanciado
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Mapeo de colecciones frontend (camelCase) a tablas PostgreSQL / Supabase (snake_case)
export const COLLECTION_TO_TABLE: Record<keyof CDIDataState, string> = {
  roles: 'roles',
  usuarios: 'usuarios',
  departamentos: 'departamentos',
  cargos: 'cargos',
  empleados: 'empleados',
  horarios: 'horarios',
  pacientes: 'pacientes',
  proveedores: 'proveedores',
  medicamentos: 'medicamentos',
  movimientosFarmacia: 'movimientos_farmacia',
  citas: 'citas',
  tratamientos: 'tratamientos',
  ordenesLaboratorio: 'ordenes_laboratorio',
  estudiosImagen: 'estudios_imagen',
  camasHospitalarias: 'camas_hospitalarias',
  admisionesHospitalarias: 'admisiones_hospitalarias',
  registrosTriaje: 'registros_triaje',
  odontogramas: 'odontogramas',
  teleconsultas: 'teleconsultas',
  interconsultas: 'interconsultas',
  serviciosTarifas: 'servicios_tarifas',
  facturas: 'facturas',
  registrosAuditoria: 'registros_auditoria',
  casosEpidemiologicos: 'casos_epidemiologicos',
  evaluacionesNutricionales: 'evaluaciones_nutricionales',
  consultasOftalmicas: 'consultas_oftalmicas',
  candidatosMisionMilagro: 'candidatos_mision_milagro',
};

type ConnectionListener = (status: CloudStatusInfo) => void;

class SupabaseServiceClass {
  private status: CloudStatusInfo = {
    state: 'connecting',
    message: 'Inicializando conexión con Supabase Cloud...',
    projectRef: SUPABASE_PROJECT_REF,
  };

  private listeners: Set<ConnectionListener> = new Set();
  private isCloudSyncEnabled: boolean = true;
  private checkIntervalId: any = null;

  constructor() {
    this.initListeners();
    // Ejecutar chequeo inicial diferido para no bloquear el inicio
    setTimeout(() => {
      this.checkConnection();
    }, 100);
  }

  private initListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.checkConnection();
      });
      window.addEventListener('offline', () => {
        this.updateStatus({
          state: 'offline',
          message: 'Sin conexión de red (Modo Offline LocalStorage Activo)',
          lastChecked: new Date().toLocaleTimeString(),
        });
      });
    }
  }

  public subscribe(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateStatus(partial: Partial<CloudStatusInfo>) {
    this.status = {
      ...this.status,
      ...partial,
      projectRef: SUPABASE_PROJECT_REF,
    };
    this.listeners.forEach((l) => l(this.status));
  }

  public getStatus(): CloudStatusInfo {
    return this.status;
  }

  public isCloudEnabled(): boolean {
    return this.isCloudSyncEnabled;
  }

  public setCloudEnabled(enabled: boolean) {
    this.isCloudSyncEnabled = enabled;
    if (enabled) {
      this.checkConnection();
    } else {
      this.updateStatus({
        state: 'offline',
        message: 'Modo Offline Forzado por el Operador',
        lastChecked: new Date().toLocaleTimeString(),
      });
    }
  }

  /**
   * Verifica la conectividad con el cluster Supabase Cloud y mide latencia
   */
  public async checkConnection(): Promise<CloudStatusInfo> {
    if (!navigator.onLine) {
      this.updateStatus({
        state: 'offline',
        message: 'Sin conexión de red local',
        lastChecked: new Date().toLocaleTimeString(),
      });
      return this.status;
    }

    const start = performance.now();
    try {
      // Pinging Supabase Rest Endpoint o tabla de pacientes
      const { error } = await supabase
        .from('pacientes')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

      const latency = Math.round(performance.now() - start);

      if (error) {
        // Si la tabla no existe o error de RLS, pero responde el cluster HTTP 200/400
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.code === '42P01') {
          this.updateStatus({
            state: 'connected',
            message: `Supabase Cloud activo (${latency}ms) - Tablas pendientes de migración`,
            latencyMs: latency,
            lastChecked: new Date().toLocaleTimeString(),
          });
        } else {
          this.updateStatus({
            state: 'connected',
            message: `Supabase Cloud Conectado (${latency}ms)`,
            latencyMs: latency,
            lastChecked: new Date().toLocaleTimeString(),
          });
        }
      } else {
        this.updateStatus({
          state: 'connected',
          message: `Supabase Cloud Conectado (${latency}ms)`,
          latencyMs: latency,
          lastChecked: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      this.updateStatus({
        state: 'offline',
        message: `Offline (Fallback LocalStorage activo) - ${err?.message || 'Error de red'}`,
        latencyMs: latency,
        lastChecked: new Date().toLocaleTimeString(),
      });
    }

    return this.status;
  }

  /**
   * Helpers dual-mode para colecciones
   */
  public async fetchCollection<K extends keyof CDIDataState>(
    collection: K
  ): Promise<CDIDataState[K] | null> {
    if (!this.isCloudSyncEnabled || this.status.state === 'offline') {
      return null;
    }

    const tableName = COLLECTION_TO_TABLE[collection];
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (!error && Array.isArray(data)) {
        return data as unknown as CDIDataState[K];
      }
    } catch (e) {
      console.warn(`[SupabaseService] Error consultando tabla ${tableName}:`, e);
    }
    return null;
  }

  public async syncCollectionToCloud<K extends keyof CDIDataState>(
    collection: K
  ): Promise<{ count: number; error?: string }> {
    const tableName = COLLECTION_TO_TABLE[collection];
    const items = LocalDataService.getAll(collection) as any[];

    if (!items || items.length === 0) {
      return { count: 0 };
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .upsert(items, { onConflict: 'id' });

      if (error) {
        return { count: 0, error: error.message };
      }
      return { count: items.length };
    } catch (e: any) {
      return { count: 0, error: e?.message || 'Error desconocido' };
    }
  }

  /**
   * Sincronización bidireccional / híbrida completa
   */
  public async syncAll(): Promise<{
    success: boolean;
    syncedCollections: number;
    errors: string[];
  }> {
    const collections = Object.keys(COLLECTION_TO_TABLE) as (keyof CDIDataState)[];
    const errors: string[] = [];
    let synced = 0;

    for (const col of collections) {
      const res = await this.syncCollectionToCloud(col);
      if (res.error) {
        errors.push(`${String(col)}: ${res.error}`);
      } else {
        synced++;
      }
    }

    return {
      success: errors.length === 0,
      syncedCollections: synced,
      errors,
    };
  }

  /**
   * Guardar o actualizar un ítem con sincronización en la nube y persistencia local
   */
  public async saveItem<K extends keyof CDIDataState>(
    collection: K,
    item: any,
    isNew: boolean = false
  ): Promise<any> {
    // Siempre persistir primero en LocalStorage para garantizar offline-first
    const savedLocal = isNew
      ? LocalDataService.create(collection, item)
      : LocalDataService.update(collection, item.id, item);

    // Intentar sincronizar en segundo plano con Supabase si está disponible
    if (this.isCloudSyncEnabled && this.status.state === 'connected') {
      const tableName = COLLECTION_TO_TABLE[collection];
      (async () => {
        try {
          const { error } = await supabase
            .from(tableName)
            .upsert(savedLocal, { onConflict: 'id' });
          if (error) {
            console.warn(`[SupabaseSync] Error replicando ${tableName}:`, error.message);
          }
        } catch (err: any) {
          console.warn(`[SupabaseSync] Error de red al replicar ${tableName}:`, err);
        }
      })();
    }

    return savedLocal;
  }

  /**
   * Eliminar un ítem con sincronización en la nube y persistencia local
   */
  public async deleteItem<K extends keyof CDIDataState>(
    collection: K,
    id: string
  ): Promise<boolean> {
    const deletedLocal = LocalDataService.delete(collection, id);

    if (deletedLocal && this.isCloudSyncEnabled && this.status.state === 'connected') {
      const tableName = COLLECTION_TO_TABLE[collection];
      (async () => {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);
          if (error) {
            console.warn(`[SupabaseSync] Error eliminando en ${tableName}:`, error.message);
          }
        } catch (err: any) {
          console.warn(`[SupabaseSync] Error de red al eliminar en ${tableName}:`, err);
        }
      })();
    }

    return deletedLocal;
  }
}

export const SupabaseService = new SupabaseServiceClass();
