import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CDIDataState,
  KPIStats,
  Paciente,
  Medicamento,
  MovimientoFarmacia,
  Cita,
  Tratamiento,
  Empleado,
  Departamento,
  Cargo,
  Proveedor,
  Horario,
  Usuario,
  Rol
} from '../types';
import { LocalDataService } from '../services/storage';
import { SupabaseService, CloudStatusInfo } from '../services/supabase';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface DataContextType {
  data: CDIDataState;
  kpis: KPIStats;
  refreshData: () => void;
  // Generic CRUD
  createItem: <K extends keyof CDIDataState>(collection: K, item: any) => any;
  updateItem: <K extends keyof CDIDataState>(collection: K, id: string, updatedData: any) => any;
  deleteItem: <K extends keyof CDIDataState>(collection: K, id: string) => boolean;
  // Helpers
  resetAllData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  // Cloud Sync
  cloudStatus: CloudStatusInfo;
  syncWithCloud: () => Promise<void>;
  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CDIDataState>(() => ({
    roles: LocalDataService.getAll('roles'),
    usuarios: LocalDataService.getAll('usuarios'),
    departamentos: LocalDataService.getAll('departamentos'),
    cargos: LocalDataService.getAll('cargos'),
    empleados: LocalDataService.getAll('empleados'),
    horarios: LocalDataService.getAll('horarios'),
    pacientes: LocalDataService.getAll('pacientes'),
    proveedores: LocalDataService.getAll('proveedores'),
    medicamentos: LocalDataService.getAll('medicamentos'),
    movimientosFarmacia: LocalDataService.getAll('movimientosFarmacia'),
    citas: LocalDataService.getAll('citas'),
    tratamientos: LocalDataService.getAll('tratamientos'),
    // Colecciones Nuevas
    ordenesLaboratorio: LocalDataService.getAll('ordenesLaboratorio'),
    estudiosImagen: LocalDataService.getAll('estudiosImagen'),
    camasHospitalarias: LocalDataService.getAll('camasHospitalarias'),
    admisionesHospitalarias: LocalDataService.getAll('admisionesHospitalarias'),
    registrosTriaje: LocalDataService.getAll('registrosTriaje'),
    odontogramas: LocalDataService.getAll('odontogramas'),
    teleconsultas: LocalDataService.getAll('teleconsultas'),
    interconsultas: LocalDataService.getAll('interconsultas'),
    serviciosTarifas: LocalDataService.getAll('serviciosTarifas'),
    facturas: LocalDataService.getAll('facturas'),
    registrosAuditoria: LocalDataService.getAll('registrosAuditoria'),
    casosEpidemiologicos: LocalDataService.getAll('casosEpidemiologicos'),
    evaluacionesNutricionales: LocalDataService.getAll('evaluacionesNutricionales'),
    consultasOftalmicas: LocalDataService.getAll('consultasOftalmicas'),
    candidatosMisionMilagro: LocalDataService.getAll('candidatosMisionMilagro')
  }));

  const [kpis, setKpis] = useState<KPIStats>(() => LocalDataService.getKPIs());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [cloudStatus, setCloudStatus] = useState<CloudStatusInfo>(() => SupabaseService.getStatus());

  useEffect(() => {
    const unsubscribe = SupabaseService.subscribe((status) => {
      setCloudStatus(status);
    });
    return unsubscribe;
  }, []);

  const refreshData = useCallback(() => {
    setData({
      roles: LocalDataService.getAll('roles'),
      usuarios: LocalDataService.getAll('usuarios'),
      departamentos: LocalDataService.getAll('departamentos'),
      cargos: LocalDataService.getAll('cargos'),
      empleados: LocalDataService.getAll('empleados'),
      horarios: LocalDataService.getAll('horarios'),
      pacientes: LocalDataService.getAll('pacientes'),
      proveedores: LocalDataService.getAll('proveedores'),
      medicamentos: LocalDataService.getAll('medicamentos'),
      movimientosFarmacia: LocalDataService.getAll('movimientosFarmacia'),
      citas: LocalDataService.getAll('citas'),
      tratamientos: LocalDataService.getAll('tratamientos'),
      // Colecciones Nuevas
      ordenesLaboratorio: LocalDataService.getAll('ordenesLaboratorio'),
      estudiosImagen: LocalDataService.getAll('estudiosImagen'),
      camasHospitalarias: LocalDataService.getAll('camasHospitalarias'),
      admisionesHospitalarias: LocalDataService.getAll('admisionesHospitalarias'),
      registrosTriaje: LocalDataService.getAll('registrosTriaje'),
      odontogramas: LocalDataService.getAll('odontogramas'),
      teleconsultas: LocalDataService.getAll('teleconsultas'),
      interconsultas: LocalDataService.getAll('interconsultas'),
      serviciosTarifas: LocalDataService.getAll('serviciosTarifas'),
      facturas: LocalDataService.getAll('facturas'),
      registrosAuditoria: LocalDataService.getAll('registrosAuditoria'),
      casosEpidemiologicos: LocalDataService.getAll('casosEpidemiologicos'),
      evaluacionesNutricionales: LocalDataService.getAll('evaluacionesNutricionales'),
      consultasOftalmicas: LocalDataService.getAll('consultasOftalmicas'),
      candidatosMisionMilagro: LocalDataService.getAll('candidatosMisionMilagro')
    });
    setKpis(LocalDataService.getKPIs());
  }, []);


  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const createItem = <K extends keyof CDIDataState>(collection: K, item: any): any => {
    const created = LocalDataService.create(collection, item);
    refreshData();
    // Replicación asíncrona hacia Supabase Cloud
    SupabaseService.saveItem(collection, created, true).catch(() => {});
    addToast(`Elemento registrado exitosamente en ${String(collection)}`, 'success');
    return created;
  };

  const updateItem = <K extends keyof CDIDataState>(collection: K, id: string, updatedData: any): any => {
    const updated = LocalDataService.update(collection, id, updatedData);
    refreshData();
    // Replicación asíncrona hacia Supabase Cloud
    if (updated) {
      SupabaseService.saveItem(collection, updated, false).catch(() => {});
    }
    addToast(`Registro actualizado correctamente`, 'info');
    return updated;
  };

  const deleteItem = <K extends keyof CDIDataState>(collection: K, id: string): boolean => {
    const success = LocalDataService.delete(collection, id);
    if (success) {
      refreshData();
      // Replicación asíncrona hacia Supabase Cloud
      SupabaseService.deleteItem(collection, id).catch(() => {});
      addToast(`Registro eliminado satisfactoriamente`, 'warning');
    }
    return success;
  };

  const syncWithCloud = async () => {
    addToast('Iniciando sincronización con Supabase Cloud...', 'info');
    try {
      const result = await SupabaseService.syncAll();
      if (result.success) {
        addToast(`Sincronización cloud completa (${result.syncedCollections} módulos)`, 'success');
      } else {
        addToast(`Sincronizado (${result.syncedCollections} módulos OK, alertas en ${result.errors.length})`, 'warning');
      }
    } catch (e: any) {
      addToast(`Error al sincronizar: ${e?.message || 'Error de red'}`, 'error');
    }
  };

  const resetAllData = () => {
    LocalDataService.resetToDefaults();
    refreshData();
    addToast('Base de datos restaurada a valores clínicos iniciales', 'info');
  };

  const exportDatabaseJSON = () => {
    return LocalDataService.exportJSON();
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    const success = LocalDataService.importJSON(jsonStr);
    if (success) {
      refreshData();
      addToast('Base de datos importada exitosamente', 'success');
    } else {
      addToast('Error al importar el archivo JSON', 'error');
    }
    return success;
  };

  return (
    <DataContext.Provider
      value={{
        data,
        kpis,
        refreshData,
        createItem,
        updateItem,
        deleteItem,
        resetAllData,
        exportDatabaseJSON,
        importDatabaseJSON,
        cloudStatus,
        syncWithCloud,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
