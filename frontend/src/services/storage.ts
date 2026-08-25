import { CDIDataState, ModuloNombre, KPIStats, MovimientoFarmacia, Medicamento } from '../types';
import { getInitialDataState } from './seedData';

const STORAGE_KEY = 'CDI_SALUD_INTEGRAL_DATA_V2';

export class LocalDataService {
  private static getState(): CDIDataState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const initial = getInitialDataState();
      if (!data) {
        this.saveState(initial);
        return initial;
      }
      const parsed = JSON.parse(data) as CDIDataState;
      // Merge with initial in case new collections were added
      const merged: CDIDataState = {
        ...initial,
        ...parsed,
        ordenesLaboratorio: parsed.ordenesLaboratorio || initial.ordenesLaboratorio,
        estudiosImagen: parsed.estudiosImagen || initial.estudiosImagen,
        camasHospitalarias: parsed.camasHospitalarias || initial.camasHospitalarias,
        admisionesHospitalarias: parsed.admisionesHospitalarias || initial.admisionesHospitalarias,
        registrosTriaje: parsed.registrosTriaje || initial.registrosTriaje,
        odontogramas: parsed.odontogramas || initial.odontogramas,
        teleconsultas: parsed.teleconsultas || initial.teleconsultas,
        interconsultas: parsed.interconsultas || initial.interconsultas,
        serviciosTarifas: parsed.serviciosTarifas || initial.serviciosTarifas,
        facturas: parsed.facturas || initial.facturas,
        registrosAuditoria: parsed.registrosAuditoria || initial.registrosAuditoria,
        casosEpidemiologicos: parsed.casosEpidemiologicos || initial.casosEpidemiologicos
      };
      return merged;
    } catch (e) {
      console.error('Error reading localStorage, resetting to defaults', e);
      const initial = getInitialDataState();
      this.saveState(initial);
      return initial;
    }
  }

  private static saveState(state: CDIDataState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  public static getAll<K extends keyof CDIDataState>(collection: K): CDIDataState[K] {
    const state = this.getState();
    return state[collection] || ([] as unknown as CDIDataState[K]);
  }

  public static getById<K extends keyof CDIDataState>(
    collection: K,
    id: string
  ): any | null {
    const items = this.getAll(collection) as any[];
    return items.find((item) => item.id === id) || null;
  }

  public static create<K extends keyof CDIDataState>(
    collection: K,
    item: any
  ): any {
    const state = this.getState();
    const items = (state[collection] as any[]) || [];
    
    // Asignar ID si no viene
    const newItem = {
      ...item,
      id: item.id || `${String(collection).substring(0, 3)}-${Date.now()}`
    };

    items.unshift(newItem);
    state[collection] = items as any;

    // Manejo de efectos secundarios como stock en Farmacia
    if (collection === 'movimientosFarmacia') {
      this.handleFarmaciaStockUpdate(state, newItem as MovimientoFarmacia);
    }

    // Auto-registrar evento de auditoría
    this.recordAuditLog(state, 'CREAR', collection as ModuloNombre, `Creación de nuevo registro en ${String(collection)} ID: ${newItem.id}`);

    this.saveState(state);
    return newItem;
  }

  public static update<K extends keyof CDIDataState>(
    collection: K,
    id: string,
    updatedData: any
  ): any | null {
    const state = this.getState();
    const items = (state[collection] as any[]) || [];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updatedData };
    state[collection] = items as any;

    // Actualizar estado de stock si se modificó un medicamento
    if (collection === 'medicamentos') {
      this.updateMedicamentoStatus(items[index] as Medicamento);
    }

    // Auto-registrar evento de auditoría
    this.recordAuditLog(state, 'EDITAR', collection as ModuloNombre, `Modificación de registro en ${String(collection)} ID: ${id}`);

    this.saveState(state);
    return items[index];
  }

  public static delete<K extends keyof CDIDataState>(
    collection: K,
    id: string
  ): boolean {
    const state = this.getState();
    const items = (state[collection] as any[]) || [];
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;

    state[collection] = filtered as any;
    
    // Auto-registrar evento de auditoría
    this.recordAuditLog(state, 'ELIMINAR', collection as ModuloNombre, `Eliminación de registro en ${String(collection)} ID: ${id}`);

    this.saveState(state);
    return true;
  }

  private static recordAuditLog(state: CDIDataState, accion: any, modulo: ModuloNombre, detalle: string) {
    if (!state.registrosAuditoria) state.registrosAuditoria = [];
    const log = {
      id: `aud-${Date.now()}`,
      fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuarioId: 'usr-current',
      nombreUsuario: 'Usuario Activo',
      rolNombre: 'Operador CDI',
      modulo: modulo || 'dashboard',
      accion: accion || 'VER',
      detalle,
      direccionIP: '192.168.1.100',
      dispositivo: 'Web App / Android PWA',
      severidad: 'INFO' as const
    };
    state.registrosAuditoria.unshift(log);
  }

  private static handleFarmaciaStockUpdate(state: CDIDataState, mov: MovimientoFarmacia): void {
    const medIndex = state.medicamentos.findIndex((m) => m.id === mov.medicamentoId);
    if (medIndex === -1) return;

    const med = state.medicamentos[medIndex];
    if (mov.tipoMovimiento.startsWith('Entrada')) {
      med.stockActual += Number(mov.cantidad);
    } else if (mov.tipoMovimiento.startsWith('Salida') || mov.tipoMovimiento.startsWith('Merma')) {
      med.stockActual = Math.max(0, med.stockActual - Number(mov.cantidad));
    } else if (mov.tipoMovimiento.startsWith('Ajuste')) {
      med.stockActual = Number(mov.cantidad);
    }

    this.updateMedicamentoStatus(med);
  }

  private static updateMedicamentoStatus(med: Medicamento): void {
    if (med.stockActual === 0) {
      med.estado = 'Agotado';
    } else if (med.stockActual <= med.stockMinimo) {
      med.estado = 'Stock Bajo';
    } else {
      med.estado = 'Disponible';
    }
  }

  public static getKPIs(): KPIStats {
    const state = this.getState();
    const totalPacientes = state.pacientes.length;
    const todayStr = new Date().toISOString().split('T')[0];

    const citasHoy = state.citas.filter((c) => c.fecha === todayStr || c.fecha === '2025-02-15').length;
    const citasPendientes = state.citas.filter((c) => c.estado === 'Pendiente' || c.estado === 'Confirmada' || c.estado === 'En Triaje').length;
    const medicamentosCriticos = state.medicamentos.filter((m) => m.stockActual <= m.stockMinimo).length;
    const despachosHoy = state.movimientosFarmacia.filter((m) => m.tipoMovimiento.startsWith('Salida')).length;
    
    const camasTotales = (state.camasHospitalarias || []).length || 12;
    const camasOcupadas = (state.camasHospitalarias || []).filter((c) => c.estado === 'Ocupada').length || 2;
    const ocupacionCamasPorcentaje = camasTotales > 0 ? Math.round((camasOcupadas / camasTotales) * 100) : 0;
    
    const empleadosActivos = state.empleados.filter((e) => e.estado === 'Activo').length;
    const turnosActivos = state.horarios.filter((h) => h.estado === 'Activo').length;

    const urgenciasActivas = (state.registrosTriaje || []).filter((t) => t.estado === 'En Espera' || t.estado === 'En Atención').length;
    const laboratoriosPendientes = (state.ordenesLaboratorio || []).filter((l) => l.estado === 'Solicitado' || l.estado === 'En Proceso').length;
    const imagenesPendientes = (state.estudiosImagen || []).filter((i) => i.estado === 'Pendiente' || i.estado === 'Adquirido').length;
    const pacientesHospitalizados = (state.admisionesHospitalarias || []).filter((a) => a.estado === 'Ingresado' || a.estado === 'En Observación').length;
    const teleconsultasHoy = (state.teleconsultas || []).filter((t) => t.estadoLlamada === 'Programada' || t.estadoLlamada === 'En Curso').length;
    const casosEpidemiologicosSemana = (state.casosEpidemiologicos || []).length;

    return {
      totalPacientes,
      citasHoy,
      citasPendientes,
      medicamentosCriticos,
      despachosHoy,
      ocupacionCamasPorcentaje,
      empleadosActivos,
      turnosActivos,
      urgenciasActivas,
      laboratoriosPendientes,
      imagenesPendientes,
      pacientesHospitalizados,
      teleconsultasHoy,
      casosEpidemiologicosSemana
    };
  }

  public static resetToDefaults(): void {
    const initial = getInitialDataState();
    this.saveState(initial);
  }

  public static exportJSON(): string {
    const state = this.getState();
    return JSON.stringify(state, null, 2);
  }

  public static importJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr) as CDIDataState;
      if (parsed && parsed.pacientes && parsed.medicamentos && parsed.departamentos) {
        this.saveState(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing JSON', e);
      return false;
    }
  }
}

